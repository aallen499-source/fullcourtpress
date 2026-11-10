import { chooseFirstEmailTarget, hasContactedAnyone } from '../lib/first-email-target.js';

let failures = 0;
const ok = (label, cond) => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}   ${label}`);
  if (!cond) failures++;
};
const group = (t) => console.log(t);

const coach = (o) => ({ id: o.id || 'c', name: o.name || 'Coach', school: o.school ?? 'A School', email: o.email ?? '', tier: o.tier, level: o.level, status: o.status, last_emailed_at: o.last_emailed_at });

group('the bug this file exists for: one address must not hide the rest');
{
  // jadehall.vb on 2026-11-10: ten schools, one address.
  const roster = [
    coach({ id: 'uc', school: 'University of Charleston', email: 'coach@ucwv.edu' }),
    ...['Eastern Washington', 'Graceland', 'Hawaii Pacific University', 'Culver-Stockton College',
        'University of Portland', 'University of Saskatchewan', 'Pierce College District',
        'Cornell College', 'Central College'].map((school, i) => coach({ id: `s${i}`, school })),
  ];
  const r = chooseFirstEmailTarget(roster);
  ok('still writes to the one reachable coach', r.mode === 'write' && r.write.id === 'uc');
  ok('and reports all nine stranded schools', r.stranded.length === 9);
  ok('names one of them to start with', !!r.stranded[0].school);
}

group('find mode');
{
  const r = chooseFirstEmailTarget([coach({ school: 'Colorado Mesa University' }), coach({ school: 'Fairmont State University' })]);
  ok('no addresses at all is find mode', r.mode === 'find');
  ok('counts every stranded school', r.stranded.length === 2);
}

group('schools mode');
{
  ok('empty roster', chooseFirstEmailTarget([]).mode === 'schools');
  ok('null roster', chooseFirstEmailTarget(null).mode === 'schools');
  // A row with neither school nor address cannot be acted on either way.
  ok('a nameless blank row is not "stranded"', chooseFirstEmailTarget([coach({ school: '' })]).mode === 'schools');
}

group('tier preference applies to BOTH picks');
{
  const r = chooseFirstEmailTarget([
    coach({ id: 'dream', school: 'Dream U', email: 'a@b.edu', tier: 'dream' }),
    coach({ id: 'target', school: 'Target U', email: 'c@d.edu', tier: 'target' }),
    coach({ id: 'sd', school: 'Stranded Dream', tier: 'dream' }),
    coach({ id: 'st', school: 'Stranded Target', tier: 'target' }),
  ]);
  ok('writes to the target, not the dream', r.write.id === 'target');
  ok('names the stranded target first', r.stranded[0].id === 'st');
}

group('whitespace is not an address');
{
  const r = chooseFirstEmailTarget([coach({ school: 'A', email: '   ' })]);
  ok('"   " counts as no address', r.mode === 'find' && r.stranded.length === 1);
}

group('already contacted');
{
  ok('a sent email counts', hasContactedAnyone([coach({ last_emailed_at: '2026-11-01' })]));
  ok('a changed status counts', hasContactedAnyone([coach({ status: 'emailed' })]));
  ok('not_contacted does not', !hasContactedAnyone([coach({ status: 'not_contacted' })]));
  ok('an untouched roster does not', !hasContactedAnyone([coach({})]));
}

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
