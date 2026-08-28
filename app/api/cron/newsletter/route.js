import { createAdminClient } from '@/lib/supabase-admin';
import { newsletterEmail } from '@/lib/emails/newsletter';

// The weekly newsletter.
//
// Sent by the daily cron, which calls this and gets a no-op on six days out of
// seven (see SEND_WEEKDAY). Folding it into the existing dispatcher rather than
// adding a second Vercel cron keeps the Hobby plan's one remaining slot free.
//
// Sent directly through Resend's send API rather than Resend Broadcasts. The
// argument for Broadcasts is the 100/day free-tier cap and their audience
// management — but audiences would become a SECOND source of truth for who is
// opted in, needing a webhook to stay in sync with profiles.email_newsletter,
// and a subscriber list that disagrees with itself is how people get mail they
// unsubscribed from. One table decides, and at this list size the cap is not
// close. Revisit past a few hundred subscribers, where the cap starts to bind
// and the sync cost is worth paying.

function isAuthorized(request) {
  // Fail closed: an unset CRON_SECRET would make "Bearer undefined" a valid
  // credential, opening the endpoint rather than closing it.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

const SITE = 'https://recruitgrid.app';

// Tuesday. Sunday is 0. Camp registrations tend to get dealt with early in the
// week, and a weekend send competes with everything else in a family's inbox.
const SEND_WEEKDAY = 2;

// "Just added" looks back slightly further than seven days so a skipped run
// doesn't drop a camp out of the newsletter entirely.
const NEW_LOOKBACK_DAYS = 9;
const UPCOMING_DAYS = 30;
const MAX_CAMPS_PER_SECTION = 6;

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();
  // ?force=1 sends regardless of weekday, for testing a real send by hand.
  const forced = new URL(request.url).searchParams.get('force') === '1';
  if (!forced && now.getUTCDay() !== SEND_WEEKDAY) {
    return Response.json({ sent: 0, reason: 'not send day' });
  }

  const admin = createAdminClient();

  const { data: subscribers, error: subErr } = await admin
    .from('profiles')
    .select('id, name, login_email, sport, unsubscribe_token')
    .eq('email_newsletter', true);

  if (subErr) {
    return Response.json({ error: subErr.message }, { status: 500 });
  }
  if (!subscribers?.length) {
    return Response.json({ sent: 0, reason: 'no subscribers' });
  }

  const today = ymd(now);
  const since = ymd(new Date(now.getTime() - NEW_LOOKBACK_DAYS * 86400000));
  const horizon = ymd(new Date(now.getTime() + UPCOMING_DAYS * 86400000));

  // Newly verified camps that haven't already happened. A camp added this week
  // whose date has passed is not news to anybody.
  const { data: newCamps } = await admin
    .from('camps')
    .select('school, camp_name, date, city, state, cost, source_url, sport, verified_at')
    .gte('verified_at', since)
    .gte('date', today)
    .order('date')
    .limit(40);

  const { data: upcoming } = await admin
    .from('camps')
    .select('school, camp_name, date, city, state, cost, source_url, sport')
    .gte('date', today)
    .lte('date', horizon)
    .order('date')
    .limit(60);

  // Don't repeat a camp in both sections — "just added" wins, since that's the
  // one that's actually new information.
  const key = (c) => `${c.school}|${c.camp_name}|${c.date}`;
  const newKeys = new Set((newCamps || []).map(key));
  const upcomingAll = (upcoming || []).filter((c) => !newKeys.has(key(c)));

  const sportOf = (s) => (s || '').split('-')[0];

  let sent = 0;
  const skipped = { noEmail: 0, nothingToSay: 0 };
  const failures = [];

  for (const p of subscribers) {
    if (!p.login_email) {
      skipped.noEmail++;
      continue;
    }

    // Filter to the athlete's sport when we know it. A volleyball family does
    // not want a list of baseball camps, and sending one teaches them to stop
    // opening these. Unknown sport gets everything rather than nothing.
    const want = (p.sport || '').trim().toLowerCase();
    const mine = (list) =>
      (want ? list.filter((c) => sportOf(c.sport) === want) : list).slice(0, MAX_CAMPS_PER_SECTION);

    const mineNew = mine(newCamps || []);
    const mineUpcoming = mine(upcomingAll);

    const { subject, html } = newsletterEmail({
      firstName: (p.name || '').trim().split(/\s+/)[0] || '',
      newCamps: mineNew,
      upcomingCamps: mineUpcoming,
      unsubscribeUrl: `${SITE}/unsubscribe?t=${p.unsubscribe_token}&type=newsletter`,
      now,
    });

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'RecruitGrid <notifications@recruitgrid.app>',
          to: p.login_email,
          subject,
          html,
          // type=newsletter matters: a one-click unsubscribe from this email
          // must not also switch off the camp reminders they asked for.
          headers: {
            'List-Unsubscribe': `<${SITE}/api/unsubscribe?t=${p.unsubscribe_token}&type=newsletter>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
      sent++;
    } catch (e) {
      failures.push({ user: p.id, error: String(e.message || e) });
    }
  }

  return Response.json({
    sent,
    subscribers: subscribers.length,
    newCamps: (newCamps || []).length,
    upcoming: upcomingAll.length,
    skipped,
    failures,
  });
}
