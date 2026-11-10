// Fetch every staff directory in lib/staff-directory*.js, run it through
// lib/staff-page-parser.js, and write one JSON line per school to
// scripts/.coach-contacts/results.jsonl.
//
//   node scripts/extract-coach-contacts.mjs                 all 1,228, resumable
//   node scripts/extract-coach-contacts.mjs --limit 5       smoke test
//   node scripts/extract-coach-contacts.mjs --retry-failed  only schools that errored
//   node scripts/extract-coach-contacts.mjs --concurrency 6
//
// Resumable: a school already in the results file is skipped, so a crash at
// school 800 costs nothing. Every row carries the page it came from and when
// it was read, because a coach's address is only true on the day it was
// checked — people change jobs every spring.
//
// Why headless Chrome and not fetch(): these pages are rendered in the
// browser (Sidearm's new layout ships an empty table and fills it from JS).
// Why a 12-second budget: at 5 seconds, five of fifty pilot pages came back
// empty and looked like dead sites. All five loaded at 12.
//
// Four at a time, each a different school's website, so no host sees more
// than one request from us at once.
//
// Nothing here touches the database. scripts/import-coach-contacts.mjs does.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { parseStaffPage, genderOf, sportOf, isCoachTitle, coachRank } from '../lib/staff-page-parser.js';

const exec = promisify(execFile);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = new URL('..', import.meta.url).pathname;
const OUT_DIR = `${ROOT}scripts/.coach-contacts`;
const OUT = `${OUT_DIR}/results.jsonl`;

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(name);
  return i === -1 ? dflt : args[i + 1] === undefined || args[i + 1].startsWith('--') ? true : args[i + 1];
};
const LIMIT = Number(flag('--limit', 0)) || 0;
const CONCURRENCY = Number(flag('--concurrency', 4)) || 4;
const RETRY_FAILED = flag('--retry-failed', false) === true;

// ---------- the list ----------
// The lib files use extensionless imports plain node cannot resolve, so the
// arrays are read with a regex rather than imported. Rows are
// [name, state, url] (NCAA) or [name, state, url, level] (NAIA/JUCO).
function directories() {
  const re = /\[\s*"((?:[^"\\]|\\.)*)"\s*,\s*"([A-Z]{2})"\s*,\s*"([^"]*)"(?:\s*,\s*"([^"]*)")?\s*\]/g;
  const read = (file, assoc) =>
    [...readFileSync(`${ROOT}lib/${file}`, 'utf8').matchAll(re)]
      .filter((m) => m[3])
      .map((m) => ({ school: m[1].replace(/\\"/g, '"'), state: m[2], url: 'https://' + m[3].replace(/^https?:\/\//, ''), assoc: assoc || m[4] || '?' }));
  return [...read('staff-directory.js', 'NCAA'), ...read('staff-directory-other.js', '')];
}

// ---------- fetch ----------
async function render(url, worker, budgetMs) {
  const { stdout } = await exec(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--dump-dom',
    `--virtual-time-budget=${budgetMs}`, `--user-data-dir=${OUT_DIR}/chrome-${worker}`, url,
  ], { maxBuffer: 128 * 1024 * 1024, timeout: budgetMs + 50000 });
  return stdout || '';
}

async function fetchPage(url, worker) {
  // Second attempt gets a longer budget: the failure mode seen in the pilot
  // was a heavy page not finishing, not a dead site.
  for (const [attempt, budget] of [[1, 12000], [2, 20000]]) {
    try {
      const dom = await render(url, worker, budget);
      if (dom.length > 2000) return { dom, attempt };
      if (attempt === 2) return { dom, attempt, error: `only ${dom.length} bytes` };
    } catch (e) {
      if (attempt === 2) return { dom: '', attempt, error: String(e.code || e.message || e).slice(0, 80) };
    }
  }
  return { dom: '', attempt: 2, error: 'unreachable' };
}

// ---------- parse ----------
function peopleOf(parsed) {
  const out = [];
  for (const s of parsed.sections) {
    const sport = sportOf(s.heading);
    if (!sport) continue; // a department, or a sport not in SPORTS
    const gender = genderOf(s.heading);
    for (const p of s.people) {
      const coach = isCoachTitle(p.title);
      out.push({
        sport, gender, heading: s.heading,
        name: p.name, title: p.title, email: p.email || null,
        kind: coach ? 'coach' : 'staff',
        rank: coach ? coachRank(p.title) : null,
      });
    }
  }
  return out;
}

// ---------- run ----------
mkdirSync(OUT_DIR, { recursive: true });
const prior = new Map();
if (existsSync(OUT)) {
  for (const line of readFileSync(OUT, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { const r = JSON.parse(line); prior.set(r.url, r); } catch {}
  }
}

let todo = directories().filter((d) => {
  const seen = prior.get(d.url);
  if (!seen) return true;
  return RETRY_FAILED && seen.error;
});
if (LIMIT) todo = todo.slice(0, LIMIT);

console.log(`${directories().length} directories, ${prior.size} already done, ${todo.length} to fetch, ${CONCURRENCY} at a time`);
const t0 = Date.now();
let done = 0, failed = 0, people = 0, coachesWithEmail = 0;

async function worker(id) {
  while (todo.length) {
    const d = todo.shift();
    const { dom, attempt, error } = await fetchPage(d.url, id);
    const parsed = dom ? parseStaffPage(dom) : { layout: 'none', sections: [] };
    const rows = dom ? peopleOf(parsed) : [];
    const row = {
      school: d.school, state: d.state, assoc: d.assoc, url: d.url,
      checkedAt: new Date().toISOString(), attempt, bytes: dom.length, layout: parsed.layout,
      error: error || (rows.length ? '' : 'no sport sections parsed'),
      people: rows,
    };
    // RETRY_FAILED re-reads a school already in the file; the importer keeps
    // the LAST line per url, so appending is correct.
    appendFileSync(OUT, JSON.stringify(row) + '\n');
    done++;
    if (row.error) failed++;
    people += rows.length;
    coachesWithEmail += rows.filter((r) => r.kind === 'coach' && r.email).length;
    const mins = ((Date.now() - t0) / 60000).toFixed(1);
    console.log(`${String(done).padStart(4)}/${String(done + todo.length).padEnd(4)} ${mins.padStart(5)}m  ${(d.assoc || '').padEnd(4)} ${d.school.slice(0, 36).padEnd(37)} ${row.layout.padEnd(5)} people=${String(rows.length).padStart(3)} ${row.error ? 'ERR ' + row.error : ''}`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));
console.log(`\nDONE in ${((Date.now() - t0) / 60000).toFixed(1)} min: ${done} fetched, ${failed} with errors, ${people} people, ${coachesWithEmail} coaches with an address -> ${OUT}`);
