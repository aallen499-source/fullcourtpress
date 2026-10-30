// Tests for the health check's two alert decisions.
//
// These exist because of a specific failure recorded in the route itself: the
// camps check shipped with a regex that could never match, so the very first
// alert it ever sent was a false alarm. An alarm that is wrong before it is
// ever right does not get fixed, it gets ignored — and then the real outage
// goes unnoticed too. So the decisions get tested, even though the plumbing
// around them cannot be without a database.
//
// What this covers: when to shout about a dead cron, and which incomplete
// signups count. What it does not: that the route is wired to these, that
// Resend delivers, or that the cron is scheduled. Those need the real thing.
//
//   node scripts/test-health-alerts.mjs

import { heartbeatVerdict, strandedSignups, STALE_AFTER_HOURS, SIGNUP_GRACE_HOURS }
  from '../lib/health-alerts.js';

const H = 3600000;
const NOW = Date.parse('2026-10-30T20:00:00Z');
const ago = (hours) => new Date(NOW - hours * H).toISOString();

let failed = 0;
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { failed++; console.log(`  FAIL ${name}\n    got  ${JSON.stringify(got)}\n    want ${JSON.stringify(want)}`); }
  else console.log(`  ok   ${name}`);
};

console.log('heartbeat');
// The case that matters most: never having heard from the cron must NOT alarm,
// or the check cries wolf on the very first run after deploying, before the
// migration has been run and before the dispatcher has ever written a row.
check('no row yet is not an alarm',
  heartbeatVerdict(null, NOW).problem, null);
check('a run six hours ago is fine',
  heartbeatVerdict({ last_run_at: ago(6), last_status: 'ok' }, NOW).problem, null);
check('just inside the window is fine',
  heartbeatVerdict({ last_run_at: ago(STALE_AFTER_HOURS - 0.1), last_status: 'ok' }, NOW).problem, null);
check('just outside the window alarms',
  heartbeatVerdict({ last_run_at: ago(STALE_AFTER_HOURS + 0.1), last_status: 'ok' }, NOW).problem !== null, true);
check('two missed days alarms',
  heartbeatVerdict({ last_run_at: ago(50), last_status: 'ok' }, NOW).problem !== null, true);
check('a partial run alarms even when recent',
  heartbeatVerdict({ last_run_at: ago(1), last_status: 'partial', detail: { failed: ['challenge'] } }, NOW).problem !== null, true);
check('the partial alarm names the broken job',
  heartbeatVerdict({ last_run_at: ago(1), last_status: 'partial', detail: { failed: ['challenge'] } }, NOW).problem.includes('challenge'), true);
check('a stale run wins over a partial one',
  heartbeatVerdict({ last_run_at: ago(50), last_status: 'partial', detail: { failed: ['x'] } }, NOW).problem.includes('has not run'), true);

console.log('stranded signups');
const users = [
  { id: 'a', email: 'has@profile.test',   email_confirmed_at: ago(99), created_at: ago(99) },
  { id: 'b', email: 'never@confirmed.test', email_confirmed_at: null,  created_at: ago(99) },
  { id: 'c', email: 'just@signedup.test', email_confirmed_at: ago(0.2), created_at: ago(0.2) },
  { id: 'd', email: 'stuck@yesterday.test', email_confirmed_at: ago(30), created_at: ago(30) },
  { id: 'e', email: 'stuck@lastweek.test', email_confirmed_at: ago(170), created_at: ago(170) },
];
const got = strandedSignups(users, ['a'], NOW);
check('an account with a profile is not stranded', got.some((u) => u.email === 'has@profile.test'), false);
check('never confirmed is not our problem', got.some((u) => u.email === 'never@confirmed.test'), false);
check('mid-signup is inside the grace period', got.some((u) => u.email === 'just@signedup.test'), false);
check('confirmed and stuck is reported', got.map((u) => u.email), ['stuck@yesterday.test', 'stuck@lastweek.test']);
check('newest first, so the freshest lead is actionable', got[0].email, 'stuck@yesterday.test');
check('nobody stranded returns empty, not an alarm', strandedSignups([], [], NOW).length, 0);
check('grace period is an hour', SIGNUP_GRACE_HOURS, 1);

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
