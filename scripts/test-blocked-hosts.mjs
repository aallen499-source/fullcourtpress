// Tests for the blocked-host guard (lib/blocked-form-hosts.js).
//
// Worth testing because the cost of each direction is lopsided and real. A
// false NEGATIVE puts a competitor's signup wall in front of an athlete, which
// is what happened seven times before this existed. A false POSITIVE silently
// deletes a working questionnaire from the directory and nobody finds out,
// because an absent row looks exactly like a school that has no form.
//
//   node scripts/test-blocked-hosts.mjs

import { isBlockedFormUrl, BLOCKED_FORM_HOSTS } from '../lib/blocked-form-hosts.js';

let failed = 0;
const check = (name, got, want) => {
  if (got !== want) { failed++; console.log(`  FAIL ${name}  got ${got}, want ${want}`); }
  else console.log(`  ok   ${name}`);
};

console.log('blocks what it must');
// The seven real rows found in questionnaire_submissions on 2026-11-05.
check('fieldlevel, named school',  isBlockedFormUrl('https://www.fieldlevel.com/csub/basketballmen/recruiting'), true);
check('fieldlevel, no www',        isBlockedFormUrl('https://fieldlevel.com/lmu/basketballmen/recruiting'), true);
check('fieldlevel, random slug',   isBlockedFormUrl('https://www.fieldlevel.com/hrrhe2he/basketballmen/recruiting'), true);
check('dead frontrush subdomain',  isBlockedFormUrl('https://questionnaire.frontrush.com/Questionnaire/Questionnaire.aspx?q=2577'), true);
check('case is ignored',           isBlockedFormUrl('HTTPS://WWW.FieldLevel.COM/ucr/basketballmen/recruiting'), true);

console.log('leaves working forms alone');
// The one that matters most: Front Rush's LIVE host is www.frontrush.com, and
// 30-odd rows in the catalogue depend on it. Blocking the dead
// questionnaire.frontrush.com subdomain must not touch it.
check('live Front Rush survives',  isBlockedFormUrl('https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=NDQyNQ==&ptype=recruit'), false);
check('ARMS survives',             isBlockedFormUrl('https://questionnaires.armssoftware.com/2725e7649df8'), false);
check('Sidearm survives',          isBlockedFormUrl('https://gryphons.ca/sb_output.aspx?form=26'), false);
check('JumpForward survives',      isBlockedFormUrl('https://college.jumpforward.com/questionnaire.aspx?iid=376&sportid=54'), false);
check('ARI survives',              isBlockedFormUrl('https://forms.arirecruiting.com/forms/Southwestern.University.Football/form'), false);
check('Google Forms survives',     isBlockedFormUrl('https://docs.google.com/forms/d/e/1FAIpQLSf6/viewform'), false);
check('College War Room survives', isBlockedFormUrl('https://vanderbilt.collegewarroom.com/Questionnaire/Form/1'), false);
// A school whose own domain merely contains the word, which must not match.
check('lookalike domain survives', isBlockedFormUrl('https://myfieldlevel.example.edu/recruiting'), false);
check('empty is not blocked',      isBlockedFormUrl(''), false);
check('null is not blocked',       isBlockedFormUrl(null), false);
check('two hosts listed',          BLOCKED_FORM_HOSTS.length, 2);

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
