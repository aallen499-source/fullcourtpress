import { createAdminClient } from '@/lib/supabase-admin';

// Does the site still work? Emails Angela when it doesn't.
//
// Written after 2026-10-15, when unpaid Supabase invoices suspended the
// project and nothing said so. Every database read failed; the camp directory
// does not 404 on an empty page, it redirects to /camps (5ba7475), so all ~79
// state pages served a 308 into an index that was itself empty. Google spent
// the day following permanent redirects out of the best-ranked pages on the
// site, the homepage quietly served its hardcoded fallback counts — numbers
// plausible enough that nobody would look twice — and sign-in was dead. It was
// found by accident, hours later, while asking for something unrelated.
//
// The failure mode worth designing against is not "the site is down". It is
// "the site is down and looks fine".
//
// Deliberately NOT dependent on the database to report that the database is
// broken: the check talks to Postgres, the alarm goes out through Resend.
// Email is the right channel because it is the one Angela actually reads, and
// because a Vercel log nobody opens is how this went unnoticed in the first
// place.

const SITE = 'https://recruitgrid.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@recruitgrid.app';

function isAuthorized(request) {
  // Fail closed — an unset CRON_SECRET would make "Bearer undefined" a valid
  // credential, opening the endpoint rather than closing it.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

async function alert(subject, lines) {
  if (!process.env.RESEND_API_KEY) return { sent: false, reason: 'no RESEND_API_KEY' };
  const body = lines.map((l) => `<p style="margin:0 0 10px;font:15px/1.5 -apple-system,Arial,sans-serif;">${l}</p>`).join('');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'RecruitGrid <notifications@recruitgrid.app>',
      to: ADMIN_EMAIL,
      subject,
      html: `<div style="max-width:540px;">${body}</div>`,
    }),
  });
  return { sent: res.ok, status: res.status };
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const problems = [];
  const checks = {};

  // 1. Can we read the database at all?
  let upcoming = null;
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from('camps')
      .select('id', { count: 'exact', head: true })
      .gte('date', today);
    if (error) throw new Error(error.message);
    upcoming = count ?? 0;
    checks.database = 'ok';
  } catch (e) {
    checks.database = `FAILED: ${e.message}`;
    problems.push(
      `<b>The database is unreachable.</b> Every camp page is redirecting to an empty /camps, ` +
      `nobody can sign in, and the homepage is showing its fallback numbers. ` +
      `Check <a href="https://supabase.com/dashboard">supabase.com/dashboard</a> first — ` +
      `an unpaid invoice suspends the project, which is what happened on 15 October.`
    );
  }

  // 2. Is there anything left to show? An empty catalogue is not an error, but
  //    it has the same effect on the directory as an outage, so it is worth an
  //    email either way.
  if (upcoming !== null) {
    checks.upcomingCamps = upcoming;
    if (upcoming === 0) {
      problems.push(
        `<b>No upcoming camps.</b> The catalogue has nothing dated today or later, so every ` +
        `camp directory page is redirecting to /camps and the whole directory is effectively ` +
        `offline to search engines. Time to add camps, not to debug.`
      );
    } else if (upcoming < 25) {
      problems.push(
        `<b>Only ${upcoming} upcoming camps left.</b> Pages with nothing on them redirect away, ` +
        `so the directory is shrinking. Worth a collection pass.`
      );
    }
  }

  // 3. Does the public page a stranger would land on actually render camps?
  //    Checks the real path — rendering, ISR cache and all — not just the data
  //    behind it, because a stale cache can keep serving a broken page for an
  //    hour after the database recovers.
  try {
    const res = await fetch(`${SITE}/camps`, { cache: 'no-store' });
    const html = await res.text();
    const listed = [...html.matchAll(/\((\s*\d+\s*)\)/g)].reduce((n, m) => n + Number(m[1]), 0);
    checks.campsPageStatus = res.status;
    checks.campsPageListed = listed;
    if (res.status !== 200 || listed === 0) {
      problems.push(
        `<b>/camps is not showing any camps</b> (HTTP ${res.status}, ${listed} listed) even though ` +
        `the database has ${upcoming ?? 'an unknown number of'} upcoming. That usually means a ` +
        `stale cache: redeploy on Vercel to clear it.`
      );
    }
  } catch (e) {
    checks.campsPageStatus = `FAILED: ${e.message}`;
    problems.push(`<b>/camps could not be fetched:</b> ${e.message}`);
  }

  if (!problems.length) {
    return Response.json({ ok: true, checks });
  }

  const mail = await alert(
    `RecruitGrid needs attention — ${problems.length} problem${problems.length === 1 ? '' : 's'}`,
    [
      ...problems,
      `<span style="color:#6B6E75;font-size:13px;">Checked ${new Date().toUTCString()}. ` +
      `This runs once a day from the daily cron.</span>`,
    ]
  );

  return Response.json({ ok: false, problems: problems.length, checks, mail });
}
