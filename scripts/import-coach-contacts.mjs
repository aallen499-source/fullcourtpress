// Load scripts/.coach-contacts/results.jsonl (from extract-coach-contacts.mjs)
// into the coach_contacts table (supabase/75-coach-contacts.sql).
//
//   node scripts/import-coach-contacts.mjs            import
//   node scripts/import-coach-contacts.mjs --dry-run  count what would go in
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local. The service-role key lives there and nowhere else: not in
// chat, not in a commit, not in an argument that lands in shell history.
//
// Per school: upsert today's rows, then delete that page's rows that were
// not refreshed by this run. A coach who left between reads disappears
// instead of lingering with a stale address, which is the whole reason
// checked_at exists.

import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { isCoachTitle, coachRank } from '../lib/staff-page-parser.js';

const ROOT = new URL('..', import.meta.url).pathname;
const IN = `${ROOT}scripts/.coach-contacts/results.jsonl`;
const DRY = process.argv.includes('--dry-run');

function envLocal() {
  const p = `${ROOT}.env.local`;
  if (!existsSync(p)) throw new Error('.env.local not found');
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

// Last line per url wins: --retry-failed appends a fresh read of a school
// that already had a line.
const byUrl = new Map();
for (const line of readFileSync(IN, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const r = JSON.parse(line);
  byUrl.set(r.url, r);
}

const schools = [...byUrl.values()].filter((r) => r.people.length);
const skipped = [...byUrl.values()].filter((r) => !r.people.length);
let total = 0, withEmail = 0;
const batches = [];
for (const r of schools) {
  const seen = new Set();
  const rows = [];
  for (const p of r.people) {
    const key = `${r.url}|${p.heading}|${p.name}|${p.title}`;
    if (seen.has(key)) continue; // same person twice under one heading
    seen.add(key);
    // kind and rank are recomputed from the title HERE, not trusted from the
    // file. They are pure functions of the title, and the rule has already
    // changed once mid-run (football coordinators were "staff" until
    // 2026-11-10 afternoon). Rows written under an older rule get today's
    // classification at import, so the table never carries a stale verdict.
    const coach = isCoachTitle(p.title);
    rows.push({
      school: r.school, state: r.state, assoc: r.assoc,
      sport: p.sport, gender: p.gender, heading: p.heading,
      name: p.name, title: p.title, email: p.email,
      kind: coach ? 'coach' : 'staff', rank: coach ? coachRank(p.title) : null,
      source_url: r.url, checked_at: r.checkedAt,
    });
  }
  total += rows.length;
  withEmail += rows.filter((x) => x.kind === 'coach' && x.email).length;
  batches.push({ url: r.url, checkedAt: r.checkedAt, rows });
}

console.log(`${byUrl.size} schools in file, ${schools.length} with people, ${skipped.length} with nothing (${skipped.filter((r) => r.error).length} errored)`);
console.log(`${total} rows to import, ${withEmail} are coaches with an address`);
if (DRY) process.exit(0);

const env = envLocal();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Project Settings → API → service_role). Not here.');
  process.exit(1);
}
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let done = 0, removed = 0;
const failures = [];
for (const b of batches) {
  for (let i = 0; i < b.rows.length; i += 500) {
    const { error } = await db.from('coach_contacts').upsert(b.rows.slice(i, i + 500), { onConflict: 'source_url,heading,name,title' });
    if (error) { failures.push(`${b.url}: ${error.message}`); break; }
  }
  const { count, error: delErr } = await db.from('coach_contacts')
    .delete({ count: 'exact' }).eq('source_url', b.url).lt('checked_at', b.checkedAt);
  if (delErr) failures.push(`${b.url} cleanup: ${delErr.message}`);
  removed += count || 0;
  done++;
  if (done % 100 === 0) console.log(`  ${done}/${batches.length} schools`);
}
console.log(`\nimported ${done} schools, ${total} rows; removed ${removed} stale rows; ${failures.length} failures`);
for (const f of failures.slice(0, 20)) console.log('  ', f);
process.exit(failures.length ? 1 : 0);
