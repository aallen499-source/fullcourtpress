// Spreadsheet import for the coach roster.
//
// "Spreadsheet import" was sold as an Athlete-plan feature on the pricing
// page and in the upgrade prompt from August 2026, and it did not exist:
// only export did. Found 2026-11-11 while reworking the upgrade prompt for
// families like the one who had 130 schools in another tool and 10 here.
// This is the feature, so the claim is true.
//
// What it accepts, because families keep lists every possible way:
//   * a paste from Google Sheets or Excel (tab separated),
//   * a CSV file, including RecruitGrid's own coach export (round trip),
//   * a plain list of school names, one per line, no header.
// Only the school is required. A row with no coach becomes a "Coaching
// Staff" row, the same placeholder the questionnaire tracker already uses,
// so the roster card can offer the coach's address when it is opened.
//
// Nothing is guessed that would put a wrong fact on the roster: an unknown
// level stays blank (blank searches every staff directory, a wrong level
// searches the wrong one), and an email cell with no real address in it is
// left empty rather than half-copied.
//
// No Next imports, so `node scripts/test-roster-import.mjs` can load it.

import { divisionOf } from './coach-finder.js';

export const MAX_ROWS = 500;

const SPORTS = ['Basketball', 'Baseball', 'Football', 'Soccer', 'Softball', 'Tennis', 'Track & Field', 'Volleyball', 'Dance'];

/** The roster's school key: case, punctuation and filler words removed. Shared with app/app/page.jsx. */
export function normSchool(s) {
  return (s || '')
    .toLowerCase()
    .replace(/\([^)]{4,}\)/g, '')
    .replace(/\b(university|college|of|the|at)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Rows of cells from pasted or uploaded text. Handles quoted CSV, tabs and semicolons. */
export function parseTable(text) {
  const src = String(text || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const firstLine = (src.split('\n').find((l) => l.trim()) || '');
  const delim = firstLine.includes('\t') ? '\t' : !firstLine.includes(',') && firstLine.includes(';') ? ';' : ',';
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell.trim() === '') {
      quoted = true;
      cell = '';
    } else if (ch === delim) {
      row.push(cell); cell = '';
    } else if (ch === '\n') {
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows
    .map((r) => r.map((c) => c.replace(/\s+/g, ' ').trim()))
    .filter((r) => r.some((c) => c));
}

const HEADER_WORDS = {
  email: ['email', 'e-mail', 'email address', 'e-mail address', 'coach email', 'contact email', 'coach e-mail'],
  school: ['school', 'college', 'university', 'school name', 'college name', 'university name', 'program', 'program name', 'institution', 'college/university', 'school/college', 'schools', 'colleges', 'college or university'],
  name: ['name', 'coach', 'coach name', "coach's name", 'contact', 'contact name', 'head coach', 'recruiting coordinator', 'coach/contact'],
  sport: ['sport'],
  level: ['level', 'division', 'div', 'association', 'ncaa division', 'division level', 'div.'],
  tier: ['tier', 'lane', 'list', 'priority', 'group', 'category', 'type'],
  status: ['status', 'stage', 'contact status'],
  notes: ['notes', 'note', 'comments', 'comment'],
};

const normHead = (h) => String(h || '').toLowerCase().replace(/[^a-z0-9/' -]+/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Which field a header names, or ''. Email is checked first: "Coach Email"
 * is an email column. The school is matched on whole header names only,
 * never on a word inside the cell: a list whose first line is "Example
 * University" is a list of schools, not a header.
 */
export function fieldForHeader(h) {
  const n = normHead(h);
  if (!n) return '';
  for (const [field, words] of Object.entries(HEADER_WORDS)) if (words.includes(n)) return field;
  if (/e-?mail/.test(n) && n.split(' ').length <= 3) return 'email';
  if (/\bcoach\b/.test(n) && n.split(' ').length <= 3) return 'name';
  if (/\bdivision\b/.test(n)) return 'level';
  if (/\bnotes?\b/.test(n)) return 'notes';
  return '';
}

export function normLevel(v) {
  const s = ` ${String(v || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()} `;
  if (!s.trim()) return '';
  if (/ (d ?3|d ?iii|division iii|diii|ncaa iii) /.test(s)) return 'D3';
  if (/ (d ?2|d ?ii|division ii|dii|ncaa ii) /.test(s)) return 'D2';
  if (/ (d ?1|d ?i|division i|di|ncaa i|fbs|fcs) /.test(s)) return 'D1';
  if (/naia/.test(s)) return 'NAIA';
  if (/juco|njcaa|cccaa|nwac|junior college|community college| jc /.test(s)) return 'JUCO';
  if (/club|other|u sports|usports|ccaa/.test(s)) return 'Club/Other';
  return '';
}

export function normTier(v) {
  const s = String(v || '').toLowerCase();
  if (/dream|reach|stretch|top/.test(s)) return 'dream';
  if (/safety|safe|likely|backup|sure/.test(s)) return 'safety';
  return 'target';
}

export function normStatus(v) {
  const s = String(v || '').toLowerCase();
  if (!s.trim() || /not contacted|not yet|none|todo|to do/.test(s)) return 'not_contacted';
  if (/commit/.test(s)) return 'committed';
  if (/respond|replied|reply|response|talking|in contact|heard back/.test(s)) return 'responded';
  if (/follow/.test(s)) return 'followup';
  if (/contact|email|sent|reached/.test(s)) return 'contacted';
  return 'not_contacted';
}

const EMAIL_RE = /[A-Z0-9._%+'-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
export function firstEmail(v) {
  const m = String(v || '').match(EMAIL_RE);
  return m ? m[0] : '';
}

/** A sport cell, spelled the way the roster's sport list spells it when it can be. */
export function normSport(v, fallback = '') {
  const raw = String(v || '').trim();
  if (!raw) return fallback || '';
  const exact = SPORTS.find((s) => s.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;
  const bare = raw.toLowerCase().replace(/\b(men'?s|women'?s|boys'?|girls'?|mens|womens)\b/g, '').replace(/\s+/g, ' ').trim();
  const hit = SPORTS.find((s) => s.toLowerCase() === bare || (bare === 'track' && s === 'Track & Field'));
  return hit || raw;
}

/**
 * Turn parsed cells into roster rows.
 * @param {string[][]} table   from parseTable
 * @param {object} [o]
 * @param {Array}  [o.existing]      the athlete's current roster rows
 * @param {string} [o.defaultSport]  used when the sheet has no sport
 * @returns {{rows: object[], skipped: {line:number, school:string, reason:string}[], columns: object, headerless: boolean, truncated: boolean}}
 */
export function buildImport(table, { existing = [], defaultSport = '' } = {}) {
  const out = { rows: [], skipped: [], columns: {}, headerless: false, truncated: false };
  if (!table?.length) return out;

  const first = table[0];
  const mapped = first.map(fieldForHeader);
  let body;
  let col = {};
  if (mapped.includes('school')) {
    mapped.forEach((f, i) => { if (f && !(f in col)) col[f] = i; });
    for (const [f, i] of Object.entries(col)) out.columns[f] = first[i];
    body = table.slice(1).map((cells, i) => ({ cells, line: i + 2 }));
  } else {
    // No header naming the school. A one-column list is a list of schools;
    // otherwise the first column is read as the school and any cell holding
    // an address as the email. The preview says so.
    out.headerless = true;
    col = { school: 0 };
    body = table.map((cells, i) => ({ cells, line: i + 1 }));
  }

  const keyOf = (school, name, email) => `${normSchool(school)}|${(email || name || '').toLowerCase()}`;
  const seen = new Set();
  const schoolsHere = new Set();
  for (const c of existing || []) {
    seen.add(keyOf(c.school, c.name, c.email));
    if (c.email) seen.add(keyOf(c.school, c.name, ''));
    schoolsHere.add(normSchool(c.school));
  }

  for (const { cells, line } of body) {
    if (out.rows.length >= MAX_ROWS) { out.truncated = true; break; }
    const get = (f) => (f in col ? cells[col[f]] || '' : '');
    const school = get('school');
    if (!school) { out.skipped.push({ line, school: '', reason: 'no school' }); continue; }
    const email = firstEmail(out.headerless ? cells.find((c) => EMAIL_RE.test(c)) : get('email'));
    const name = (out.headerless ? '' : get('name')) || 'Coaching Staff';
    const placeholder = name === 'Coaching Staff' && !email;
    const k = keyOf(school, name, email);
    if (seen.has(k) || (placeholder && schoolsHere.has(normSchool(school)))) {
      out.skipped.push({ line, school, reason: 'already on your roster' });
      continue;
    }
    seen.add(k);
    if (email) seen.add(keyOf(school, name, ''));
    schoolsHere.add(normSchool(school));
    const level = normLevel(get('level')) || divisionOf(school) || null;
    const notes = get('notes').slice(0, 2000);
    out.rows.push({
      name: name.slice(0, 200),
      school: school.slice(0, 200),
      sport: normSport(get('sport'), defaultSport) || null,
      level,
      tier: normTier(get('tier')),
      email: email || null,
      status: normStatus(get('status')),
      notes: notes || null,
    });
  }
  return out;
}
