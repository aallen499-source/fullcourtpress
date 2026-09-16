// The 60-second quiz: nine questions, then an honest read of where to start.
//
// It exists to be a front door. A signup form asks for commitment before it
// gives anything; nine taps give a family something to think about, and hand
// the answers to the setup screens so publishing a profile is a shorter trip
// (see app/app/SetupWizard.jsx, which reads them).
//
// What it will not do is score talent. Nobody can tell from nine questions
// whether an athlete can play in college, and a site that says "you're a D1
// prospect" because someone ticked "varsity starter" is lying in the direction
// people want to hear. What the answers genuinely support is where to START:
// which levels to put on a list first, and what is missing before a coach can
// evaluate them at all. Every result keeps all three lanes.

// Question one asks who is filling this in, and everything after it has to
// follow: a parent reading "Where are you playing now?" is being asked the
// wrong question. Copy is written with tokens and spoken back in one of three
// voices. {S} subject, {P} possessive, and the verbs that change with them.
const VOICES = {
  athlete: { S: 'you', P: 'your', be: 'are', do: 'do', have: 'have', would: 'would' },
  parent: { S: 'your athlete', P: 'their', be: 'is', do: 'does', have: 'has', would: 'would' },
  coach: { S: 'your player', P: 'their', be: 'is', do: 'does', have: 'has', would: 'would' },
};

/** Speak a tokenised string in the voice of whoever is filling in the quiz. */
export function phrase(text, who = 'athlete') {
  const v = VOICES[who] || VOICES.athlete;
  const out = String(text).replace(/\{(\w+)\}/g, (m, key) => v[key] ?? m);
  // A sentence should still start with a capital.
  return out.replace(/(^|[.!?]\s+)([a-z])/g, (m, pre, c) => pre + c.toUpperCase());
}

export const QUESTIONS = [
  {
    id: 'who',
    title: "Who's filling this out?",
    options: [
      ['parent', 'Parent or guardian'],
      ['athlete', 'The athlete'],
      ['coach', 'Coach or advisor'],
    ],
  },
  {
    id: 'sport',
    title: 'Which sport?',
    options: [
      ['Basketball', 'Basketball'],
      ['Baseball', 'Baseball'],
      ['Football', 'Football'],
      ['Soccer', 'Soccer'],
      ['Softball', 'Softball'],
      ['Volleyball', 'Volleyball'],
      ['Track & Field', 'Track & Field'],
      ['Tennis', 'Tennis'],
      ['other', 'Another sport'],
    ],
  },
  {
    id: 'grad',
    title: 'Graduation year?',
    options: 'gradYears',
  },
  {
    id: 'level',
    title: 'Where {be} {S} playing now?',
    options: [
      ['varsity_starter', 'Varsity starter'],
      ['varsity', 'Varsity, off the bench'],
      ['jv', 'JV or freshman team'],
      ['club', 'Club or travel team mainly'],
      ['none', 'Not on a team right now'],
    ],
  },
  {
    id: 'contact',
    title: 'Has a college coach been in touch with {S}?',
    options: [
      ['several', 'Yes — several, back and forth'],
      ['one', 'Once or twice'],
      ['camp', 'Only camp invitations'],
      ['none', 'Not yet'],
    ],
  },
  {
    id: 'film',
    title: '{do} {S} have film a coach could watch?',
    options: [
      ['both', 'Highlights and full games'],
      ['highlight', 'A highlight video'],
      ['clips', 'Some clips, nothing put together'],
      ['none', 'No film yet'],
    ],
  },
  {
    id: 'gpa',
    title: 'Roughly what are {P} grades?',
    options: [
      ['35', '3.5 or higher'],
      ['30', '3.0 – 3.4'],
      ['25', '2.5 – 2.9'],
      ['below', 'Below 2.5'],
      ['unsure', 'Not sure'],
    ],
  },
  {
    id: 'distance',
    title: 'How far from home {would} {S} go?',
    options: [
      ['state', 'Stay in my state'],
      ['region', 'A day’s drive'],
      ['anywhere', 'Anywhere in the country'],
    ],
  },
  {
    id: 'state',
    title: 'Which state {do} {S} play in?',
    options: 'states',
  },
];

const YEARS_LEFT = (grad, now = new Date()) => {
  const g = parseInt(grad, 10);
  if (!g) return 2;
  const endYear = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
  return g - endYear; // 0 = senior year, 1 = junior…
};

/**
 * An honest read of where to start — never a verdict on talent.
 * @returns {{ headline, lead, lanes: [{tier,label,text}], steps: string[], notes: string[] }}
 */
export function quizResult(answers, now = new Date()) {
  const left = YEARS_LEFT(answers.grad, now);
  const senior = left <= 0;
  const junior = left === 1;
  const early = left >= 3;
  const interest = answers.contact === 'several' ? 2 : answers.contact === 'one' ? 1 : 0;
  const starter = answers.level === 'varsity_starter';
  const onTeam = answers.level !== 'none';

  // Where to aim the middle of the list. Everyone keeps all three lanes: the
  // difference is what "Target" means for this athlete today.
  let core;
  if (interest === 2 && starter) core = ['Division I and II', 'Division II and III', 'NAIA and junior college'];
  else if (starter || interest === 1) core = ['Division II and NAIA', 'Division III and NAIA', 'Junior college'];
  else if (onTeam) core = ['Division III and NAIA', 'NAIA and junior college', 'Junior college'];
  else core = ['NAIA and junior college', 'Junior college', 'Junior college'];

  const lanes = [
    { tier: 'dream', label: 'Dream', text: core[0] },
    { tier: 'target', label: 'Target', text: core[1] },
    { tier: 'safety', label: 'Safety', text: core[2] },
  ];

  const steps = [];
  if (answers.film === 'none' || answers.film === 'clips') {
    steps.push('Get film a coach can watch. Two to four minutes of {P} best plays is enough to start — it is the first thing they open.');
  }
  steps.push(
    interest === 2
      ? 'Keep the coaches who are already talking to {S} close: short updates every few weeks, and answer every reply within a day or two.'
      : 'Build a list of 10–20 schools across the three lanes above, then email the coaches — always from the athlete’s own address.'
  );
  if (answers.contact === 'camp') {
    steps.push('Camp invitations usually mean {S} {be} in a program’s database, not that they are recruiting {S}. Reply to the ones at schools worth attending, and ask the coach directly whether they are evaluating that position and class.');
  }
  if (senior) steps.push('Senior year: apply for admission at the schools talking to {S}, file the FAFSA, and keep emailing Division II, III, NAIA and junior college coaches — many recruit into spring.');
  else if (junior) steps.push('Junior year is when most programs build their lists. Send every school on the list a junior-year update with {P} schedule and newest film.');
  else if (early) steps.push('There is time, which is the advantage. Plan NCAA core courses with {P} counselor now, and start a list of schools worth a look.');

  const notes = [];
  if (answers.gpa === 'below' || answers.gpa === '25') {
    notes.push('Grades decide eligibility before any coach decides anything. Ask {P} counselor which classes count as NCAA core courses, and check where that core-course GPA stands.');
  }
  if (answers.gpa === '35') {
    notes.push('Strong grades widen the list: Division III and academic aid can make an expensive school cheaper than a scholarship offer elsewhere.');
  }
  if (answers.distance === 'state') {
    notes.push('Staying close to home narrows the list a lot. Worth deciding as a family whether a day’s drive is possible before ruling schools out.');
  }
  if (answers.who === 'parent') {
    notes.push('Coaches want to hear from the athlete, not a parent. Draft it together if that helps, but send it from the player’s own email address.');
  }
  if (answers.who === 'coach') {
    notes.push('The strongest thing a high school or club coach adds is a short note to a college staff about the player, alongside the athlete’s own emails — not instead of them.');
  }

  const headline = interest === 2
    ? '{S} already {have} interest. The work now is keeping it alive.'
    : starter
      ? '{S} {have} a realistic place to start — and a list to build.'
      : onTeam
        ? 'Start wide, and let the replies tell you your level.'
        : 'Start by getting on a team and on film.';

  const lead = 'Nine questions can’t tell anyone whether {S} can play in college — only coaches watching can. What they can say is where to start looking, and what’s missing before a coach can judge {S} at all.';

  const who = answers.who || 'athlete';
  return {
    headline: phrase(headline, who),
    lead: phrase(lead, who),
    lanes,
    steps: steps.map((t) => phrase(t, who)),
    notes: notes.map((t) => phrase(t, who)),
  };
}

/** The one-line lane suggestion the setup screens repeat back. */
export function quizLanes(answers, now = new Date()) {
  return quizResult(answers, now).lanes.map((l) => ({ tier: l.tier, text: l.text }));
}

/** What the setup screens can prefill from the quiz. */
export function quizToProfile(answers) {
  const gpa = { 35: '3.5', 30: '3.2', 25: '2.7' }[answers.gpa] || '';
  return {
    sport: answers.sport && answers.sport !== 'other' ? answers.sport : '',
    gradYear: /^\d{4}$/.test(String(answers.grad)) ? String(answers.grad) : '',
    schoolState: /^[A-Z]{2}$/.test(String(answers.state)) ? answers.state : '',
    gpa,
  };
}
