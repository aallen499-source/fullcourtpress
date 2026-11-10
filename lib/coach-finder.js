// The Coach Finder: every coach in a sport, by state and division, with the
// address each school publishes. The paid half of the coach_contacts data.
//
// The roster card (lib/coach-suggest.js) answers "who do I write to at the
// school I just added" and is free. This answers "who coaches D2 volleyball
// in Washington" without adding schools one at a time, which is what the
// paid recruiting platforms sell, and is gated to paid accounts plus every
// account that existed before it shipped (supabase/77).
//
// Divisions. coach_contacts knows the association (NCAA / NAIA / JUCO) but
// not D1/D2/D3, because the directory list never did. The college-finder
// data knows divisions for ten sport/gender pairs plus basketball, so a
// school is labelled D1/D2/D3 when that data says so and "NCAA" when it
// does not. It is never guessed: a wrong division under a coach's name is
// the kind of small lie that makes a family distrust the big truths.
//
// No Next imports, so `node scripts/test-coach-finder.mjs` can load it.

import { chooseSuggestion } from './coach-suggest.js';
import { SPORT_SCHOOLS } from './college-sports-data.js';
import { D1_SCHOOLS, D2_SCHOOLS, D3_JUCO_SCHOOLS } from './college-data.js';

/** Accounts created before this keep full access without paying. */
export const GRANDFATHER_BEFORE = '2026-11-11T00:00:00Z';

export function canUseFinder({ isPaid = false, isOwner = false, createdAt = null } = {}) {
  if (isOwner || isPaid) return true;
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  return Number.isFinite(t) && t < Date.parse(GRANDFATHER_BEFORE);
}

const norm = (s) =>
  String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

let DIV = null;
function divisionMap() {
  if (DIV) return DIV;
  DIV = new Map();
  const put = (name, div) => {
    const k = norm(name);
    if (k && div && !DIV.has(k)) DIV.set(k, div);
  };
  for (const r of SPORT_SCHOOLS) put(r[0], r[1]);
  for (const r of D1_SCHOOLS) put(r[0], 'D1');
  for (const r of D2_SCHOOLS) put(r[0], r[1] || 'D2');
  for (const r of D3_JUCO_SCHOOLS) put(r[0], r[1]);
  return DIV;
}

/**
 * 'D1' | 'D2' | 'D3' | 'NAIA' | 'JUCO' | '' (NCAA, division not on record).
 * Matching is exact after punctuation, with one safe alternate: "X
 * University" and "University of X". "College" is never stripped, so Boston
 * College and Boston University stay different schools.
 */
export function divisionOf(school, assoc = '') {
  const m = divisionMap();
  const k = norm(school);
  if (m.has(k)) return m.get(k);
  const alt = k.replace(/^university of /, '').replace(/ university$/, '');
  if (alt && alt !== k) {
    for (const cand of [alt, `${alt} university`, `university of ${alt}`]) if (m.has(cand)) return m.get(cand);
  }
  if (assoc === 'NAIA' || assoc === 'JUCO') return assoc;
  return '';
}

/**
 * Group contact rows by school and pick each school's best contact.
 *
 * @param {Array} rows coach_contacts rows for ONE sport (any states)
 * @param {{gender?:string, divisions?:string[], states?:string[]}} [opts]
 *   divisions: any of D1 D2 D3 NAIA JUCO NCAA. 'NCAA' means "NCAA school
 *   whose division is not on record", so nothing is silently hidden.
 */
export function buildResults(rows, { gender = '', divisions = [], states = [] } = {}) {
  const bySchool = new Map();
  for (const r of rows || []) {
    if (!r || !r.school) continue;
    if (states.length && !states.includes(r.state)) continue;
    const key = r.source_url || r.school;
    if (!bySchool.has(key)) bySchool.set(key, { school: r.school, state: r.state || '', assoc: r.assoc || '', source_url: r.source_url || '', rows: [] });
    bySchool.get(key).rows.push(r);
  }
  const out = [];
  for (const s of bySchool.values()) {
    const division = divisionOf(s.school, s.assoc) || (s.assoc === 'NCAA' ? 'NCAA' : s.assoc);
    if (divisions.length && !divisions.includes(division)) continue;
    const pick = chooseSuggestion(s.rows, { gender });
    if (!pick.best) continue;
    out.push({
      school: s.school, state: s.state, assoc: s.assoc, division,
      sourceUrl: s.source_url, checkedAt: pick.checkedAt,
      best: pick.best, coachesWithAddress: pick.coaches.length, staffWithAddress: pick.staff.length,
    });
  }
  out.sort((a, b) => a.state.localeCompare(b.state) || a.school.localeCompare(b.school));
  return out;
}
