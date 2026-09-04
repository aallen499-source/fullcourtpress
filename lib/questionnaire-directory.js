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

export const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const stateSlugToCode = (slug) =>
  Object.keys(STATE_NAMES).find((code) => slugify(STATE_NAMES[code]) === slug) || null;

/**
 * Every questionnaire row as [school, state, level, gender, sport, url].
 * Approved submissions are merged in ahead of the curated file so a row that
 * exists in both keeps the richer approved record; deduped by URL.
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
  const out = [];
  const push = (row) => {
    if (!row[5] || !row[0] || seen.has(row[5])) return;
    seen.add(row[5]);
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
    if (!sport || !STATE_NAMES[state]) continue;
    const key = `${sport}|${state}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  const index = {};
  for (const [key, count] of map) {
    const [sport, state] = key.split('|');
    (index[sport] ||= []).push({ state, count });
  }
  for (const sport of Object.keys(index)) {
    index[sport].sort((a, b) => STATE_NAMES[a.state].localeCompare(STATE_NAMES[b.state]));
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
    if (!school || !STATE_NAMES[state]) continue;
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
