import { canUseFinder, divisionOf, buildResults, GRANDFATHER_BEFORE } from '../lib/coach-finder.js';

let failures = 0;
const ok = (label, cond, detail = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}   ${label}${cond || !detail ? '' : `   (${detail})`}`);
  if (!cond) failures++;
};
const group = (t) => console.log(t);

group('who can use it');
ok('a paid account', canUseFinder({ isPaid: true, createdAt: '2026-12-01T00:00:00Z' }));
ok('the owner', canUseFinder({ isOwner: true, createdAt: '2026-12-01T00:00:00Z' }));
ok('an account from before the cutoff, unpaid (grandfathered)', canUseFinder({ createdAt: '2026-11-03T18:00:00Z' }));
ok('an account created one second before the cutoff', canUseFinder({ createdAt: '2026-11-10T23:59:59Z' }));
ok('an account created at the cutoff, unpaid: no', !canUseFinder({ createdAt: GRANDFATHER_BEFORE }));
ok('a new unpaid account: no', !canUseFinder({ createdAt: '2026-11-12T10:00:00Z' }));
ok('no creation date, unpaid: no', !canUseFinder({}));
ok('garbage date, unpaid: no', !canUseFinder({ createdAt: 'yesterday' }));

group('divisions, never guessed');
ok('a school the finder data knows (D1)', divisionOf('Abilene Christian University', 'NCAA') === 'D1', divisionOf('Abilene Christian University', 'NCAA'));
ok('"University of X" matches "X University" and back', divisionOf('Adelphi University', 'NCAA') === 'D2' && divisionOf('University of Adelphi', 'NCAA') === 'D2');
ok('Boston College and Boston University are not merged', divisionOf('Boston College', 'NCAA') !== 'D1' || divisionOf('Boston University', 'NCAA') === 'D1');
ok('an NAIA school with no record falls back to NAIA', divisionOf('Nowhere Christian College', 'NAIA') === 'NAIA');
ok('a JUCO school with no record falls back to JUCO', divisionOf('Nowhere Community College', 'JUCO') === 'JUCO');
ok('an NCAA school with no record is "", not a guess', divisionOf('Totally Made Up University', 'NCAA') === '');

group('results');
{
  const row = (school, state, assoc, o = {}) => ({ school, state, assoc, source_url: `https://${school.replace(/\W/g, '').toLowerCase()}.edu/staff`, sport: 'volleyball', name: o.name || 'Coach', title: o.title || 'Head Coach', email: Object.hasOwn(o, 'email') ? o.email : 'c@x.edu', kind: o.kind || 'coach', rank: o.rank ?? 1, gender: o.gender || '', checked_at: '2026-11-10T00:00:00Z' });
  const rows = [
    row('Abilene Christian University', 'TX', 'NCAA', { name: 'TX Head' }),
    row('Abilene Christian University', 'TX', 'NCAA', { name: 'TX Assistant', title: 'Assistant Coach', rank: 3 }),
    row('Nowhere Christian College', 'WA', 'NAIA', { name: 'WA NAIA Head' }),
    row('Totally Made Up University', 'WA', 'NCAA', { name: 'WA Unknown Head' }),
    row('Silent U', 'WA', 'NCAA', { name: 'Unlisted', email: null }),
    row('Silent U', 'WA', 'NCAA', { name: 'Ops', title: 'Director of Volleyball Operations', kind: 'staff', rank: null, email: 'ops@silent.edu' }),
    row('Women Only U', 'OR', 'NCAA', { name: 'Womens Head', gender: 'women' }),
  ];
  const all = buildResults(rows);
  ok('one result per school', all.length === 5, String(all.length));
  ok('sorted by state then school', all.map((r) => r.state).join(',') === 'OR,TX,WA,WA,WA', all.map((r) => r.state).join(','));
  ok('best contact is the head coach, with counts', all.find((r) => r.school === 'Abilene Christian University').best.name === 'TX Head' && all.find((r) => r.school === 'Abilene Christian University').coachesWithAddress === 2);
  ok('a school with no coach address shows its staff contact', all.find((r) => r.school === 'Silent U').best.kind === 'staff');
  ok('division labels: known D1, NAIA fallback, unknown NCAA', all.find((r) => r.school === 'Abilene Christian University').division === 'D1' && all.find((r) => r.school === 'Nowhere Christian College').division === 'NAIA' && all.find((r) => r.school === 'Totally Made Up University').division === 'NCAA');
  ok('state filter', buildResults(rows, { states: ['WA'] }).every((r) => r.state === 'WA') && buildResults(rows, { states: ['WA'] }).length === 3);
  // Three NCAA schools in this fixture have no division on record: Silent U,
  // Totally Made Up University and Women Only U. The NCAA bucket is them.
  ok('division filter keeps the unknown bucket visible as NCAA', buildResults(rows, { divisions: ['NCAA'] }).map((r) => r.school).sort().join(',') === 'Silent U,Totally Made Up University,Women Only U', buildResults(rows, { divisions: ['NCAA'] }).map((r) => r.school).join(','));
  ok('division filter D1 only', buildResults(rows, { divisions: ['D1'] }).length === 1);
  ok("a men's search skips a women's-only program", !buildResults(rows, { gender: 'men' }).some((r) => r.school === 'Women Only U'));
  ok("a women's search keeps it", buildResults(rows, { gender: 'women' }).some((r) => r.school === 'Women Only U'));
  ok('empty input', buildResults([]).length === 0 && buildResults(null).length === 0);
}

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
