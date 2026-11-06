// Split out of questionnaire-directory.js so it can be tested without the
// @/ import alias, the same reason lib/health-alerts.js exists.
//
// Tests: scripts/test-blocked-hosts.mjs

// Hosts that never serve a usable recruiting questionnaire, blocked before
// anything they point at can reach the site.
//
// This exists because approved submissions bypass every check the catalogue is
// built on. There is no render, no empty-form test and no reading of the page
// — an approved row goes straight to the directory. On 2026-11-05, seven of
// 106 approved submissions were FieldLevel links, every one of them men's
// basketball, and they had been live for some time.
//
// That is not carelessness by whoever submitted them. It is the predictable
// result of searching for a form that does not exist: high-major men's
// basketball mostly does not take questionnaires, so a search surfaces a page
// titled "<School> Men's Basketball Recruiting Questionnaire" that answers 200
// with the right school and the right sport on it — and contains no
// questionnaire, only "<School> would like you to complete a FieldLevel
// recruiting profile" and buttons to a competitor's signup. All 116 FieldLevel
// rows were removed from the catalogue on 2026-09-11 for exactly this. The
// submissions table was the door nobody closed.
//
// questionnaire.frontrush.com is here for a different reason: the subdomain is
// NXDOMAIN on every resolver, so it resolves to nothing at all. Grand Canyon
// lost nine forms to it and McGill thirteen.
//
// A blocklist is the right shape because both failures are properties of the
// HOST, not of any one link. Adding to it is a decision about a platform, so
// each entry carries the date and the reason.
export const BLOCKED_FORM_HOSTS = [
  // 2026-09-11: a competitor's account-signup wall, not a questionnaire.
  'fieldlevel.com',
  // 2026-09-11: NXDOMAIN, the whole subdomain is gone.
  'questionnaire.frontrush.com',
];

/** True when a URL points at a host that cannot serve a real questionnaire. */
export function isBlockedFormUrl(url) {
  const u = String(url || '').toLowerCase();
  if (!u) return false;
  return BLOCKED_FORM_HOSTS.some(
    (h) => u.includes(`//${h}/`) || u.includes(`//www.${h}/`) || u.includes(`.${h}/`)
  );
}
