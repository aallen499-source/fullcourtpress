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

// ---------------------------------------------------------------------------
// The public school page: one contact per sport section.
//
// /coaches/<school> lists every section the school's directory has, with the
// one person to write to in each, so a family searching "<school> softball
// coach email" lands on the answer rather than on a link to go and find it.
// The paid Coach Finder is the search ACROSS schools; this is one school's
// own page, which the school itself publishes.

const SPORT_LABELS = {
  football: 'Football', basketball: 'Basketball', volleyball: 'Volleyball', baseball: 'Baseball',
  softball: 'Softball', soccer: 'Soccer', lacrosse: 'Lacrosse', wrestling: 'Wrestling', golf: 'Golf',
  tennis: 'Tennis', swimming: 'Swimming and Diving', track: 'Track and Field', hockey: 'Hockey',
  'field hockey': 'Field Hockey', rowing: 'Rowing', gymnastics: 'Gymnastics',
};
const GENDER_WORD = { men: "Men's", women: "Women's", both: "Men's and Women's" };
const GENDER_ORDER = { men: 0, women: 1, both: 2, '': 3 };

/**
 * Group one directory's rows into sport sections, each with its best contact.
 * A section is the heading as the school wrote it ("Women's Soccer"); flat
 * directories with no headings fall back to sport and gender.
 * @param {Array} rows  coach_contacts rows for ONE source_url
 * @returns {Array<{key, label, sport, gender, best, coaches, staff, unlisted, checkedAt}>}
 */
export function sectionsFor(rows) {
  const groups = new Map();
  for (const r of rows || []) {
    if (!r || !r.sport) continue;
    const gender = r.gender || '';
    const heading = (r.heading || '').trim();
    const key = heading ? `${r.sport}|${gender}|${heading.toLowerCase()}` : `${r.sport}|${gender}|`;
    if (!groups.has(key)) {
      const label = heading || [GENDER_WORD[gender], SPORT_LABELS[r.sport] || r.sport].filter(Boolean).join(' ');
      groups.set(key, { key, label, sport: r.sport, gender, rows: [] });
    }
    groups.get(key).rows.push(r);
  }
  return [...groups.values()]
    .map(({ rows: group, ...g }) => ({ ...g, ...chooseSuggestion(group) }))
    .filter((g) => g.best || g.unlisted.length)
    .sort((a, b) => (SPORT_LABELS[a.sport] || a.sport).localeCompare(SPORT_LABELS[b.sport] || b.sport) || GENDER_ORDER[a.gender] - GENDER_ORDER[b.gender] || a.label.localeCompare(b.label));
}
