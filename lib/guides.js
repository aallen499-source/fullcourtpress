// Recruiting resources — public, indexable guides at /resources (the section
// was first published at /guides; next.config.mjs redirects the old address).
//
// Written for parents and athletes searching a real question, and for
// RecruitGrid's own families (the account menu links here).
//
// House rules for what goes in a guide, same spirit as lib/newsletter-tips.js:
// - Craft over rules. How to write, what to send, when to follow up stays
//   true. Rules differ by sport, division and year; where one is unavoidable,
//   state only what we're sure of and point to the official source.
// - No invented numbers ("coaches get 1,000 emails a day"), no guarantees.
// - Name the athlete's own work, not a service doing it for them.
// - Every guide ends with the RecruitGrid step that matches it.
//
// Block types: p, list (items), example (title + text, rendered as a copyable
// email), note (a callout).

export const GUIDES = [
  {
    slug: 'how-to-email-a-college-coach',
    title: 'How to Email a College Coach (With an Example)',
    description:
      'What to put in the subject line and first two lines, the one personal sentence that gets read, when to follow up, and a sample email you can adapt.',
    updated: '2026-09-15',
    readMinutes: 6,
    shortAnswer:
      'Keep it short. Put your grad year, position, height, school and a film link in the first two lines. Add one real reason you like their program. Send it from your own email, then follow up every three to four weeks with something new.',
    sections: [
      {
        heading: 'Before you write: pick the right coach',
        blocks: [
          { type: 'p', text: 'Start with the coach most likely to read it. At larger programs that is often an assistant or recruiting coordinator; at smaller schools the head coach handles recruiting too. The athletics website’s staff directory lists every coach with an email address.' },
          { type: 'list', items: [
            'Write to one coach at each school, not the whole staff.',
            'Use the coach’s name — “Coach Reyes,” never “Dear Coach.”',
            'Send it from the athlete’s own email account, one they actually check. Parents can help draft, but coaches want to hear from the player.',
          ] },
        ],
      },
      {
        heading: 'The subject line',
        blocks: [
          { type: 'p', text: 'A coach decides whether to open your email from the subject line alone, often on a phone. Make it the facts they sort by:' },
          { type: 'example', title: 'Subject line examples', text: '2028 PG · 6\'2" · Durango HS (Las Vegas, NV)\n2028 PG · 6\'2" | Coming to your October 10 camp\n2028 PG · 6\'2" | New film from this weekend' },
        ],
      },
      {
        heading: 'The first two lines do most of the work',
        blocks: [
          { type: 'p', text: 'Many coaches will read only the top of your email before deciding whether to watch film. So lead with who you are and the link — not a paragraph about how much you admire the program.' },
          { type: 'list', items: [
            'Grad year, position, height, high school and city.',
            'A link to your film or recruiting profile. A link, not an attachment — attachments get filtered and take up space in their inbox.',
            'Your season stats and GPA on the next line, if you have them.',
          ] },
        ],
      },
      {
        heading: 'One personal line — or none',
        blocks: [
          { type: 'p', text: 'Add one sentence about why this program: a style of play that fits you, a major they offer, a game of theirs you watched. It is the line that shows you are not sending the same note to fifty schools.' },
          { type: 'note', text: 'If you don’t have a real reason yet, leave the line out. A blank says less than something generic like “I’ve always admired your program.”' },
        ],
      },
      {
        heading: 'A sample email',
        blocks: [
          { type: 'example', title: 'Example', text: 'Subject: 2028 PG · 6\'2" · Durango HS (Las Vegas, NV)\n\nHi Coach Reyes,\n\n2028 PG · 6\'2" · Durango High School · Las Vegas, NV\nJunior season: 14.2 ppg, 5.1 apg · 3.4 GPA\nFilm and profile: recruitgrid.app/your-name\n\nI like how your guards push the pace in transition — that’s where I play best.\n\nI’d like to be on your list as I go through the process. I can send my fall league schedule if it helps to see me play in person.\n\nThanks for your time,\nYour Name\n(702) 555-0123' },
          { type: 'p', text: 'That is about 90 words. A coach can read it in the time it takes to decide whether to click the film — which is the whole point.' },
        ],
      },
      {
        heading: 'What to leave out',
        blocks: [
          { type: 'list', items: [
            'A long life story. Save it for when a coach asks.',
            'Every award since middle school. Pick the one or two that matter.',
            'Attachments, including your transcript — offer to send it if they’re interested.',
            'The same email to the whole list with only the name changed. Coaches can tell.',
          ] },
        ],
      },
      {
        heading: 'After you send it',
        blocks: [
          { type: 'p', text: 'No reply to a first email is normal, and it is not a no. Coaches are busy, and at many levels there are dates before which a coach isn’t allowed to answer a recruit personally — though they can still read your email.' },
          { type: 'list', items: [
            'Follow up every three to four weeks, and only when there is something new: fresh film, updated stats, your season schedule, or a camp you’ll be at.',
            'Reply within a day or two when a coach does write back, even if the answer is “not right now.”',
            'If a school hasn’t answered after a few updates over several months, put more of your energy into the schools that are answering.',
          ] },
          { type: 'note', text: 'Contact rules differ by sport and division and change over time. Before relying on a date, check the NCAA Eligibility Center or ask the school’s compliance office.' },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Eligibility Center', url: 'https://web3.ncaa.org/ecwr3/' },
    ],
    cta: {
      title: 'Do this in RecruitGrid',
      text: 'Find each coach’s email from their staff directory, fill in your details automatically, write one personal email after another, and see when a coach opens your profile.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'when-can-college-coaches-contact-you',
    title: 'When Can College Coaches Contact You?',
    description:
      'How contact rules work in Division I, II and III, NAIA and junior college, what contact, evaluation, quiet and dead periods mean, and why you can email a coach at any age.',
    updated: '2026-09-15',
    readMinutes: 7,
    shortAnswer:
      'You can email a college coach at any age. What the rules limit is when a coach can reach out to you. For most Division I and II sports, calls, texts and emails from coaches can start on June 15 after your sophomore year — some sports, like football, have their own dates. Division III, NAIA and junior college coaches have far fewer limits. Your sport’s official NCAA recruiting calendar has the exact dates.',
    sections: [
      {
        heading: 'The rules are about coaches, not you',
        blocks: [
          { type: 'p', text: 'NCAA recruiting rules control when a college coach may call, text, message or meet with a prospect. They don’t stop an athlete or a parent from reaching out. Emailing a coach as a freshman is allowed — and it’s how many athletes get on a list early.' },
          { type: 'p', text: 'Before a coach is allowed to reply personally, they can usually still read your email, watch your film and, in many sports, send general materials like camp information or a recruiting questionnaire. So a camp flyer back instead of a personal answer isn’t a brush-off. It may be all the coach is allowed to send yet.' },
        ],
      },
      {
        heading: 'Division by division',
        blocks: [
          { type: 'list', items: [
            'Division I: for most sports, coaches can begin calling, texting, emailing and messaging on June 15 after sophomore year. Football, basketball and a handful of other sports have their own calendars, and some dates are later.',
            'Division II: communication generally opens June 15 after sophomore year as well. The NCAA publishes one Division II recruiting guide and calendar covering all sports.',
            'Division III: far fewer restrictions on when coaches can contact you. D3 schools don’t offer athletics scholarships, but many offer academic and need-based aid.',
            'NAIA: coaches generally aren’t limited on when they can reach out.',
            'Junior college (NJCAA and others): contact is generally open as well — which is one reason junior college coaches often recruit late in the process.',
          ] },
          { type: 'note', text: 'Rules change, and conferences and schools can add their own. Treat the dates above as a starting point and confirm yours on your sport’s official calendar or with the school’s athletics compliance office.' },
        ],
      },
      {
        heading: 'Contact, evaluation, quiet and dead periods',
        blocks: [
          { type: 'p', text: 'Once communication is allowed, recruiting calendars divide the year into periods that control in-person recruiting. In the NCAA’s own terms:' },
          { type: 'list', items: [
            'Contact period: a coach may meet you or your parents face to face, watch you compete, visit your high school, and write or call.',
            'Evaluation period: a coach may watch you compete and visit your high school, and write or call — but no off-campus face-to-face contact.',
            'Quiet period: no off-campus face-to-face contact, no watching you compete or visiting your school. Coaches may still write or call.',
            'Dead period: no face-to-face contact at all, and no watching you compete. Coaches may still write or call.',
          ] },
          { type: 'p', text: 'This is why a coach may be at your tournament but only nod hello. During an evaluation period they’re allowed to watch you, not to talk with you there.' },
        ],
      },
      {
        heading: 'Signing dates for 2026–27',
        blocks: [
          { type: 'p', text: 'These are the first dates a high school senior can sign a Division I or II athletics aid agreement this year, as published by the NCAA:' },
          { type: 'list', items: [
            'Division I basketball: early period November 11–18, 2026; regular period opens April 14, 2027.',
            'Division I football: early period December 2–4, 2026; regular period opens February 3, 2027.',
            'All other Division I and II sports: November 11, 2026.',
          ] },
          { type: 'p', text: 'Once you sign, coaches at other schools that offer athletics scholarships have to stop recruiting you. A verbal commitment, by contrast, isn’t binding on you or the school.' },
        ],
      },
      {
        heading: 'What to do at each stage',
        blocks: [
          { type: 'list', items: [
            'Freshman and sophomore year: email coaches at schools you’re interested in, fill out their questionnaires, go to camps, and keep your grades up. Don’t read silence as a no.',
            'June 15 after sophomore year: make sure every coach on your list has your current email, phone number and film — this is when many can start writing back.',
            'Junior year: the busiest stretch for most Division I and II recruiting. Keep coaches updated with your schedule and new film, and answer anyone who writes within a day or two.',
            'Any time: register with the NCAA Eligibility Center if Division I or II is a possibility. The NCAA notes that coaches can see whether you’ve registered.',
          ] },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Recruiting (rules, periods and recruiting calendars)', url: 'https://www.ncaa.org/eligibility-center/recruiting/' },
      { label: 'NCAA Eligibility Center', url: 'https://web3.ncaa.org/ecwr3/' },
    ],
    cta: {
      title: 'Stay on top of it in RecruitGrid',
      text: 'A monthly checklist for your graduation year tells you what to do and when — and you’ll know the moment a coach opens your profile.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'd1-d2-d3-naia-juco-differences',
    title: 'D1, D2, D3, NAIA or JUCO: What’s the Difference?',
    description:
      'How the college levels compare on scholarships, eligibility and the path to playing — and why most recruiting lists should include more than one of them.',
    updated: '2026-09-15',
    readMinutes: 7,
    shortAnswer:
      'Division I and II and the NAIA can offer athletic scholarships; Division III can’t, but offers academic and need-based aid. Junior colleges are two-year schools where many athletes play, grow and then transfer. There are good players and good programs at every level — the right fit is where you’ll play, afford it and earn a degree.',
    sections: [
      {
        heading: 'The levels at a glance',
        blocks: [
          { type: 'list', items: [
            'NCAA Division I — 363 schools. The biggest athletic budgets and most scholarships, and the most competition for them. Most, but not all, Division I programs offer athletic scholarships.',
            'NCAA Division II — 305 schools. Athletic scholarships, usually partial, often combined with academic aid. Many D2 players could compete at lower D1 programs.',
            'NCAA Division III — 422 schools. No athletic scholarships, but many offer strong academic and need-based aid. Academics come first, and seasons are shorter.',
            'NAIA — about 250 schools in the U.S. and Canada. A separate association from the NCAA with its own rules; schools can offer athletic scholarships, full or partial.',
            'Junior college (JUCO) — two-year colleges. NJCAA Division I schools can offer full athletic scholarships, Division II partial ones covering costs like tuition and books, and Division III none. California community colleges, in their own association, don’t offer athletic scholarships.',
          ] },
          { type: 'note', text: 'School counts are from the NCAA’s member directory for 2026–27 and the NAIA’s own figure. Individual programs vary — a scholarship at one D2 school may look nothing like another’s.' },
        ],
      },
      {
        heading: '“Full ride” is rarer than you think',
        blocks: [
          { type: 'p', text: 'Outside a few sports, most athletic scholarships are partial, and coaches split them across a roster. The NCAA itself notes that only a small percentage of high school athletes receive athletic scholarships.' },
          { type: 'p', text: 'What matters is the final cost after all aid. A Division III school with a large academic scholarship can cost less than a Division I school with a partial athletic one. Ask every school for the total cost after aid, in writing, and compare those numbers — not the word “scholarship.”' },
        ],
      },
      {
        heading: 'Eligibility: who you register with',
        blocks: [
          { type: 'list', items: [
            'Division I and II: register with the NCAA Eligibility Center. Recruits generally need an Academic and Athletics Certification account, which checks your core courses and grades.',
            'Division III: no NCAA certification is required to play, though schools set their own admission standards.',
            'NAIA: register with the NAIA Eligibility Center (PlayNAIA).',
            'Junior college: eligibility is generally handled through the college itself — no national certification before you enroll.',
          ] },
          { type: 'p', text: 'If Division I or II is a possibility, start your NCAA account early and plan your high school classes around the core courses it requires.' },
        ],
      },
      {
        heading: 'Why junior college isn’t a step down',
        blocks: [
          { type: 'p', text: 'Junior college is a real route, not a consolation prize. Athletes choose it to get more playing time, to raise grades before a four-year school, to grow physically, or to save money on the first two years of a degree. Coaches at four-year schools recruit junior college players every year, and junior college coaches often recruit late — after many four-year rosters are set.' },
        ],
      },
      {
        heading: 'How to use all of this',
        blocks: [
          { type: 'list', items: [
            'Build a list across levels. A good mix is a few “dream” schools, a larger group where you’d realistically play, and a few sure things.',
            'Let coaches tell you your level. Replies and interest from a level are better evidence than any ranking.',
            'Visit if you can, and ask current players how much they actually play and how the team balances school.',
            'Compare offers on total cost, playing time and the degree you want — not just the division name.',
          ] },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Recruiting and scholarships', url: 'https://www.ncaa.org/eligibility-center/recruiting/' },
      { label: 'NCAA Eligibility Center', url: 'https://web3.ncaa.org/ecwr3/' },
      { label: 'NAIA Eligibility Center (PlayNAIA)', url: 'https://www.playnaia.org/' },
      { label: 'NJCAA', url: 'https://www.njcaa.org/' },
    ],
    cta: {
      title: 'Build a list across every level',
      text: 'RecruitGrid’s College Finder covers Division I through junior college, sorts your schools into Dream, Target and Safety, and links straight to each school’s coaching staff.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'are-prospect-camps-worth-it',
    title: 'Are Prospect Camps and Showcases Worth It?',
    description:
      'The difference between a college’s own prospect camp and a showcase, what a camp “invite” really means, what to ask before you pay, and how to follow up so the day counts.',
    updated: '2026-09-15',
    readMinutes: 7,
    shortAnswer:
      'A camp is worth it when coaches from schools on your realistic list will be there to watch you, and you follow up afterward. A college’s own prospect camp puts you in front of that school’s staff. A showcase is only worth the money if it names the programs attending and they fit your level. An emailed invitation alone doesn’t mean a school is recruiting you.',
    sections: [
      {
        heading: 'Prospect camp or showcase?',
        blocks: [
          { type: 'list', items: [
            'A college prospect or elite camp is run by one school’s coaching staff, usually on its campus. You’re coached and watched by the people who decide that program’s recruiting — the most direct exposure a camp can give you to a single school.',
            'A showcase is run by an events company, with coaches from several programs invited to attend. It can put you in front of many schools in one day — but only the schools that actually show up, and only if they recruit at your level.',
          ] },
          { type: 'note', text: 'RecruitGrid only lists a showcase when its own page names the programs attending, so you can check the schools before you pay.' },
        ],
      },
      {
        heading: 'What an “invite” really means',
        blocks: [
          { type: 'p', text: 'NCAA rules generally require a college’s camps to be open to anyone who registers, within limits like age, grade and space. Many schools email camp information to every prospect in their database, and camps help fund programs.' },
          { type: 'p', text: 'So an email inviting you to camp is a good sign you’re in their system — not proof you’re a priority. A coach who has actually watched you usually says so specifically: where they saw you, and what they liked.' },
        ],
      },
      {
        heading: 'When a camp is worth it',
        blocks: [
          { type: 'list', items: [
            'The school is on your list, and at a level where you could realistically play.',
            'The coaches who recruit your position will be working it — not only current players or volunteers.',
            'The group is small enough to be seen. A limit on the number of campers is a good sign.',
            'The total cost — registration, travel, a hotel, time off — makes sense for what you’d get.',
            'You’ve already emailed the coach, so they know who you are before you walk in.',
          ] },
        ],
      },
      {
        heading: 'Ask before you pay',
        blocks: [
          { type: 'p', text: 'A short email to the coach a few weeks before can save you a wasted trip:' },
          { type: 'example', title: 'Before-camp email', text: 'Hi Coach Reyes,\n\nI’m a 2028 point guard at [High School] in [City, State] and I’m planning to attend your October 10 camp. My film and profile: [link]\n\nAre you evaluating 2028 guards at this camp? I’d like to make sure it’s a good fit before registering.\n\nThanks,\n[Your Name]' },
          { type: 'p', text: 'A specific answer — “yes, we’re looking at 2028 guards, come introduce yourself” — tells you far more than the camp flyer. No answer is useful information too.' },
          { type: 'list', items: [
            'Read the refund policy before paying. Many events keep part of the fee or only give credit toward another event if you cancel.',
            'For a showcase, ask which coaches are confirmed, and whether any recruit your position and graduation year.',
          ] },
        ],
      },
      {
        heading: 'Make the day count',
        blocks: [
          { type: 'list', items: [
            'Bring energy for the whole session. Coaches notice effort, communication and how you respond to coaching as much as highlights.',
            'Introduce yourself to the coach if the setting allows it, and thank them at the end.',
            'Write down one specific thing a coach said to you or a drill you did well — you’ll use it in your follow-up.',
          ] },
        ],
      },
      {
        heading: 'Follow up within a few days',
        blocks: [
          { type: 'p', text: 'The follow-up is where most athletes let a good camp go to waste. Within two or three days, email the coach: thank them, mention one specific moment from the day, and include your film link and upcoming schedule.' },
          { type: 'p', text: 'If a coach says “stay in touch” or “come back next year,” set a reminder for that date. Months go by fast, and the families who remember are the ones coaches hear from.' },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Recruiting', url: 'https://www.ncaa.org/eligibility-center/recruiting/' },
    ],
    cta: {
      title: 'Find camps where your schools will be',
      text: 'RecruitGrid shows the camps and showcases at the schools already on your list, has templates for before and after camp, and reminds you on the day a coach’s next step is due.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'recruiting-timeline-by-grade',
    title: 'Your Recruiting Timeline, Grade by Grade',
    description:
      'What to do in each year of high school — from choosing the right classes as a freshman to comparing offers as a senior — so nothing important arrives too late.',
    updated: '2026-09-15',
    readMinutes: 8,
    shortAnswer:
      'Freshman year: grades, the right classes, film and a first list of schools. Sophomore year: start emailing coaches and register with the NCAA Eligibility Center if Division I or II is possible. Junior year: the busiest stretch — updates, questionnaires, camps and visits. Senior year: narrow your list, apply, file the FAFSA and decide. Every level recruits on its own clock, so keep Division II, III, NAIA and junior college schools on your list the whole way.',
    sections: [
      {
        heading: 'Before high school',
        blocks: [
          { type: 'list', items: [
            'Treat grades as part of your game — colleges see every high school grade, starting freshman year.',
            'Save game clips as you go. A folder of clips now makes a highlight video easy later.',
            'Play at the highest level you can. Club, travel and AAU teams are where you find out where you stand.',
          ] },
        ],
      },
      {
        heading: 'Freshman year',
        blocks: [
          { type: 'list', items: [
            'Ask your counselor which classes count as NCAA core courses. Division I requires 16 of them; picking the right classes now is free, fixing it senior year is not.',
            'Put 10 schools on a list across three groups: a few dream schools, more where you’d realistically play, and a few sure things.',
            'Save film from every game.',
            'Fill out recruiting questionnaires for schools on your list — any age is fine, and it puts you in their system.',
            'In spring, look for a summer camp at a school on your list.',
          ] },
        ],
      },
      {
        heading: 'Sophomore year',
        blocks: [
          { type: 'list', items: [
            'Start a free NCAA Eligibility Center profile if Division I or II is a possibility.',
            'Grow your list to about 20 schools across all levels.',
            'Email an introduction to the schools where you’d realistically play, with your film link. Coaches may not be allowed to reply personally yet, but they can read it.',
            'Send a short update with new film during your season.',
            'Plan two or three summer camps where schools on your list will be.',
          ] },
          { type: 'note', text: 'June 15 after sophomore year is when coaches in most Division I and II sports can begin calling, texting and emailing you. Make sure every coach on your list has your current email, phone number and film before then. Some sports, like football, have later dates.' },
        ],
      },
      {
        heading: 'Junior year',
        blocks: [
          { type: 'list', items: [
            'Fall: email every coach on your list a junior-year update — grades, schedule and newest film. Submit a questionnaire for every school that has one.',
            'Send your season schedule so coaches can come watch you play.',
            'Winter: keep the coaches who answer close with short updates every few weeks, and let replies tell you your level.',
            'Spring: plan summer camps and showcases where your schools will be, and upgrade to an NCAA Certification Account if Division I or II schools are interested — it’s needed before an official visit or a scholarship offer from those divisions.',
            'Ask the coaches you talk to most for a call or a campus visit.',
            'Summer: tell coaches where you’ll play before each event, and email every coach you met within a few days after.',
            'Ask your counselor to send your transcript through junior year to the Eligibility Center once grades post.',
          ] },
        ],
      },
      {
        heading: 'Senior year',
        blocks: [
          { type: 'list', items: [
            'Fall: focus on the schools that are talking to you, and apply for admission — athletes still have to be admitted. Ask each coach about deadlines.',
            'File the FAFSA. It opens around October 1, and some aid is first come, first served.',
            'Register with the NAIA Eligibility Center if NAIA schools are on your list.',
            'November: many Division I and II programs sign their class when signing periods open. Ask each coach talking to you about their timeline.',
            'Keep emailing Division II, III, NAIA and junior college coaches — many recruit well into spring.',
            'Winter: send senior-season film. If a scholarship isn’t there at a school you love, ask about walk-on spots.',
            'Spring: compare offers on total cost after aid, playing time and the degree you want. Check deposit deadlines — many are May 1.',
            'Send a courtesy note to every school you’re not choosing. Coaches remember, and they move between schools.',
            'Summer: make sure your final transcript and proof of graduation reach the NCAA or NAIA Eligibility Center.',
          ] },
        ],
      },
      {
        heading: 'Still looking after graduation?',
        blocks: [
          { type: 'p', text: 'Junior college and a prep or post-graduate year are real routes. Junior college coaches can contact you at any time and often fill rosters late, and many four-year coaches recruit players after a year or two of development. Keep your film and profile current.' },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Eligibility Center', url: 'https://web3.ncaa.org/ecwr3/' },
      { label: 'NCAA Recruiting', url: 'https://www.ncaa.org/eligibility-center/recruiting/' },
      { label: 'NAIA Eligibility Center (PlayNAIA)', url: 'https://www.playnaia.org/' },
      { label: 'FAFSA (studentaid.gov)', url: 'https://studentaid.gov/h/apply-for-aid/fafsa' },
    ],
    cta: {
      title: 'Get this as a checklist every month',
      text: 'Add your graduation year in RecruitGrid and you’ll see what to do this month on your roster, ticking itself as you go — plus an optional Sunday update for a parent.',
      button: 'Start free',
      href: '/app',
    },
  },
];

// Planned, listed on /resources so families know what's coming. Not linked.
export const UPCOMING_GUIDES = [
  'Recruiting questionnaires: what they are and why to fill them out',
];

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug) || null;
