// Which school a first-email nudge should be about.
//
// Split out of app/api/cron/first-email so it can be tested in plain node:
// the route imports the staff directory and the Supabase admin client, and
// the email template imports the shell, so neither can be loaded without
// Next's module resolution. Same reason lib/blocked-form-hosts.js exists.
//
// It is worth testing because this is exactly where the 2026-11-10 bug lived.
// The old line was:
//
//   const withEmail = mine.find((c) => c.email.trim());
//
// which is correct for "is there anyone to write to" and wrong for "what
// should this email say". One address out of ten put the whole account in
// 'write' mode, and the nine schools that could not be written to at all were
// never mentioned. The send screen disables them with no explanation, so the
// athlete's roster looked finished and was not.
//
// No imports on purpose. Keep it that way.

/** A target before a dream: the first email should be one they will send. */
const byTier = (a, b) => {
  const rank = { target: 0, safety: 1, dream: 2 };
  return (rank[a?.tier] ?? 3) - (rank[b?.tier] ?? 3);
};

const hasAddress = (c) => !!String(c?.email || '').trim();
const hasSchool = (c) => !!String(c?.school || '').trim();

/** True once any coach has been written to, through the app or by hand. */
export function hasContactedAnyone(coaches) {
  return (coaches || []).some(
    (c) => c?.last_emailed_at || (c?.status && c.status !== 'not_contacted')
  );
}

/**
 * @param {Array} coaches one athlete's roster
 * @returns {{mode:'write'|'find'|'schools', write:object|null, stranded:Array}}
 *   mode     which shape of email to send
 *   write    the coach to write to, when there is one
 *   stranded every school with no address, worst-first by tier. Its length is
 *            reported in BOTH 'write' and 'find' mode.
 */
export function chooseFirstEmailTarget(coaches) {
  const mine = (coaches || []).filter(Boolean);
  const stranded = mine.filter((c) => !hasAddress(c) && hasSchool(c)).sort(byTier);
  const write = mine.filter(hasAddress).sort(byTier)[0] || null;

  if (write) return { mode: 'write', write, stranded };
  if (stranded.length) return { mode: 'find', write: null, stranded };
  return { mode: 'schools', write: null, stranded: [] };
}
