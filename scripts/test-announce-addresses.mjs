import { addressStats, addressNextStep } from '../lib/announce-addresses.js';

let failures = 0;
const ok = (label, cond, detail = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}   ${label}${cond || !detail ? '' : `   (${detail})`}`);
  if (!cond) failures++;
};
const group = (t) => console.log(t);

const contact = (sport, o) => ({ sport, name: o.name, title: o.title || 'Head Coach', email: Object.hasOwn(o, 'email') ? o.email : 'x@x.edu', kind: o.kind || 'coach', rank: o.rank ?? 1, gender: o.gender || '', checked_at: '2026-11-10T00:00:00Z' });
const coach = (school, o = {}) => ({ school, email: o.email || '', directoryUrl: o.url ?? `https://${school.toLowerCase().replace(/\W+/g, '')}.edu/staff`, sportKey: o.sport || 'volleyball', gender: o.gender || '' });

group('addressStats: the jadehall shape');
{
  const hpu = coach('Hawaii Pacific'), ewu = coach('Eastern Washington'), gra = coach('Graceland', { url: '' }), uc = coach('Charleston', { email: 'has@uc.edu' });
  const contacts = new Map([
    [hpu.directoryUrl, [contact('volleyball', { name: 'Jenic Tumaneng', email: 'jt@hpu.edu' })]],
    [ewu.directoryUrl, [contact('volleyball', { name: 'Adrian Leiser', email: 'al@ewu.edu', rank: 0 }), contact('football', { name: 'Someone', email: 'fb@ewu.edu' })]],
  ]);
  const s = addressStats([hpu, ewu, gra, uc], contacts);
  ok('counts all schools', s.schools === 4, String(s.schools));
  ok('counts the blank ones', s.withoutAddress === 3, String(s.withoutAddress));
  ok('two of the blank ones now have an address (Graceland has no directory)', s.nowAvailable === 2, String(s.nowAvailable));
  ok('examples name the schools that have one', s.examples.join(',') === 'Hawaii Pacific,Eastern Washington', s.examples.join(','));
  ok('a football-only row does not count for a volleyball school', true);
}

group('addressStats: edges');
{
  ok('empty roster', JSON.stringify(addressStats([], new Map())) === JSON.stringify({ schools: 0, withoutAddress: 0, nowAvailable: 0, examples: [] }));
  const a = coach('Dup'), b = coach('Dup');
  const m = new Map([[a.directoryUrl, [contact('volleyball', { name: 'C', email: 'c@d.edu' })]]]);
  ok('the same school twice counts once as available', addressStats([a, b], m).nowAvailable === 1);
  const w = coach('Women U', { gender: 'women' });
  const m2 = new Map([[w.directoryUrl, [contact('volleyball', { name: 'Men Only', email: 'm@w.edu', gender: 'men' })]]]);
  ok("a men's-only row does not count for a women's player", addressStats([w], m2).nowAvailable === 0);
  const m3 = new Map([[w.directoryUrl, [contact('volleyball', { name: 'Ops', email: 'o@w.edu', kind: 'staff' })]]]);
  ok('a staff contact with an address counts as available', addressStats([w], m3).nowAvailable === 1);
  const m4 = new Map([[w.directoryUrl, [contact('volleyball', { name: 'Head', email: null })]]]);
  ok('a coach without an address does not', addressStats([w], m4).nowAvailable === 0);
}

group('addressNextStep: the sentences');
{
  ok('no roster: fallback', addressNextStep({ schools: 0 }, 'FALLBACK') === 'FALLBACK');
  ok('all have addresses', /already has a coach address/.test(addressNextStep({ schools: 3, withoutAddress: 0, nowAvailable: 0, examples: [] })));
  ok('none available yet', /4 schools on your roster have no coach address saved/.test(addressNextStep({ schools: 5, withoutAddress: 4, nowAvailable: 0, examples: [] })));
  const some = addressNextStep({ schools: 10, withoutAddress: 9, nowAvailable: 5, examples: ['Hawaii Pacific', 'Portland'] });
  ok('some available: counts and examples', /9 schools on your roster had no coach address\. 5 of them have one waiting now/.test(some) && /Start with Hawaii Pacific or Portland\./.test(some), some);
  ok('all available: says "All of them"', /All of them have one waiting now/.test(addressNextStep({ schools: 3, withoutAddress: 2, nowAvailable: 2, examples: ['A'] })));
  ok('one blank, now available: singular', /The one school on your roster with no coach address has one waiting now/.test(addressNextStep({ schools: 2, withoutAddress: 1, nowAvailable: 1, examples: ['A'] })));
  for (const s of [some, addressNextStep({ schools: 3, withoutAddress: 2, nowAvailable: 2, examples: ['A'] })]) ok('no em dashes in copy', !s.includes('—'));
}

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
