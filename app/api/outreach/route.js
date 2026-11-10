import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

// Sends one personal email to one family, from the owner's own address.
//
// Deliberately one at a time. There is no "send all" here and there should
// not be: the whole value of these notes is that a person read the account
// and wrote to that specific family. A bulk button would quietly turn them
// back into a campaign.
//
// Plain text, not HTML. See lib/outreach.js for why.

const FROM = 'Angela at RecruitGrid <info@recruitgrid.app>';
const REPLY_TO = 'info@recruitgrid.app';

/** The auth record is the truth for where mail goes, not profiles.login_email. */
async function authEmailFor(admin, userId) {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) return null;
  return data?.user?.email || null;
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in again.' }, { status: 401 });

  const admin = createAdminClient();
  const { data: me } = await admin
    .from('profiles').select('id, is_owner').eq('id', user.id).maybeSingle();
  if (!me?.is_owner) return Response.json({ error: 'Not allowed.' }, { status: 403 });

  const { userId, kind, subject, body, again } = await request.json().catch(() => ({}));
  if (!userId || !subject?.trim() || !body?.trim()) {
    return Response.json({ error: 'Missing recipient, subject or message.' }, { status: 400 });
  }

  // The address is resolved server-side from the id. The page never gets to
  // say who this goes to, so an edited or stale client can't misdirect it.
  const to = await authEmailFor(admin, userId);
  if (!to) return Response.json({ error: 'That account has no email address.' }, { status: 400 });

  // Sending to yourself is how she tests the wording, so it stays allowed.
  if (!again) {
    const { data: prior } = await admin
      .from('outreach_sends')
      .select('sent_at')
      .eq('user_id', userId).eq('kind', kind || 'note')
      .order('sent_at', { ascending: false }).limit(1);
    if (prior?.length) {
      return Response.json(
        { error: 'already-sent', sentAt: prior[0].sent_at, to },
        { status: 409 }
      );
    }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    // `text` and no `html`: what she proofread on the page is exactly what
    // lands, with no template wrapped around it.
    body: JSON.stringify({ from: FROM, reply_to: REPLY_TO, to, subject, text: body }),
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    // A 403 here is almost always the domain-scoped Resend key, which 400s or
    // 403s on anything that isn't recruitgrid.app. Say so rather than making
    // her read a raw API error.
    return Response.json({ error: `Resend ${res.status}: ${detail}` }, { status: 502 });
  }

  // Logged after the send, so a failed send never looks like a delivered one.
  const { error: logErr } = await admin.from('outreach_sends').insert({
    user_id: userId,
    kind: kind || 'note',
    to_email: to,
    subject,
    body,
    sent_by: me.id,
  });

  // The email has already gone at this point, so this is not an error: it is a
  // warning that the duplicate-send guard is blind for this person. Swallowing
  // it would be worse than useless, because the next press would look like a
  // first send and the family would get the same note twice. The usual cause is
  // supabase/74-outreach-sends.sql not having been run yet.
  if (logErr) {
    return Response.json({ ok: true, to, warning: `Sent, but not recorded: ${logErr.message}` });
  }

  return Response.json({ ok: true, to });
}
