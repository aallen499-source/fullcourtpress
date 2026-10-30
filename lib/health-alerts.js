// The two judgement calls the health check has to make, kept apart from the
// check itself so they can be tested without a database or a Resend key.
//
// They are separated for a reason recorded in the route: the camps check once
// shipped with a regex that could never match, so the first alert it ever sent
// was a false alarm. An alarm that is wrong before it is ever right does not
// get fixed, it gets ignored — and the real outage after it goes unnoticed
// too. Anything that decides whether to wake Angela up gets tested.
//
// Tests: scripts/test-health-alerts.mjs

// The daily cron runs at 14:00 UTC and writes its heartbeat at the end; this
// check runs at 20:00 the same day. So on a healthy day the heartbeat it reads
// is about 6 hours old, and if a single daily run is missed the next check
// sees roughly 30. Any threshold between those two works; 26 sits in the
// middle with hours of slack either side, so one slow run cannot trip it and
// one missed run cannot hide behind it. It alarms after a single missed day,
// before a second day of emails is lost.
export const STALE_AFTER_HOURS = 26;
// Somebody signing up this minute has not finished yet. An hour of grace keeps
// a person who is mid-flow out of an alert about broken signups.
export const SIGNUP_GRACE_HOURS = 1;

/**
 * Should a heartbeat row produce an alert, and what should it say?
 *
 * Split out of the handler so the decision can be tested without a database,
 * because the expensive lesson in this file is that an alarm which cries wolf
 * once is never believed again. `beat` is the cron_runs row or null.
 */
export function heartbeatVerdict(beat, now = Date.now()) {
  // Not an alarm. The table may be new or the dispatcher may not have deployed
  // yet; "I have never heard from it" is not the same as "it has stopped".
  if (!beat) return { note: 'no heartbeat yet — not treated as a problem', problem: null };
  const hours = (now - new Date(beat.last_run_at).getTime()) / 3600000;
  const note = `last ran ${hours.toFixed(1)}h ago (${beat.last_status})`;
  if (hours > STALE_AFTER_HOURS) {
    return {
      note,
      problem:
        `<b>The daily email cron has not run for ${Math.floor(hours)} hours.</b> Setup nudges, ` +
        `first-email nudges, the 7-day challenge, camp reminders and the newsletter are all ` +
        `dispatched from it, so every scheduled email has silently stopped. Nobody gets an ` +
        `error when a cron stops firing — check the Cron tab in the Vercel project.`,
    };
  }
  if (beat.last_status === 'partial') {
    const failed = (beat.detail?.failed || []).join(', ') || 'unknown';
    return {
      note,
      problem:
        `<b>The daily cron ran but some jobs failed:</b> ${failed}. The rest still ran — the ` +
        `dispatcher isolates each job — so this is one broken job, not a dead cron.`,
    };
  }
  return { note, problem: null };
}

/**
 * Which auth users are stranded: confirmed an email address, past the grace
 * period, and still have no profile row.
 *
 * Only confirmed accounts count. Someone who never clicked the link made a
 * choice or lost it to a spam folder — that is funnel leakage, and alerting on
 * it daily would be noise that trains you to ignore the alert.
 */
export function strandedSignups(users, profileIds, now = Date.now()) {
  const have = profileIds instanceof Set ? profileIds : new Set(profileIds);
  return users
    .filter((u) => !have.has(u.id))
    .filter((u) => u.email_confirmed_at)
    .map((u) => ({ email: u.email, age: (now - new Date(u.created_at).getTime()) / 3600000 }))
    .filter((u) => u.age > SIGNUP_GRACE_HOURS)
    .sort((a, b) => a.age - b.age);
}
