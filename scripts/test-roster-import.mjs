import { parseTable, buildImport, fieldForHeader, normLevel, normTier, normStatus, normSport, firstEmail, normSchool, MAX_ROWS } from '../lib/roster-import.js';

let failures = 0;
const ok = (label, cond, detail = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}   ${label}${cond || !detail ? '' : `   (${detail})`}`);
  if (!cond) failures++;
};
const group = (t) => console.log(t);

group('parsing what families actually paste');
{
  const tsv = parseTable('School\tCoach\tEmail\nExample University\tJordan Smith\tjsmith@example.edu\n');
  ok('a Google Sheets paste is tab separated', tsv.length === 2 && tsv[1][2] === 'jsmith@example.edu', JSON.stringify(tsv));
  const csv = parseTable('School,Coach,Notes\r\n"Example University, Main Campus","Smith, Jordan","Said ""send film"" in June"\r\n');
  ok('quoted commas and doubled quotes survive', csv[1][0] === 'Example University, Main Campus' && csv[1][1] === 'Smith, Jordan' && csv[1][2] === 'Said "send film" in June', JSON.stringify(csv));
  ok('a byte-order mark and blank lines are ignored', parseTable('﻿School\n\n\nA College\n').length === 2);
  ok('semicolon CSV from European Excel', parseTable('School;Email\nA College;a@a.edu')[1][1] === 'a@a.edu');
  ok('a newline inside quotes stays in the cell', parseTable('School,Notes\nA College,"line one\nline two"')[1][1] === 'line one line two');
}

group('headers');
{
  ok('Coach Email is email, not name', fieldForHeader('Coach Email') === 'email');
  ok('College is school', fieldForHeader('College') === 'school' && fieldForHeader('School Name') === 'school');
  ok('Head Coach is the name', fieldForHeader('Head Coach') === 'name');
  ok('Division is level', fieldForHeader('Division') === 'level' && fieldForHeader('NCAA Division') === 'level');
  ok('Lane and Priority are the tier', fieldForHeader('Lane') === 'tier' && fieldForHeader('Priority') === 'tier');
  ok('an unknown header maps to nothing', fieldForHeader('Shoe size') === '');
}

group('values');
{
  ok('levels', normLevel('NCAA D1') === 'D1' && normLevel('Division II') === 'D2' && normLevel('DIII') === 'D3' && normLevel('naia') === 'NAIA' && normLevel('NJCAA') === 'JUCO' && normLevel('U SPORTS') === 'Club/Other');
  ok('Division II is not read as Division I', normLevel('division ii') === 'D2' && normLevel('Division I') === 'D1');
  ok('an unknown level is blank, not D1', normLevel('maybe') === '' && normLevel('') === '');
  ok('tiers', normTier('Reach') === 'dream' && normTier('likely') === 'safety' && normTier('match') === 'target' && normTier('') === 'target');
  ok('statuses, including our own export labels', normStatus('Follow-up') === 'followup' && normStatus('Responded') === 'responded' && normStatus('emailed') === 'contacted' && normStatus('Not contacted') === 'not_contacted' && normStatus('Committed') === 'committed');
  ok('an email inside other text is found', firstEmail('Coach Smith <jsmith@example.edu> (cell)') === 'jsmith@example.edu' && firstEmail('call the office') === '');
  ok("sports: Women's Volleyball becomes Volleyball", normSport("Women's Volleyball") === 'Volleyball' && normSport('track') === 'Track & Field' && normSport('Rowing') === 'Rowing' && normSport('', 'Softball') === 'Softball');
  ok('normSchool matches the roster rule', normSchool('The University of Example') === normSchool('Example') && normSchool('Example College (Main Campus Long)') === 'example');
}

group('building rows');
{
  const r = buildImport(parseTable([
    'College,Head Coach,Coach Email,Division,Lane,Status,Notes',
    'Example University,Jordan Smith,jsmith@example.edu,NCAA D2,Reach,emailed,Liked my film',
    'Sample State,,,,,,',
    ',Nobody,x@y.edu,,,,',
    'Example University,Jordan Smith,JSMITH@example.edu,,,,',
  ].join('\n')), { defaultSport: 'Volleyball' });
  ok('two rows kept', r.rows.length === 2, JSON.stringify(r.rows));
  ok('columns are reported by their own header text', r.columns.school === 'College' && r.columns.email === 'Coach Email');
  const a = r.rows[0];
  ok('a full row maps every field', a.name === 'Jordan Smith' && a.email === 'jsmith@example.edu' && a.level === 'D2' && a.tier === 'dream' && a.status === 'contacted' && a.notes === 'Liked my film' && a.sport === 'Volleyball', JSON.stringify(a));
  const b = r.rows[1];
  ok('a school-only row becomes Coaching Staff with no address', b.name === 'Coaching Staff' && b.email === null && b.status === 'not_contacted', JSON.stringify(b));
  ok('a row with no school is skipped and says why', r.skipped.some((s) => s.line === 4 && s.reason === 'no school'));
  ok('the same coach twice in one file is skipped', r.skipped.some((s) => s.line === 5 && s.reason === 'already on your roster'));
}

group('against the existing roster');
{
  const existing = [
    { school: 'Example University', name: 'Jordan Smith', email: 'jsmith@example.edu' },
    { school: 'Sample State University', name: 'Coaching Staff', email: null },
  ];
  const r = buildImport(parseTable('School,Coach,Email\nExample University,Jordan Smith,jsmith@example.edu\nExample University,Casey Lee,clee@example.edu\nSample State,,\nNew College,,'), { existing });
  ok('a coach already on the roster is skipped', r.skipped.some((s) => s.school === 'Example University' && s.reason === 'already on your roster'));
  ok('a second coach at the same school is added', r.rows.some((x) => x.name === 'Casey Lee'));
  ok('a school-only row for a school already there is skipped', r.skipped.some((s) => s.school === 'Sample State'));
  ok('a new school is added', r.rows.some((x) => x.school === 'New College'));
}

group('lists with no header');
{
  const r = buildImport(parseTable('Example University\nSample State University\nNew College\n'), { defaultSport: 'Softball' });
  ok('one school per line works', r.headerless && r.rows.length === 3 && r.rows.every((x) => x.name === 'Coaching Staff' && x.sport === 'Softball'));
  const r2 = buildImport(parseTable('Example University,Jordan Smith,jsmith@example.edu'));
  ok('headerless with columns: first is school, the address is found', r2.rows[0].school === 'Example University' && r2.rows[0].email === 'jsmith@example.edu' && r2.rows[0].name === 'Coaching Staff');
}

group('limits and edges');
{
  const many = ['School', ...Array.from({ length: MAX_ROWS + 20 }, (_, i) => `College ${i}`)].join('\n');
  const r = buildImport(parseTable(many));
  ok(`stops at ${MAX_ROWS} and says so`, r.rows.length === MAX_ROWS && r.truncated);
  ok('empty input is empty', buildImport(parseTable('')).rows.length === 0 && buildImport([]).rows.length === 0);
  ok('a header-only sheet adds nothing', buildImport(parseTable('School,Email')).rows.length === 0);
  const lvl = buildImport(parseTable('School\nNowhere Institute of Imagination')).rows[0].level;
  ok('an unknown school gets no level rather than a guess', lvl === null, String(lvl));
}

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
