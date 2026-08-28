// One cron to run every scheduled email job in sequence.
//
// Why this exists: Vercel's Hobby plan caps a project at 2 cron jobs, and we
// have more scheduled jobs than that (subscription reminders, the signups
// digest, camp reminders, and the weekly newsletter). Rather than pay for Pro
// to schedule them, one cron hits this endpoint and it fans out to each route
// handler in turn. Jobs that aren't due — the newsletter on six days out of
// seven — decide that for themselves and return a no-op.
//
// The routes are left exactly as they were — still independently
// callable, still doing their own auth. This dispatcher just invokes each
// GET(request) with the same request, so the CRON_SECRET header Vercel sends
// reaches each one. Each job is wrapped so one failure can't abort the others:
// a bad address in camp reminders must not stop the subscription reminders.

import { GET as subscriptionReminders } from '@/app/api/cron/subscription-reminders/route';
import { GET as dailyDigest } from '@/app/api/cron/daily-digest/route';
import { GET as campReminders } from '@/app/api/cron/camp-reminders/route';
import { GET as newsletter } from '@/app/api/cron/newsletter/route';

function isAuthorized(request) {
  // Fail closed — an unset CRON_SECRET would otherwise make "Bearer undefined"
  // a valid credential. Same guard the individual routes use.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const jobs = [
    ['subscriptionReminders', subscriptionReminders],
    ['dailyDigest', dailyDigest],
    ['campReminders', campReminders],
    // Weekly, not daily: the route no-ops on six days out of seven. Running it
    // from here rather than as its own Vercel cron leaves the Hobby plan's
    // second slot free.
    ['newsletter', newsletter],
  ];

  const results = {};
  const summary = [];
  for (const [name, run] of jobs) {
    try {
      const res = await run(request);
      const body = await res.json().catch(() => null);
      results[name] = { status: res.status, body };
      // One short human-readable clause per job. `sent` is the field the two
      // reminder jobs return; the digest reports differently, so fall back to
      // the status. This is what shows in Vercel's log "Messages" column, so
      // a glance at the daily run tells you what happened without opening
      // anything or checking an inbox.
      // For the reminder jobs, log the whole breakdown — sent, why others were
      // skipped, and any send failures — so a run that sends nothing explains
      // itself instead of just reading "sent 0".
      if (body && typeof body.sent === 'number') {
        summary.push(`${name}: ${JSON.stringify(body)}`);
      } else {
        summary.push(`${name}: status ${res.status}`);
      }
    } catch (err) {
      results[name] = { error: String(err?.message || err) };
      summary.push(`${name}: ERROR ${err?.message || err}`);
    }
  }

  // console.log because this runs unattended — the line lands in Vercel's
  // function logs, which is the only place anyone sees a cron's output.
  console.log(`[cron/daily] ${summary.join(' | ')}`);

  return Response.json({ ran: new Date().toISOString(), results });
}
