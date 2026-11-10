// Runs against trimmed copies of real staff-directory pages in
// scripts/fixtures/staff-pages (fetched 2026-11-10, markup verbatim). Each
// assertion below is something that was wrong, or nearly wrong, during the
// 50-school pilot that day. See the header of lib/staff-page-parser.js.
//
// Several "failures" of the first draft of this file turned out to be facts
// about the pages: Delaware and Oklahoma State publish no address for any
// coach of their revenue sports. Those are now assertions too, because the
// product has to say "no coach address published, here is the program's
// operations contact" rather than show a blank.

import { readFileSync } from 'node:fs';
import {
  parseStaffPage, findCoach, coachesFor, findContact, contactsFor, isCoachTitle, coachRank,
} from '../lib/staff-page-parser.js';

const dir = new URL('./fixtures/staff-pages/', import.meta.url);
const page = (name) => parseStaffPage(readFileSync(new URL(`${name}.html`, dir), 'utf8'));

let failures = 0;
const ok = (label, cond, detail = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}   ${label}${cond || !detail ? '' : `   (${detail})`}`);
  if (!cond) failures++;
};
const group = (t) => console.log(t);
const headings = (p) => p.sections.map((s) => s.heading);

// ---------------------------------------------------------------- Duke
group('Duke: new Sidearm, one table per section, people without addresses');
{
  const duke = page('duke');
  ok('table layout detected', duke.layout === 'table');
  // The bug: a <td> row with no email is a person, never a heading.
  for (const person of ['Javin DeLaurier', 'Ahen Kim', 'Manny Diaz', 'Nina King']) {
    ok(`"${person}" is not a section heading`, !headings(duke).includes(person));
  }
  ok('sport headings found', ['Men\'s Basketball', 'Women\'s Basketball', 'Football', 'Volleyball'].every((h) => headings(duke).includes(h)), headings(duke).join(' | '));

  const mbb = findCoach(duke, 'basketball', { gender: 'men' });
  ok('men\'s basketball head coach is Jon Scheyer', mbb?.name === 'Jon Scheyer', mbb?.name);
  // Duke publishes a gatekeeper inbox for him. That is the address Duke wants
  // used, so it is the right answer, not a mispairing.
  ok('…with the address Duke publishes for him', mbb?.email === 'mikaela.staton@duke.edu', mbb?.email);

  const wbb = findCoach(duke, 'basketball', { gender: 'women' });
  ok('women\'s basketball gives a different person', wbb && wbb.name !== mbb?.name && !!wbb.email, wbb?.name);

  const vb = coachesFor(duke, 'volleyball');
  ok('volleyball coaches come from the Volleyball heading, not department tables', vb.length > 0 && vb.every((c) => c.via === 'heading' && /volleyball/i.test(c.heading)), vb.map((c) => `${c.name}:${c.heading}`).join(', '));
  ok('no trainer / academic / comms staff in the volleyball list', vb.every((c) => !/trainer|academic|communications|medicine/i.test(c.title)));
  ok('a volleyball coach with an address exists', !!findCoach(duke, 'volleyball'));
  ok('contactsFor lists coaches before staff', contactsFor(duke, 'volleyball')[0]?.kind === 'coach');
}

// ---------------------------------------------------------------- Colorado Mesa
group('Colorado Mesa: old Sidearm, every section in one table');
{
  const cmu = page('cmu');
  ok('table layout detected', cmu.layout === 'table');
  const fb = findCoach(cmu, 'football');
  ok('football returns someone with an address', !!fb?.email, fb?.name);
  // The head coach has no published address; the fallback must be an
  // assistant, not nothing and not the head coach with a blank.
  ok('…and it is not the address-less head coach', fb?.name !== 'Miles Kochevar', fb?.name);
  // "Head Football Coach": the sport sits between the words.
  const fbAny = findCoach(cmu, 'football', { requireEmail: false });
  ok('without the address requirement the head coach ranks first', fbAny?.name === 'Miles Kochevar', fbAny?.name);
  ok('women\'s volleyball found', !!findCoach(cmu, 'volleyball', { gender: 'women' }));
  // Only Women's Volleyball and Beach Volleyball exist here.
  ok('men\'s volleyball is null (women\'s rejected, beach excluded)', findCoach(cmu, 'volleyball', { gender: 'men' }) === null);
}

// ---------------------------------------------------------------- Meredith
group('Meredith: a women\'s college with Flag Football');
{
  const m = page('meredith');
  ok('"Flag Football" heading is present on the page', headings(m).some((h) => /flag football/i.test(h)));
  ok('football returns null, flag football is not football', findCoach(m, 'football') === null);
  ok('…and no staff contact either', findContact(m, 'football') === null);
  ok('volleyball still found', !!findCoach(m, 'volleyball'));
  ok('basketball still found', !!findCoach(m, 'basketball'));
}

// ---------------------------------------------------------------- Lehigh
group('Lehigh: new Sidearm, a program that publishes its coaches');
{
  const p = page('lehigh');
  ok('table layout detected', p.layout === 'table');
  const fb = findCoach(p, 'football');
  ok('football coach with address, from the Football heading', !!fb?.email && /^football$/i.test(fb.heading), fb ? `${fb.name} / ${fb.heading}` : 'null');
  const men = findCoach(p, 'basketball', { gender: 'men' });
  const women = findCoach(p, 'basketball', { gender: 'women' });
  ok('men\'s and women\'s basketball are different people with addresses', !!men?.email && !!women?.email && men.name !== women.name, `${men?.name} / ${women?.name}`);
  ok('best picks are head, associate or assistant coaches', [men, women, fb].every((c) => c && c.rank <= 3), [men, women, fb].map((c) => c?.title).join(' | '));
}

// ---------------------------------------------------------------- Delaware
group('Delaware: coaches listed, none with an address');
{
  const p = page('university-of-delaware');
  ok('table layout detected', p.layout === 'table');
  const section = p.sections.find((s) => s.heading === 'Men\'s Basketball');
  ok('seven men\'s basketball people parsed, head coach first', section?.people.length === 7 && section.people[0].name === 'Martin Ingelsby', section?.people.map((x) => x.name).join(', '));
  ok('no men\'s basketball COACH has an address', findCoach(p, 'basketball', { gender: 'men' }) === null);
  ok('the head coach is still found when the address is not required', findCoach(p, 'basketball', { gender: 'men', requireEmail: false })?.name === 'Martin Ingelsby');
  const contact = findContact(p, 'basketball', { gender: 'men' });
  ok('the contact is the Director of Operations, labelled staff', contact?.name === 'Stephen Galgano' && contact.kind === 'staff' && contact.email === 'sgalgano@udel.edu', contact ? `${contact.name} / ${contact.kind}` : 'null');
  ok('women\'s basketball does have a coach with an address', !!findCoach(p, 'basketball', { gender: 'women' })?.email);
}

// ---------------------------------------------------------------- Oklahoma State
group('Oklahoma State: list of cards, no tables at all');
{
  const osu = page('oklahoma-state');
  ok('list layout detected', osu.layout === 'list');
  ok('group title has its phone number stripped', headings(osu).includes('Football'), headings(osu).join(' | '));
  ok('Eric Morris is among the football people, titled Head Coach', osu.sections.find((s) => s.heading === 'Football')?.people.some((p) => p.name === 'Eric Morris' && p.title === 'Head Coach'));
  ok('football: no coach address published', findCoach(osu, 'football') === null);
  ok('football: no staff address published either (within the fixture)', findContact(osu, 'football') === null);
  ok('men\'s basketball: no coach address published', findCoach(osu, 'basketball', { gender: 'men' }) === null);
  const mbb = findContact(osu, 'basketball', { gender: 'men' });
  ok('men\'s basketball contact is the Director of Basketball Operations', mbb?.name === 'Alannah Yeats' && mbb.kind === 'staff', mbb ? `${mbb.name} / ${mbb.title}` : 'null');
  // Every wrestling coach shares one program inbox; the recruiting coordinator
  // outranks the head coach because he is who a recruit should write to.
  const wr = findCoach(osu, 'wrestling');
  ok('wrestling: recruiting coordinator ranks first, with the program inbox', wr?.name === 'Bryan Pearsall' && wr.email === 'osu.wrestling@okstate.edu', wr ? `${wr.name} <${wr.email}>` : 'null');
  const acad = osu.sections.find((s) => /academic/i.test(s.heading));
  ok('Academic Services people parsed but none count as coaches', !!acad && acad.people.length > 0 && acad.people.every((p) => !isCoachTitle(p.title)), acad?.people.map((p) => p.title).join(' | '));
}

// ---------------------------------------------------------------- titles
group('who counts as a coach');
ok('Head Coach', isCoachTitle('Head Coach'));
ok('Head Football Coach', isCoachTitle('Head Football Coach'));
ok('Associate Head Coach - Defensive Coordinator / Linebackers', isCoachTitle('Associate Head Coach - Defensive Coordinator / Linebackers'));
ok('Recruiting Coordinator', isCoachTitle('Recruiting Coordinator'));
ok('Director of Player Personnel', isCoachTitle('Director of Player Personnel'));
ok('Strength & Conditioning Coach is NOT', !isCoachTitle('Strength & Conditioning Coach'));
ok('Director of Football Operations is NOT', !isCoachTitle('Director of Football Operations'));
ok('Assistant Athletic Trainer, Volleyball is NOT', !isCoachTitle('Assistant Athletic Trainer, Volleyball'));
ok('Men\'s Basketball Academic Coordinator is NOT', !isCoachTitle("Men's Basketball Academic Coordinator"));
ok('Special Assistant to the Head Coach is NOT', !isCoachTitle('Special Assistant to the Head Coach'));
ok('rank: recruiting < head < associate < assistant', coachRank('Director of Recruiting') < coachRank('Head Coach') && coachRank('Head Coach') < coachRank('Associate Head Coach') && coachRank('Associate Head Coach') < coachRank('Assistant Coach'));
ok('rank: "Head Football Coach" counts as head', coachRank('Head Football Coach') === coachRank('Head Coach'));

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
