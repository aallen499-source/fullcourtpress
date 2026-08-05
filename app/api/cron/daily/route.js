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
  for (const [name, run] of jobs) {
    try {
      const res = await run(request);
      results[name] = {
        status: res.status,
        // Each job returns Response.json(...); surface it so a single daily log
        // line shows what every job did. Non-JSON (e.g. a 401 text body) is
        // tolerated rather than throwing.
        body: await res.json().catch(() => null),
      };
    } catch (err) {
      results[name] = { error: String(err?.message || err) };
    }
  }

  return Response.json({ ran: new Date().toISOString(), results });
}
