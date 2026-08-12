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
