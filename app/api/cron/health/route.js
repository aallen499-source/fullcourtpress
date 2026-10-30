import { createAdminClient } from '@/lib/supabase-admin';
import { heartbeatVerdict, strandedSignups } from '@/lib/health-alerts';

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
  //
  //    Counted by LINKS to state pages, not by the "(2)" counts beside each
  //    state. The first version matched /\(\s*\d+\s*\)/ against the raw HTML
  //    and found zero every single time: React splits that text across
  //    elements, so the digit and its brackets are never adjacent in the
  //    markup, only in the rendered text. It sent a false alarm on its first
  //    run — which is the worse failure for an alarm, because the way you stop
  //    trusting one is for it to be wrong before it is ever right.
  //
  //    An href is structural. It survives restyling, re-wording and whatever
  //    React does to the text nodes, and if there are no state-page links on
  //    the index then the directory really is empty.
  try {
    const res = await fetch(`${SITE}/camps`, { cache: 'no-store' });
    const html = await res.text();
    const linked = new Set(html.match(/\/camps\/[a-z0-9-]+\/[a-z0-9-]+/g) || []).size;
    checks.campsPageStatus = res.status;
    checks.campsPageLinked = linked;
    if (res.status !== 200 || linked === 0) {
      problems.push(
        `<b>/camps is not listing any state pages</b> (HTTP ${res.status}, ${linked} links) even ` +
        `though the database has ${upcoming ?? 'an unknown number of'} upcoming camps. That ` +
        `usually means a stale cache: redeploy on Vercel to clear it.`
      );
    }
  } catch (e) {
    checks.campsPageStatus = `FAILED: ${e.message}`;
    problems.push(`<b>/camps could not be fetched:</b> ${e.message}`);
  }

  // 4. Did the daily email cron actually run? This is the check the old
  //    arrangement could not make, because health was the last job INSIDE that
  //    cron: if it stopped firing, this stopped with it and the silence read
  //    as a quiet day. It has its own schedule now, six hours after the daily
  //    run, and the heartbeat (supabase/69) is how it can tell.
  //
  //    A missing row is NOT an alarm. The table may be new, or the dispatcher
  //    may not have deployed yet, and the fastest way to make an alarm useless
  //    is for it to be wrong before it has ever been right — the camps check
  //    above learned that the expensive way. Only a row that EXISTS and has
  //    gone stale means something broke.
  try {
    const admin = createAdminClient();
    const { data: beat } = await admin
      .from('cron_runs').select('last_run_at, last_status, detail').eq('job', 'daily').maybeSingle();
    const verdict = heartbeatVerdict(beat);
    checks.dailyCron = verdict.note;
    if (verdict.problem) problems.push(verdict.problem);
  } catch (e) {
    checks.dailyCron = `FAILED: ${e.message}`;
  }

  // 5. Signups that never became accounts. There is no trigger creating a
  //    profile row — the app writes one when the workspace first loads — so a
  //    signup that stalls leaves an auth.users row with nothing attached, and
  //    every other query we have starts FROM profiles and cannot see it.
  //
  //    Only the CONFIRMED ones are a problem. Somebody who never clicked the
  //    confirmation link made a choice, or lost the email to a spam folder;
  //    that is funnel leakage and emailing about it daily would be noise.
  //    Somebody who confirmed and still never reached the workspace got past
  //    every step we control and then hit something — that is ours.
  try {
    const admin = createAdminClient();
    // Paged deliberately. PostgREST caps an unbounded select at 1000 rows, and
    // a truncated list here does not fail — it silently turns every profile
    // past the first 1000 into a "stranded signup" and emails about accounts
    // that are perfectly fine. A monitoring check that invents its own alerts
    // as the site grows is worse than no check, so it reads all of them or
    // throws trying.
    const profileIds = [];
    for (let from = 0; from < 100000; from += 1000) {
      const { data, error } = await admin.from('profiles').select('id').range(from, from + 999);
      if (error) throw new Error(error.message);
      profileIds.push(...(data || []));
      if ((data?.length || 0) < 1000) break;
    }
    const users = [];
    for (let page = 1; page < 50; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error(error.message);
      users.push(...(data?.users || []));
      if (!data?.users?.length || data.users.length < 1000) break;
    }
    const stranded = strandedSignups(users, profileIds.map((r) => r.id));
    checks.strandedSignups = stranded.length;
    if (stranded.length) {
      const list = stranded.slice(0, 10)
        .map((s) => `${s.email} (${Math.floor(s.age / 24)}d ago)`).join(', ');
      problems.push(
        `<b>${stranded.length} signup${stranded.length === 1 ? '' : 's'} confirmed an email ` +
        `address and never reached the workspace:</b> ${list}. They have no profile row, so they ` +
        `are invisible to every other check and no activation email will ever reach them. They ` +
        `got through every step we control, so something after confirmation is failing them — ` +
        `worth signing up yourself once to see what they saw.`
      );
    }
  } catch (e) {
    checks.strandedSignups = `FAILED: ${e.message}`;
  }

  if (!problems.length) {
    return Response.json({ ok: true, checks });
  }

  const mail = await alert(
    `RecruitGrid needs attention — ${problems.length} problem${problems.length === 1 ? '' : 's'}`,
    [
      ...problems,
      `<span style="color:#6B6E75;font-size:13px;">Checked ${new Date().toUTCString()}. ` +
      `This runs on its own daily schedule, six hours after the email cron, so that it can ` +
      `still report when that cron is the thing that broke.</span>`,
    ]
  );

  return Response.json({ ok: false, problems: problems.length, checks, mail });
}
