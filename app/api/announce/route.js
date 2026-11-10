import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { announcementEmail, addressesAnnouncementEmail, nextStepFor } from '@/lib/emails/announcement';
import { sendEmail } from '@/lib/parent-weekly';
import { staffDirectoryFor } from '@/lib/staff-directory';
import { sportOf } from '@/lib/staff-page-parser';
import { genderOfText } from '@/lib/list-matches';
import { addressStats, addressNextStep } from '@/lib/announce-addresses';

// The owner's "what's new" send. Three modes:
//   count   — how many accounts would get it, sending nothing
//   preview — send the owner's own copy to the owner
//   send    — send to every account that hasn't had THIS campaign
//
// Only a profile with is_owner (set by hand in SQL, protected from browser
// writes — supabase/56) may call it.
//
// Campaigns. The September 2026 email stamped profiles.announce_features_sent_at,
// which made a second announcement impossible: everyone who got the first was
// stamped. Each campaign now has a key and a row per account in
// announcement_sends (supabase/76). A second press, or a retry after a
// failure, reaches only people who haven't had this campaign.

export const maxDuration = 60;
const SITE = 'https://recruitgrid.app';
const BATCH = 100; // Resend's batch endpoint limit

// The current campaign. Change this when the next announcement is written.
const CAMPAIGN = 'coach-addresses-2026-11';

// profiles.login_email is kept in step with the sign-in address at sign-in
// (auth/callback), so accounts that haven't signed in since that was added can
// have it empty or stale. The auth record is the truth for where mail goes.
async function authEmails(admin) {
  const byId = new Map();
  for (let page = 1; page < 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) break;
    for (const u of data?.users || []) if (u.email) byId.set(u.id, u.email);
    if (!data?.users?.length || data.users.length < 1000) break;
  }
  return byId;
}

async function accountsWithSteps(admin, ids, emails) {
  const [{ data: profiles }, { data: coaches }] = await Promise.all([
    admin.from('profiles').select('id, name, login_email, role, sport, public_published, unsubscribe_token, email_product_updates, is_owner').in('id', ids),
    admin.from('coaches').select('user_id, school, level, sport, email, status, last_emailed_at').in('user_id', ids),
  ]);

  // Resolve every blank school on every roster to its directory URL once,
  // then fetch the contacts for all of those pages in one query. 44 accounts
  // and a few schools each: small, but it should not be N+1 at 4,400 either.
  const resolved = (coaches || []).map((c) => {
    const sportName = c.sport || (profiles || []).find((p) => p.id === c.user_id)?.sport || '';
    return {
      user_id: c.user_id, school: c.school, email: c.email,
      directoryUrl: staffDirectoryFor(c.school || '', { level: c.level }) || '',
      sportKey: sportOf(sportName),
      gender: genderOfText(sportName) || '',
    };
  });
  const urls = [...new Set(resolved.filter((c) => c.directoryUrl && !String(c.email || '').trim()).map((c) => c.directoryUrl))];
  const contacts = new Map();
  for (let i = 0; i < urls.length; i += 100) {
    const { data } = await admin.from('coach_contacts')
      .select('source_url, sport, name, title, email, kind, rank, gender, checked_at')
      .in('source_url', urls.slice(i, i + 100));
    for (const r of data || []) {
      if (!contacts.has(r.source_url)) contacts.set(r.source_url, []);
      contacts.get(r.source_url).push(r);
    }
  }

  return (profiles || []).map((p) => {
    const mine = resolved.filter((c) => c.user_id === p.id);
    const fallback = nextStepFor({
      coaches: mine.length,
      withEmail: mine.filter((c) => (c.email || '').trim()).length,
      contacted: (coaches || []).filter((c) => c.user_id === p.id && (c.last_emailed_at || (c.status && c.status !== 'not_contacted'))).length,
      published: !!p.public_published,
    });
    const stats = addressStats(mine, contacts);
    const { subject, html } = addressesAnnouncementEmail({
      firstName: String(p.name || '').trim().split(/\s+/)[0] || '',
      nextStep: addressNextStep(stats, fallback),
      unsubscribeUrl: `${SITE}/unsubscribe?t=${p.unsubscribe_token}&type=updates`,
    });
    return { p, to: emails.get(p.id) || p.login_email, subject, html, stats };
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
    const [mine] = await accountsWithSteps(admin, [me.id], new Map([[me.id, user.email]]));
    try {
      await sendEmail({ to: user.email, subject: `[Preview] ${mine.subject}`, html: mine.html });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 502 });
    }
    return Response.json({ ok: true, to: user.email, campaign: CAMPAIGN, stats: mine.stats });
  }

  const emails = await authEmails(admin);
  const [{ data: all, error }, { data: already }] = await Promise.all([
    admin.from('profiles').select('id, role, login_email').neq('email_product_updates', false).eq('is_owner', false),
    admin.from('announcement_sends').select('user_id').eq('campaign', CAMPAIGN),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const had = new Set((already || []).map((r) => r.user_id));
  const ids = (all || [])
    .filter((p) => p.role !== 'coach' && !had.has(p.id) && (emails.get(p.id) || p.login_email))
    .map((p) => p.id);

  if (mode === 'count') return Response.json({ ok: true, count: ids.length, campaign: CAMPAIGN });
  if (mode !== 'send') return Response.json({ error: 'Unknown mode.' }, { status: 400 });
  if (!ids.length) return Response.json({ ok: true, sent: 0, campaign: CAMPAIGN });

  const outgoing = await accountsWithSteps(admin, ids, emails);
  let sent = 0;
  const failures = [];
  for (let i = 0; i < outgoing.length; i += BATCH) {
    const chunk = outgoing.slice(i, i + BATCH);
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(
        chunk.map(({ p, to, subject, html }) => ({
          from: 'Angela at RecruitGrid <notifications@recruitgrid.app>',
          reply_to: 'info@recruitgrid.app',
          to,
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
    // Stamped per batch AFTER Resend accepts it, so a failed batch is retried
    // by the next press and a successful one never goes twice.
    const { error: stampErr } = await admin
      .from('announcement_sends')
      .upsert(chunk.map((c) => ({ user_id: c.p.id, campaign: CAMPAIGN })), { onConflict: 'user_id,campaign' });
    if (stampErr) failures.push(`sent but not recorded (run supabase/76?): ${stampErr.message}`);
    sent += chunk.length;
  }
  return Response.json({ ok: failures.length === 0, sent, failures, campaign: CAMPAIGN });
}
