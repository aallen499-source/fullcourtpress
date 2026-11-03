import { createAdminClient } from '@/lib/supabase-admin';
import { signupReminderEmail } from '@/lib/emails/signup-reminder';

// One reminder, once, to somebody who asked for a sign-in link and never
// clicked it (supabase/73). Runs from the daily cron.
//
// THE GAP THIS FILLS. Sign-in is a magic link, so an account that never
// confirms is not a partial signup — it is nothing. No profile row, by design,
// which means no setup nudge, no challenge, nothing in this project can reach
// them. Their link died after an hour. 13 of 51 signups sat in that state on
// 2026-11-03, some since August, and not one of them was ever going to hear
// from us again.
//
// WHY 24 HOURS, AND WHY ONLY ONCE. A day is long enough that they have had a
// proper chance at the first email and short enough that they still remember
// signing up. Once, because they typed an address into a box — that is not
// consent to a sequence, and a second chase to somebody who ignored the first
// is how a sending domain earns complaints. The primary key on signup_reminders
// is the user id and the row is written BEFORE the send, so even a double run
// of this job cannot produce a second email.
//
// WHY NOT THE OLD BACKLOG. Only accounts from the last 7 days. Emailing
// everyone who abandoned a signup in August the moment this deploys would be a
// campaign triggered by a deployment, which is exactly the mistake migration
// 70's backfill made. The older ones are a decision for Angela to make by
// hand, not a side effect of shipping this.

const WINDOW_HOURS = 24;
const MAX_AGE_DAYS = 7;
const SITE = 'https://recruitgrid.app';

function isAuthorized(request) {
  // Fail closed — an unset CRON_SECRET would make "Bearer undefined" valid.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  const admin = createAdminClient();
  const now = Date.now();

  // Everyone unconfirmed, inside the age window. Read from auth.users because
  // these people are deliberately absent from profiles.
  const candidates = [];
  try {
    for (let page = 1; page < 50; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error(error.message);
      for (const u of data?.users || []) {
        if (u.email_confirmed_at || !u.email) continue;
        const ageHours = (now - new Date(u.created_at).getTime()) / 3600000;
        if (ageHours < WINDOW_HOURS) continue;
        if (ageHours > MAX_AGE_DAYS * 24) continue;
        candidates.push(u);
      }
      if (!data?.users?.length || data.users.length < 1000) break;
    }
  } catch (e) {
    return Response.json({ error: `listUsers failed: ${e.message}` }, { status: 500 });
  }

  if (!candidates.length) return Response.json({ sent: 0, reason: 'nobody due' });

  // Who has already had theirs, or asked not to be contacted. One read rather
  // than one per candidate.
  const { data: already, error: readErr } = await admin
    .from('signup_reminders')
    .select('user_id')
    .in('user_id', candidates.map((u) => u.id));
  if (readErr) return Response.json({ error: readErr.message }, { status: 500 });
  const done = new Set((already || []).map((r) => r.user_id));

  let sent = 0;
  const failures = [];
  const skipped = { alreadySent: 0 };

  for (const u of candidates) {
    if (done.has(u.id)) { skipped.alreadySent++; continue; }

    // Claim BEFORE sending. If the insert wins we own this send; if it fails
    // on the primary key somebody already sent it. Doing it the other way
    // round means a crash between send and record produces a second email on
    // the next run, and the one guarantee this job makes is "only once".
    const { data: claim, error: claimErr } = await admin
      .from('signup_reminders')
      .insert({ user_id: u.id, email: u.email })
      .select('stop_token')
      .single();
    if (claimErr) {
      // 23505 is a unique violation: a concurrent run got there first, which
      // is the system working, not an error worth reporting.
      if (claimErr.code !== '23505') failures.push({ user: u.id, error: claimErr.message });
      else skipped.alreadySent++;
      continue;
    }

    // A real sign-in link, generated rather than sent by Supabase, so it goes
    // out through Resend from recruitgrid.app like everything else here.
    // Verifying a magiclink token confirms the address as well as signing them
    // in, which is exactly what these people never got to do.
    let signInUrl;
    try {
      const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: u.email,
        options: { redirectTo: `${SITE}/auth/callback?next=%2Fapp` },
      });
      if (linkErr) throw new Error(linkErr.message);
      signInUrl = link?.properties?.action_link;
      if (!signInUrl) throw new Error('generateLink returned no action_link');
    } catch (e) {
      // The claim row is already written, so leaving it would silently burn
      // this person's one reminder on a send that never happened. Give it back.
      await admin.from('signup_reminders').delete().eq('user_id', u.id);
      failures.push({ user: u.id, error: `generateLink: ${e.message}` });
      continue;
    }

    const { subject, html } = signupReminderEmail({
      signInUrl,
      stopUrl: `${SITE}/api/signup-reminder-stop?t=${claim.stop_token}`,
    });

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Angela at RecruitGrid <notifications@recruitgrid.app>',
          reply_to: 'info@recruitgrid.app',
          to: u.email,
          subject,
          html,
          headers: {
            'List-Unsubscribe': `<${SITE}/api/signup-reminder-stop?t=${claim.stop_token}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
      sent++;
    } catch (e) {
      // Same reasoning as above: an unsent reminder must not count as sent.
      await admin.from('signup_reminders').delete().eq('user_id', u.id);
      failures.push({ user: u.id, error: String(e.message || e) });
    }
  }

  return Response.json({ sent, due: candidates.length, skipped, failures });
}
