import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { announcementEmail, nextStepFor } from '@/lib/emails/announcement';
import { sendEmail } from '@/lib/parent-weekly';

// The owner's "what's new" send. Three modes:
//   count   — how many accounts would get it, sending nothing
//   preview — send the owner's own copy to the owner
//   send    — send to every account that hasn't had it
//
// Only a profile with is_owner (set by hand in SQL, protected from browser
// writes — supabase/56) may call it. announce_features_sent_at is stamped per
// account as each batch succeeds, so a second press, or a retry after a
// failure, only reaches people who haven't had it.

export const maxDuration = 60;
const SITE = 'https://recruitgrid.app';
const BATCH = 100; // Resend's batch endpoint limit

async function accountsWithSteps(admin, ids) {
  const [{ data: profiles }, { data: coaches }] = await Promise.all([
    admin.from('profiles').select('id, name, login_email, role, public_published, unsubscribe_token, email_product_updates, announce_features_sent_at, is_owner').in('id', ids),
    admin.from('coaches').select('user_id, email, status, last_emailed_at').in('user_id', ids),
  ]);
  return (profiles || []).map((p) => {
    const mine = (coaches || []).filter((c) => c.user_id === p.id);
    const step = nextStepFor({
      coaches: mine.length,
      withEmail: mine.filter((c) => (c.email || '').trim()).length,
      contacted: mine.filter((c) => c.last_emailed_at || (c.status && c.status !== 'not_contacted')).length,
      published: !!p.public_published,
    });
    const { subject, html } = announcementEmail({
      firstName: String(p.name || '').trim().split(/\s+/)[0] || '',
      nextStep: step,
      unsubscribeUrl: `${SITE}/unsubscribe?t=${p.unsubscribe_token}&type=updates`,
    });
    return { p, subject, html };
  });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in again.' }, { status: 401 });

  const admin = createAdminClient();
  const { data: me } = await admin.from('profiles').select('id, login_email, is_owner').eq('id', user.id).maybeSingle();
  if (!me?.is_owner) return Response.json({ error: 'Not allowed.' }, { status: 403 });

  const mode = (await request.json().catch(() => ({})))?.mode;

  if (mode === 'preview') {
    const [mine] = await accountsWithSteps(admin, [me.id]);
    try {
      await sendEmail({ to: me.login_email || user.email, subject: `[Preview] ${mine.subject}`, html: mine.html });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 502 });
    }
    return Response.json({ ok: true, to: me.login_email || user.email });
  }

  const { data: eligible, error } = await admin
    .from('profiles')
    .select('id, role')
    .not('login_email', 'is', null)
    .is('announce_features_sent_at', null)
    .neq('email_product_updates', false)
    .eq('is_owner', false);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const ids = (eligible || []).filter((p) => p.role !== 'coach').map((p) => p.id);

  if (mode === 'count') return Response.json({ ok: true, count: ids.length });
  if (mode !== 'send') return Response.json({ error: 'Unknown mode.' }, { status: 400 });
  if (!ids.length) return Response.json({ ok: true, sent: 0 });

  const emails = await accountsWithSteps(admin, ids);
  let sent = 0;
  const failures = [];
  for (let i = 0; i < emails.length; i += BATCH) {
    const chunk = emails.slice(i, i + BATCH);
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(
        chunk.map(({ p, subject, html }) => ({
          from: 'Angela at RecruitGrid <notifications@recruitgrid.app>',
          reply_to: 'info@recruitgrid.app',
          to: p.login_email,
          subject,
          html,
          headers: {
            'List-Unsubscribe': `<${SITE}/api/unsubscribe?t=${p.unsubscribe_token}&type=updates>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }))
      ),
    });
    if (!res.ok) {
      failures.push(`${res.status}: ${(await res.text()).slice(0, 300)}`);
      continue;
    }
    const at = new Date().toISOString();
    await admin.from('profiles').update({ announce_features_sent_at: at }).in('id', chunk.map((c) => c.p.id));
    sent += chunk.length;
  }
  return Response.json({ ok: failures.length === 0, sent, failures });
}
