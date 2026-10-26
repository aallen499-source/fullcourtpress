// Programs confirmed NOT to publish a public recruiting questionnaire.
//
// A missing row and a program that has deliberately chosen not to have one
// look identical in a catalogue, and they mean opposite things to a family.
// A gap says "we haven't got to this yet". This says "there is nothing to
// find, stop looking, here is what to do instead" — which is the more useful
// answer and the harder one to get anywhere else.
//
// It also stops the same program being re-researched every few months. Each
// entry records what was actually checked and when, so the next person can
// judge whether it is worth re-checking rather than starting from nothing.
//
// Rules for adding one, same discipline as the rest of the directory:
//   - Only after opening the program's own pages and finding nothing. A
//     search returning no result is not evidence; search engines surface
//     aggregators and scraped spam for these queries.
//   - Record the paths checked. "I looked" is not reproducible.
//   - Absence is a claim like any other. If a form turns up later, that is a
//     correction, not a surprise.

export const NO_PUBLIC_FORM = [
  {
    school: 'University of Michigan',
    sport: 'Football',
    checked: '2026-10-26',
    // The rendered football page carries no recruit or questionnaire link at
    // all, and every plausible path answers 404 — including /sports/football/
    // recruit, which returns a 1.2 MB "Page Not Found" that looks like a real
    // page until you read its title.
    paths: [
      'mgoblue.com/sports/football',
      'mgoblue.com/sports/football/recruit',
      'mgoblue.com/sports/football/questionnaire',
      'mgoblue.com/recruiting',
      'mgoblue.com/prospective-student-athletes',
    ],
    instead:
      'Michigan publishes no questionnaire and no coach email addresses. The route in is your ' +
      'high school or club coach making contact directly, or a camp where their staff is working.',
  },
  {
    school: 'University of Alabama',
    sport: 'Football',
    checked: '2026-10-26',
    // Same shape as Michigan: the rendered football page carries no recruit or
    // questionnaire link, and every plausible path 404s. The staff directory
    // does list people under Football, but they are Athletics Student Services
    // administrators, not coaches, and no coaching address is published.
    paths: [
      'rolltide.com/sports/football',
      'rolltide.com/sports/football/recruit',
      'rolltide.com/sports/football/questionnaire',
      'rolltide.com/recruiting',
      'rolltide.com/prospective-student-athletes',
      'rolltide.com/staff-directory',
    ],
    instead:
      'Alabama publishes no questionnaire and no football coaching email addresses — its staff ' +
      'directory lists administrators only. The route in is your high school or club coach making ' +
      'contact, or a camp where their staff is working.',
  },
  {
    school: 'Pennsylvania State University',
    sport: 'Football',
    checked: '2026-10-26',
    // The strongest evidence of the three. Penn State runs a "Prospective
    // Athlete Forms" page listing questionnaires for fourteen sports —
    // baseball, basketball, fencing, golf, gymnastics, hockey, soccer,
    // swimming, tennis, track, volleyball, wrestling, field hockey, lacrosse.
    // Football is not on it. They have the infrastructure and have chosen not
    // to use it for football, which is a decision rather than an oversight.
    paths: [
      'gopsusports.com/sports/football',
      'gopsusports.com/prospective-athlete-forms',
    ],
    instead:
      'Penn State publishes questionnaires for fourteen sports and football is deliberately not ' +
      'one of them. The route in is your high school or club coach making contact, or a camp ' +
      'where their staff is working.',
  },
];

const key = (school, sport) =>
  `${String(school || '').trim().toLowerCase()}|${String(sport || '').trim().toLowerCase()}`;

const INDEX = new Map(NO_PUBLIC_FORM.map((e) => [key(e.school, e.sport), e]));

/** The entry for a school and sport, or null. */
export function noPublicForm(school, sport) {
  return INDEX.get(key(school, sport)) || null;
}

/** Every confirmed-absent sport for one school. */
export function noPublicFormsFor(school) {
  const s = String(school || '').trim().toLowerCase();
  return NO_PUBLIC_FORM.filter((e) => e.school.toLowerCase() === s);
}
