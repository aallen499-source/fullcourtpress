// One cron to run all three daily email jobs in sequence.
//
// Why this exists: Vercel's Hobby plan caps a project at 2 cron jobs, and we
// have three daily jobs (subscription reminders, the signups digest, camp
// reminders). Rather than pay for Pro just to schedule a third cron, one cron
// hits this endpoint and it fans out to the three route handlers in turn.
//
// The three routes are left exactly as they were — still independently
// callable, still doing their own auth. This dispatcher just invokes each
// GET(request) with the same request, so the CRON_SECRET header Vercel sends
// reaches each one. Each job is wrapped so one failure can't abort the others:
// a bad address in camp reminders must not stop the subscription reminders.

import { GET as subscriptionReminders } from '@/app/api/cron/subscription-reminders/route';
import { GET as dailyDigest } from '@/app/api/cron/daily-digest/route';
import { GET as campReminders } from '@/app/api/cron/camp-reminders/route';

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
      const sent = body && typeof body.sent === 'number' ? `sent ${body.sent}` : `status ${res.status}`;
      summary.push(`${name}: ${sent}`);
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
