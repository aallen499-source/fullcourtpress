import { chooseSuggestion, genderFits, hostOf } from '../lib/coach-suggest.js';

let failures = 0;
const ok = (label, cond, detail = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}   ${label}${cond || !detail ? '' : `   (${detail})`}`);
  if (!cond) failures++;
};
const group = (t) => console.log(t);

const row = (o) => ({ name: o.name, title: o.title || '', email: o.email ?? null, kind: o.kind || 'coach', rank: o.rank ?? null, gender: o.gender || '', heading: o.heading || '', checked_at: o.checked_at || '2026-11-10T20:00:00Z' });

group('coach before staff, best rank first');
{
  const r = chooseSuggestion([
    row({ name: 'Ops Director', title: 'Director of Basketball Operations', email: 'ops@x.edu', kind: 'staff' }),
    row({ name: 'Assistant', title: 'Assistant Coach', email: 'asst@x.edu', rank: 3 }),
    row({ name: 'Head', title: 'Head Coach', email: 'head@x.edu', rank: 1 }),
    row({ name: 'Recruiter', title: 'Assistant Coach / Recruiting Coordinator', email: 'rc@x.edu', rank: 0 }),
  ]);
  ok('best is the recruiting coordinator', r.best?.name === 'Recruiter', r.best?.name);
  ok('coaches ordered by rank', r.coaches.map((c) => c.name).join(',') === 'Recruiter,Head,Assistant');
  ok('staff listed separately', r.staff.length === 1 && r.staff[0].name === 'Ops Director');
}

group('a coach with no address never beats a staff member with one');
{
  const r = chooseSuggestion([
    row({ name: 'Head', title: 'Head Coach', email: null, rank: 1 }),
    row({ name: 'Chief', title: 'Chief of Staff', email: 'chief@x.edu', kind: 'staff' }),
  ]);
  ok('best is the staff contact', r.best?.name === 'Chief' && r.best.kind === 'staff', r.best?.name);
  ok('the address-less head coach is reported as unlisted', r.unlisted.length === 1 && r.unlisted[0].name === 'Head');
}

group('gender');
{
  const rows = [
    row({ name: 'W', title: 'Head Coach', email: 'w@x.edu', rank: 1, gender: 'women', heading: "Women's Basketball" }),
    row({ name: 'M', title: 'Head Coach', email: 'm@x.edu', rank: 1, gender: 'men', heading: "Men's Basketball" }),
    row({ name: 'Both', title: 'Head Coach', email: 'b@x.edu', rank: 1, gender: 'both', heading: "Men's and Women's Track" }),
    row({ name: 'Unmarked', title: 'Assistant Coach', email: 'u@x.edu', rank: 3, gender: '', heading: 'Basketball' }),
  ];
  ok("asking for women gives the women's coach", chooseSuggestion(rows, { gender: 'women' }).best?.name === 'W');
  ok("asking for men gives the men's coach", chooseSuggestion(rows, { gender: 'men' }).best?.name === 'M');
  ok('unmarked and "both" rows fit either request', chooseSuggestion(rows, { gender: 'women' }).coaches.map((c) => c.name).sort().join(',') === 'Both,Unmarked,W');
  ok('no gender asked: everything fits', chooseSuggestion(rows).coaches.length === 4);
  ok('genderFits: marked row rejects the other gender', !genderFits('men', 'women') && genderFits('men', 'men'));
  ok('genderFits: unmarked fits anything', genderFits('', 'women') && genderFits('', ''));
}

group('edges');
{
  ok('empty rows → nothing, no crash', chooseSuggestion([]).best === null && chooseSuggestion(undefined).best === null);
  const r = chooseSuggestion([row({ name: 'A', title: 'Head Coach', email: 'a@x.edu', rank: 1, checked_at: '2026-10-01T00:00:00Z' }), row({ name: 'B', title: 'Assistant Coach', email: 'b@x.edu', rank: 3, checked_at: '2026-11-10T00:00:00Z' })]);
  ok('checkedAt is the latest read', r.checkedAt === '2026-11-10T00:00:00Z', r.checkedAt);
  ok('hostOf strips www', hostOf('https://www.uamsports.com/staff-directory') === 'uamsports.com' && hostOf('https://hpusharks.com/x') === 'hpusharks.com');
  ok('hostOf tolerates junk', hostOf('not a url') === '' && hostOf('') === '');
}

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
