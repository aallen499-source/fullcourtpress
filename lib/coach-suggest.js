// Which contact to suggest for one school and sport, from coach_contacts.
//
// The rows come from the school's own staff directory (supabase/75,
// scripts/extract-coach-contacts.mjs). This decides what the add-coach form
// shows: a coach with a published address if there is one, otherwise the
// program's own staff contact, clearly labelled, otherwise an honest
// "they list N coaches and publish no addresses".
//
// Never auto-filled. The form shows the suggestion with where it came from
// and when it was read, and the athlete taps to accept. A wrong suggestion
// a parent can see is recoverable; a wrong address sent to a coach under
// RecruitGrid's name is not.
//
// Gender: a row's gender comes from the directory heading ("Women's
// Volleyball" -> 'women', "Volleyball" -> ''). An unmarked row fits either
// request; a marked row only fits its own. 'both' ("Men's and Women's Track")
// fits either.
//
// No Next imports, so `node scripts/test-coach-suggest.mjs` can load it.

import { staffRank } from './staff-page-parser.js';

export function genderFits(rowGender, want) {
  if (!want || !rowGender || rowGender === 'both') return true;
  return rowGender === want;
}

// At equal rank, the row whose heading names the athlete's gender wins over
// a combined "Men's and Women's" program, which wins over an unmarked one.
// A women's player asking about basketball should get the women's head
// coach, not the first head coach alphabetically.
const specificity = (rowGender, want) => (!want ? 0 : rowGender === want ? 0 : rowGender === 'both' ? 1 : 2);
const byCoachRank = (want) => (a, b) =>
  (a.rank ?? 9) - (b.rank ?? 9) || specificity(a.gender, want) - specificity(b.gender, want) || String(a.name).localeCompare(String(b.name));
const byStaffRank = (want) => (a, b) =>
  staffRank(a.title) - staffRank(b.title) || specificity(a.gender, want) - specificity(b.gender, want) || String(a.name).localeCompare(String(b.name));

/**
 * @param {Array} rows  coach_contacts rows for ONE source_url and ONE sport
 * @param {{gender?: 'men'|'women'|''}} [opts]
 * @returns {{
 *   best: object|null,        the row to show, coach before staff
 *   coaches: Array,           coaches with an address, best first
 *   staff: Array,             non-coaches with an address, best first
 *   unlisted: Array,          coaches the page names but gives no address for
 *   checkedAt: string|null,   when the directory was read
 * }}
 */
export function chooseSuggestion(rows, { gender = '' } = {}) {
  const fit = (rows || []).filter((r) => r && genderFits(r.gender, gender));
  const coaches = fit.filter((r) => r.kind === 'coach' && r.email).sort(byCoachRank(gender));
  const staff = fit.filter((r) => r.kind === 'staff' && r.email).sort(byStaffRank(gender));
  const unlisted = fit.filter((r) => r.kind === 'coach' && !r.email).sort(byCoachRank(gender));
  const checkedAt = fit.map((r) => r.checked_at).filter(Boolean).sort().at(-1) || null;
  return { best: coaches[0] || staff[0] || null, coaches, staff, unlisted, checkedAt };
}

/** "hpusharks.com", for "from hpusharks.com, checked 10 Nov". */
export function hostOf(url) {
  try { return new URL(url).host.replace(/^www\./, ''); } catch { return ''; }
}
