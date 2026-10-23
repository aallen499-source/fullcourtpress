// Export every table to CSV and JSON, without Docker.
//
// `supabase db dump` runs pg_dump inside a container to match Postgres
// versions, so it needs Docker Desktop — 600MB and an admin password for a
// job that happens once a month. This does the same work over the REST API.
//
// It only covers DATA, which is the whole requirement here: all 71 migration
// files are committed to git, so the schema, policies and functions are
// already backed up off this machine. Data was the missing half.
//
// Discovers tables from PostgREST's own OpenAPI document rather than a
// hardcoded list, so a table added later is included without anyone
// remembering to edit this.
//
// Reads SUPABASE_SERVICE_ROLE_KEY from .env.local — the service key bypasses
// row-level security, which is the point (the public key cannot see athlete
// accounts). It is never printed and never leaves this machine.
//
//   node scripts/export-all.mjs

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const env = Object.fromEntries(
  fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!KEY) {
  console.error(
    '\n  SUPABASE_SERVICE_ROLE_KEY is not in .env.local.\n\n' +
    '  Get it from the Supabase dashboard:\n' +
    '    Project Settings -> API -> Project API keys -> service_role (click Reveal)\n\n' +
    '  Add it as a new line in .env.local:\n' +
    '    SUPABASE_SERVICE_ROLE_KEY=paste-it-here\n\n' +
    '  That file is gitignored, so it stays on this machine.\n'
  );
  process.exit(1);
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const PAGE = 1000;

// PostgREST publishes every table it exposes in its OpenAPI document.
const spec = await (await fetch(`${URL_}/rest/v1/`, { headers })).json();
const tables = Object.keys(spec.definitions ?? spec.components?.schemas ?? {}).sort();

const out = path.join(os.homedir(), 'Desktop', `recruitgrid-data-${new Date().toISOString().slice(0, 10)}`);
fs.mkdirSync(out, { recursive: true });

const csv = (rows) => {
  const cols = [...new Set(rows.flatMap(Object.keys))].sort();
  const cell = (v) =>
    v === null || v === undefined ? '' :
    `"${String(typeof v === 'object' ? JSON.stringify(v) : v).replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
};

const summary = {};
for (const t of tables) {
  const rows = [];
  let from = 0;
  // Page explicitly: PostgREST caps a response, and a backup that silently
  // stops at the first 1,000 rows is worse than no backup, because you would
  // not find out until you needed it.
  for (;;) {
    const res = await fetch(`${URL_}/rest/v1/${t}?select=*`, {
      headers: { ...headers, Range: `${from}-${from + PAGE - 1}` },
    });
    if (!res.ok) {
      summary[t] = `skipped (HTTP ${res.status})`;
      break;
    }
    const batch = await res.json();
    if (!Array.isArray(batch)) {
      summary[t] = 'skipped (not a table)';
      break;
    }
    rows.push(...batch);
    if (batch.length < PAGE) {
      summary[t] = rows.length;
      break;
    }
    from += PAGE;
  }
  if (typeof summary[t] !== 'number') {
    console.log(`  ${t.padEnd(30)} ${summary[t]}`);
    continue;
  }
  fs.writeFileSync(path.join(out, `${t}.json`), JSON.stringify(rows, null, 1));
  if (rows.length) fs.writeFileSync(path.join(out, `${t}.csv`), csv(rows));
  console.log(`  ${t.padEnd(30)} ${String(rows.length).padStart(6)} rows`);
}

fs.writeFileSync(
  path.join(out, 'README.txt'),
  `RecruitGrid data export — ${new Date().toISOString()}\n\n` +
  `Every table PostgREST exposes, as CSV (readable) and JSON (exact).\n\n` +
  `DATA ONLY. The schema, RLS policies and functions live in the 71 files\n` +
  `under supabase/ in the git repo, which is already backed up on GitHub.\n` +
  `Together, the two are a complete backup.\n\n` +
  `NOT included: files in Supabase Storage (uploaded film), which the\n` +
  `database only holds metadata about.\n\n` +
  Object.entries(summary).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n'
);

console.log(`\n  -> ${out}`);
