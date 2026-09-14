// "On your list": which camps and showcases involve the schools an athlete has
// already put on their roster.
//
// This is the thing none of the recruiting platforms do. Profile sites sell
// being found, event companies sell events, and nobody joins a family's list
// of schools to where those schools' coaches will actually be. The data to do
// it lives here already: every camp row names its school, and every listed
// showcase names the programs attending (lib/showcases.js).
//
// It is also the reason to add coaches at all. Twenty of the first twenty-two
// accounts never added one; a list that immediately answers "where can I be
// seen by these schools" gives that step a payoff.
//
// Matching is deliberately conservative. A missed match costs a family nothing
// they had before; a wrong one sends them to an event their school is not at.
// So a school matches only when the two names reduce to exactly the same key,
// and a sport that can be read off the roster row (or the profile) must agree.

import { isShowcase, namedPrograms } from './showcases';

// The same reduction the roster already uses to link questionnaires (normSchool
// in app/app/page.jsx) — case, punctuation and filler words stripped, "state"
// kept because Texas State is not Texas — plus the two spellings that most
// often split one school in two on camp pages: "St." for Saint, and "Cal State"
// for California State.
export function schoolKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\([^)]{4,}\)/g, '')
    .replace(/&/g, ' and ')
    .replace(/\bst\.?(?=\s)/g, 'saint')
    .replace(/\bcal state\b/g, 'california state')
    .replace(/\b(university|college|of|the|at)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const SPORT_WORDS = [
  ['basketball', /basketball|hoops/],
  ['baseball', /baseball/],
  ['softball', /softball/],
  ['volleyball', /volleyball/],
  ['soccer', /soccer/],
  ['football', /football/],
  ['tennis', /tennis/],
  ['track', /track|cross country/],
  ['dance', /dance/],
];

/** The sport slug a free-text roster value names, or '' when it names none. */
export function sportOfText(raw) {
  const v = String(raw || '').toLowerCase();
  const hit = SPORT_WORDS.find(([, re]) => re.test(v));
  return hit ? hit[0] : '';
}

/** 'men', 'women' or '' from free text like "Women's Soccer". Checked women-first: "women" contains "men". */
export function genderOfText(raw) {
  const v = String(raw || '').toLowerCase();
  if (/\b(women|womens|women's|girls?|ladies)\b/.test(v)) return 'women';
  if (/\b(men|mens|men's|boys?)\b/.test(v)) return 'men';
  return '';
}

/**
 * Upcoming events that involve schools on the athlete's list, one entry per
 * event, soonest first.
 *
 * @param coaches      roster rows ({ school, sport, tier })
 * @param camps        catalogue rows, already filtered to listable, future dates
 * @param profileSport the athlete's own sport, used when a roster row names none
 * @returns [{ camp, kind: 'camp' | 'showcase', schools: [{ name, tier }] }]
 */
export function listMatches(coaches, camps, profileSport = '') {
  const fallbackSport = sportOfText(profileSport);

  // One entry per school on the list, keeping the best-known tier and the
  // sport/gender the athlete gave for that program.
  const listed = new Map();
  for (const c of coaches || []) {
    const key = schoolKey(c.school);
    if (!key) continue;
    const prev = listed.get(key);
    listed.set(key, {
      name: prev?.name || String(c.school).trim(),
      tier: prev?.tier || c.tier || '',
      sport: prev?.sport || sportOfText(c.sport) || fallbackSport,
      gender: prev?.gender || genderOfText(c.sport),
    });
  }
  if (!listed.size) return [];

  const out = [];
  for (const camp of camps || []) {
    const [campSport, campGender] = String(camp.sport || '').split('-');
    const keys = isShowcase(camp) ? namedPrograms(camp).map(schoolKey) : [schoolKey(camp.school)];
    const schools = [];
    const seen = new Set();
    for (const key of keys) {
      const entry = listed.get(key);
      if (!entry || seen.has(key)) continue;
      if (entry.sport && campSport && entry.sport !== campSport) continue;
      if (entry.gender && campGender && campGender !== 'coed' && entry.gender !== campGender) continue;
      seen.add(key);
      schools.push({ name: entry.name, tier: entry.tier });
    }
    if (schools.length) out.push({ camp, kind: isShowcase(camp) ? 'showcase' : 'camp', schools });
  }

  // Undated camps sort last; everything else by date.
  return out.sort((a, b) => (a.camp.date || '9999').localeCompare(b.camp.date || '9999'));
}
