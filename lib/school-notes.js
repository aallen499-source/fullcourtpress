// Short notes a family needs before using a school's forms: a league change,
// a merger, a programme being cut. Shown under the lead on the school's
// questionnaire page (app/questionnaires/school/[slug]/page.jsx).
//
// Keyed by the school's name exactly as lib/questionnaires.js spells it. Every
// note is dated and links the school's or the league's own announcement, so a
// reader can check it and the next person knows when it goes stale.
//
// Simon Fraser was added on 2026-11-04 after a user pointed out that its rows
// say USPORTS while the school still plays NCAA Division II. Both are true at
// once: GNAC (NCAA D2) for 2026-27, U SPORTS and Canada West from fall 2027.
// A recruit starting now arrives in fall 2027 or later, so the rows stay USPORTS
// and the note explains the switch. Remove the note after the 2027-28 season starts.
export const SCHOOL_NOTES = {
  'Simon Fraser University': {
    headline: 'Changing leagues.',
    text:
      'Simon Fraser plays NCAA Division II (Great Northwest Athletic Conference) through the ' +
      '2026–27 season and joins U\u00a0SPORTS (Canada West) in fall 2027. Athletes who start there ' +
      'in fall 2027 or later will play in U\u00a0SPORTS.',
    checked: '2026-11-04',
    source: {
      // \u00a0: "U SPORTS" stays on one line.
      label: 'U\u00a0SPORTS announcement, June 4, 2026',
      url: 'https://english.usports.ca/general/2025-26/Releases/SFU2026',
    },
  },
};

export function schoolNoteFor(name) {
  return SCHOOL_NOTES[name] || null;
}
