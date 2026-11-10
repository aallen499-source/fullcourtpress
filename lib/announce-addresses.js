// The one personal line in the coach-addresses announcement:
//
//   "On your roster, 9 schools had no coach address. 5 of them have one
//    waiting now."
//
// Computed per account at send time from the athlete's own coaches and the
// coach_contacts rows for those schools' directories. A generic "we added
// addresses" is easy to ignore; "five of YOUR nine" is not, and it is only
// said when it is true.
//
// No Next imports, so `node scripts/test-announce-addresses.mjs` can load it.

import { chooseSuggestion } from './coach-suggest.js';

/**
 * @param {Array}  coaches   the athlete's coach rows: { school, email, directoryUrl, sportKey, gender }
 *                           (directoryUrl/sportKey/gender resolved by the caller, which has Next imports)
 * @param {Map}    contacts  directoryUrl -> coach_contacts rows (all sports) for that page
 * @returns {{ schools:number, withoutAddress:number, nowAvailable:number, examples:string[] }}
 */
export function addressStats(coaches, contacts) {
  const rows = (coaches || []).filter((c) => c && String(c.school || '').trim());
  const blank = rows.filter((c) => !String(c.email || '').trim());
  const examples = [];
  let nowAvailable = 0;
  const seen = new Set();
  for (const c of blank) {
    const key = `${c.directoryUrl}|${c.sportKey}`;
    if (!c.directoryUrl || !c.sportKey || seen.has(key)) continue;
    seen.add(key);
    const forPage = (contacts?.get(c.directoryUrl) || []).filter((r) => r.sport === c.sportKey);
    const { best } = chooseSuggestion(forPage, { gender: c.gender || '' });
    if (best) {
      nowAvailable++;
      if (examples.length < 2) examples.push(String(c.school).trim());
    }
  }
  return { schools: rows.length, withoutAddress: blank.length, nowAvailable, examples };
}

/**
 * The sentence for the yellow "your next step" box.
 * Falls back to the account's general next step when the numbers have
 * nothing to say.
 */
export function addressNextStep(stats, fallback) {
  const { schools, withoutAddress, nowAvailable, examples } = stats || {};
  if (!schools) return fallback;
  if (!withoutAddress) return 'Every school on your roster already has a coach address. Open your roster and write to your first three.';
  if (!nowAvailable) return `${withoutAddress === 1 ? 'One school on your roster has' : `${withoutAddress} schools on your roster have`} no coach address saved. Open each one and the staff page link is right under the email box.`;
  const where = examples?.length ? ` Start with ${examples.join(' or ')}.` : '';
  if (withoutAddress === 1) return `The one school on your roster with no coach address has one waiting now. Open it and tap Use this.${where}`;
  return `${withoutAddress} schools on your roster had no coach address. ${nowAvailable === withoutAddress ? 'All of them' : `${nowAvailable} of them`} ${nowAvailable === 1 ? 'has' : 'have'} one waiting now: open the school and tap Use this.${where}`;
}
