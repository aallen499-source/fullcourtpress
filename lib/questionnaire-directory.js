// Shared helpers for the PUBLIC questionnaire directory pages.
//
// These pages exist for search, not for the app: "georgia basketball recruiting
// questionnaires" is exactly what a parent types at 11pm, and nobody else has
// this list assembled. They are deliberately ungated — unlike the camp
// catalogue, questionnaires are free for everyone inside the app too, so
// publishing them costs nothing and gives Google something real to index.
//
// Data is the curated file plus anything approved into the shared list. The
// approved rows are readable by anon (see migration 34's select policy), so a
// logged-out visitor and the server see the same directory.

import { QUESTIONNAIRES } from './questionnaires';

export const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

// Canadian provinces, kept SEPARATE from STATE_NAMES rather than merged into
// it. STATE_NAMES is imported by ten files, including the quiz and the setup
// wizard's "what state are you in?" picker and the coaches directory — none of
// which have Canadian data. Merging would have put Ontario in an athlete's
// home-state dropdown and generated /coaches/state/ontario pages with nothing
// on them.
//
// No code collides with a US state: all 51 keys in STATE_NAMES were checked
// against all 13 provinces and territories and the intersection is empty. So a
// two-letter code is still unambiguous and the `state` column did not need a
// migration, a prefix or a separate country field.
export const PROVINCE_NAMES = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
  NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
  SK: 'Saskatchewan', YT: 'Yukon',
};

// What the QUESTIONNAIRE directory resolves against. Everything else keeps
// using STATE_NAMES, which is how the blast radius stays at the questionnaire
// pages instead of the whole site.
export const REGION_NAMES = { ...STATE_NAMES, ...PROVINCE_NAMES };

export const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const stateSlugToCode = (slug) =>
  Object.keys(REGION_NAMES).find((code) => slugify(REGION_NAMES[code]) === slug) || null;

/**
 * Every questionnaire row as [school, state, level, gender, sport, url].
 * Approved submissions are merged in ahead of the curated file so a row that
 * exists in both keeps the richer approved record.
 *
 * Deduped on school+gender+sport, NOT on url. Deduping by url silently hid 309
 * of 1,920 rows: plenty of schools run one athletics-wide form for every
 * programme, so their eleven rows share one link by design — questionnaires.js
 * says so at the top ("Repeated URLs here are not duplicates to be cleaned
 * up") and McNeese has been the worked example since the file was written.
 * Keying on the url meant only the alphabetically-first sport survived, so
 * Alcorn State showed under Baseball and vanished from Basketball, and the
 * whole of Charleston, McDaniel, Ouachita and West Liberty lost 12 rows each.
 *
 * school is slugged for the key, which also collapses the spelling variants
 * schoolIndex already has to handle, and lets an approved submission override
 * a curated row even when someone typed the school name slightly differently.
 */
export async function getAllQuestionnaires(supabase) {
  let approved = [];
  if (supabase) {
    const { data } = await supabase
      .from('questionnaire_submissions')
      .select('school, state, level, gender, sport, url')
      .eq('status', 'approved');
    approved = data || [];
  }
  const seen = new Set();
  const byUrl = new Set();
  const out = [];
  const identity = (row) =>
    `${slugify(row[0])}|${(row[3] || '').toLowerCase()}|${(row[4] || '').toLowerCase()}`;
  // Second key, on the URL. Deduping on the school NAME alone is not enough,
  // because an approved submission spells a school however the submitter typed
  // it: "Cal Poly" and "California Polytechnic State University" slugify
  // differently, both survive, and the California basketball page lists one
  // school twice. Same for "Fresno State" against "Fresno State University"
  // and "Cal State Northridge" against "California State University,
  // Northridge" — all three were live on 2026-11-05.
  //
  // The URL is the thing that is actually unique: two rows pointing at the same
  // ARMS hash are the same form at the same school whatever either calls it.
  // This file's own catalogue header records the same lesson from Sewanee,
  // where one form appeared under two spellings and put a school on the
  // Tennessee index page twice.
  //
  // Trailing slashes and case are normalised so a submission that differs only
  // in punctuation does not slip past.
  const urlKey = (u) =>
    `${String(u || '').trim().toLowerCase().replace(/\/+$/, '')}|`;
  const push = (row) => {
    if (!row[5] || !row[0]) return;
    const key = identity(row);
    if (seen.has(key)) return;
    const uk = urlKey(row[5]) + (row[3] || '').toLowerCase() + '|' + (row[4] || '').toLowerCase();
    if (byUrl.has(uk)) return;
    seen.add(key);
    byUrl.add(uk);
    out.push(row);
  };
  approved.forEach((s) =>
    push([s.school || '', s.state || '', s.level || '', s.gender || '', s.sport || '', s.url])
  );
  QUESTIONNAIRES.forEach(push);
  return out;
}

/** Sport+state combinations that actually have rows — the pages worth building. */
export function directoryIndex(rows) {
  const map = new Map();
  for (const [, state, , , sport] of rows) {
    if (!sport || !REGION_NAMES[state]) continue;
    const key = `${sport}|${state}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  const index = {};
  for (const [key, count] of map) {
    const [sport, state] = key.split('|');
    (index[sport] ||= []).push({ state, count });
  }
  for (const sport of Object.keys(index)) {
    index[sport].sort((a, b) => REGION_NAMES[a.state].localeCompare(REGION_NAMES[b.state]));
  }
  return index;
}

const LEVEL_ORDER = { D1: 1, D2: 2, D3: 3, NAIA: 4, JUCO: 5, USCAA: 6 };

export function rowsFor(rows, sportSlug, stateCode) {
  return rows
    .filter(([, st, , , sport]) => st === stateCode && slugify(sport) === sportSlug)
    .sort(
      (a, b) =>
        (LEVEL_ORDER[a[2]] || 9) - (LEVEL_ORDER[b[2]] || 9) || a[0].localeCompare(b[0])
    );
}

// ---------------------------------------------------------------------------
// Division pages: /questionnaires/<level>/<sport>.
//
// The sport+state pages answer "who in my state", and the school pages answer
// "this one college". Neither answers the question families actually ask out
// loud — "which D3 programs can I write to?" — and every row here has carried
// a level since the file was written. Thirty-odd pages out of data already on
// disk, aimed at searches nothing on the site could rank for.
//
// They live under the same [sport]/[state] route, with the level in the first
// segment: no sport is called d1 or juco and no state slug is a sport name, so
// "d3/basketball" and "basketball/arizona" can never be confused for one
// another. USCAA is left out on purpose — three rows is not a page.
//
// Each level carries its own explanation because that is the difference
// between thirty useful pages and thirty near-duplicates with a filtered list
// on them. What is written here is the same thing the division guide says at
// more length: no promises, no rankings, just what the level means for someone
// deciding where to send a form.
// ---------------------------------------------------------------------------

export const LEVELS = [
  {
    code: 'D1', slug: 'd1', name: 'Division I',
    blurb:
      'The most competitive level, with the earliest recruiting and the fewest roster spots. Scholarships exist but are limited and, in most sports, split between players. Questionnaires matter less here than being seen — staffs mostly recruit from club and grassroots events and, increasingly, the transfer portal — but a form still puts a name and a class year in their database.',
  },
  {
    code: 'D2', slug: 'd2', name: 'Division II',
    blurb:
      'Athletic scholarships exist and are usually partial, often combined with academic aid. Recruiting is more regional than Division I and runs later into the year, which means an email in the spring of senior year is still worth sending. Coaches at this level read their own mail and answer it more often than most families expect.',
  },
  {
    code: 'D3', slug: 'd3', name: 'Division III',
    blurb:
      'No athletic scholarships at all — the money comes from academic and need-based aid, which at many of these schools is substantial enough to cost a family less than a partial scholarship elsewhere. Because there is no money to negotiate, coaches here rely on questionnaires and direct email more than any other level. This is the list where filling in forms genuinely starts conversations.',
  },
  {
    code: 'NAIA', slug: 'naia', name: 'NAIA',
    blurb:
      'Smaller colleges outside the NCAA, with their own eligibility centre and their own rules — scholarships are available, and coaches can talk to athletes earlier than NCAA staff can. Timelines run later, rosters turn over faster, and a good NAIA program can be a stronger playing opportunity than a seat at the end of a bigger bench.',
  },
  {
    code: 'JUCO', slug: 'juco', name: 'Junior college',
    blurb:
      'Two-year colleges, and the most under-rated path there is: a way to play immediately, fix a transcript, grow into a body, and transfer to a four-year school with tape that proves it. Junior college coaches recruit late and keep recruiting into the summer, so this is the list that is still live when others have closed.',
  },
  {
    code: 'USPORTS', slug: 'usports', name: 'U SPORTS (Canada)',
    blurb:
      'The Canadian university level, and a real option that almost no American recruiting tool covers. Fifty-six universities in four conferences; football is twenty-seven of them. Athletic awards exist and are capped well below a US full ride, but tuition is a fraction of a US private school, so the total cost to a family is often lower rather than higher. Recruiting runs late by American standards — staffs are still signing players in the spring — and a questionnaire carries more weight here than at NCAA Division I, because there is no portal culture and far less grassroots scouting of US athletes. Eligibility is governed by U SPORTS rather than the NCAA, so check directly with the programme before assuming anything carries over.',
  },
];

const LEVEL_BY_SLUG = new Map(LEVELS.map((l) => [l.slug, l]));

/** The level for a URL segment, or undefined when it isn't one. */
export const levelFromSlug = (slug) => LEVEL_BY_SLUG.get(String(slug || '').toLowerCase());

/** Every row at one level in one sport, sorted by state then school. */
export function rowsForLevel(rows, levelCode, sportSlug) {
  return rows
    .filter(([, st, level, , sport]) => level === levelCode && slugify(sport) === sportSlug && REGION_NAMES[st])
    .sort((a, b) => (STATE_NAMES[a[1]] || '').localeCompare(STATE_NAMES[b[1]] || '') || a[0].localeCompare(b[0]));
}

/**
 * Level+sport combinations worth a page, as { [levelCode]: [{ sport, count }] }.
 *
 * MIN_ROWS keeps the thin ones out. A page listing four schools is a page
 * Google is right to ignore, and it would dilute the ones that list sixty.
 */
export function levelIndex(rows, MIN_ROWS = 12) {
  const map = new Map();
  for (const [, state, level, , sport] of rows) {
    if (!sport || !REGION_NAMES[state] || !LEVELS.some((l) => l.code === level)) continue;
    const key = `${level}|${sport}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  const index = {};
  for (const [key, count] of map) {
    if (count < MIN_ROWS) continue;
    const [level, sport] = key.split('|');
    (index[level] ||= []).push({ sport, count });
  }
  for (const level of Object.keys(index)) index[level].sort((a, b) => b.count - a.count || a.sport.localeCompare(b.sport));
  return index;
}

export const teamLabel = (gender) =>
  gender === 'Both' ? "Men's & women's" : gender === 'Men' ? "Men's" : gender === 'Women' ? "Women's" : '';

// ---------------------------------------------------------------------------
// Per-school pages.
//
// Search Console says parents don't search the way this directory was built.
// Nobody types "Iowa questionnaires by sport" — they type "iowa state football
// recruiting questionnaire". Those queries already reach page one (positions 8
// and 9) off the sport/state pages, which merely happen to mention the school
// in passing. A page that is actually about the school should do better, and
// there are 242 of them sitting in data we already have.
// ---------------------------------------------------------------------------

/**
 * Group rows by school, keyed on the slug.
 *
 * Slugging first also merges spelling variants of the same school — the data
 * carries "Hawai'i Pacific University" and "Hawaiʻi Pacific University", and
 * "University of Maryland" with a comma, a hyphen and neither. Ten schools
 * were duplicated this way. Grouping on the slug collapses them into one page
 * instead of splitting a school's questionnaires across two.
 */
export function schoolIndex(rows) {
  const map = new Map();
  for (const row of rows) {
    const [school, state, level] = row;
    if (!school || !REGION_NAMES[state]) continue;
    const slug = slugify(school);
    if (!slug) continue;
    let entry = map.get(slug);
    if (!entry) {
      entry = { slug, state, level, rows: [], names: new Map() };
      map.set(slug, entry);
    }
    entry.rows.push(row);
    // Display name is whichever spelling appears most often; ties keep the one
    // seen first, so the choice is stable between builds.
    entry.names.set(school, (entry.names.get(school) || 0) + 1);
    if (!entry.level && level) entry.level = level;
  }

  const index = {};
  for (const [slug, entry] of map) {
    let best = null;
    let bestCount = -1;
    for (const [name, count] of entry.names) {
      if (count > bestCount) {
        best = name;
        bestCount = count;
      }
    }
    entry.name = best;
    entry.rows.sort(
      (a, b) => (a[4] || '').localeCompare(b[4] || '') || (a[3] || '').localeCompare(b[3] || '')
    );
    delete entry.names;
    index[slug] = entry;
  }
  return index;
}
