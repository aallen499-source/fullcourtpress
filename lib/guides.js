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
  {
    slug: 'recruiting-questionnaires',
    title: 'Recruiting Questionnaires: What They Are and Why to Fill Them Out',
    description:
      'What a college recruiting questionnaire is, why it’s one of the easiest ways onto a coach’s radar, what to have ready before you start, and what to do after you hit submit.',
    updated: '2026-09-15',
    readMinutes: 5,
    shortAnswer:
      'A recruiting questionnaire is a form on a college’s athletics website that puts your information into that program’s recruiting database. It’s free, takes a few minutes, and you can fill it out at any age. Do one for every school on your list, then email the coach to say you did.',
    sections: [
      {
        heading: 'What a questionnaire is',
        blocks: [
          { type: 'p', text: 'Most college athletic programs have a prospective student-athlete form — usually called a recruiting or prospect questionnaire — on their athletics website, often on the team’s page. It asks for your contact details, school, graduation year, position, measurements, academics, schedule and coaches.' },
          { type: 'p', text: 'What you submit goes into the software that coaching staff use to track recruits. That’s how a school can send you camp information or add you to a list for its sport and graduation year.' },
        ],
      },
      {
        heading: 'Why it’s worth ten minutes',
        blocks: [
          { type: 'list', items: [
            'It puts you in the program’s own system, where coaches look when they’re building a class.',
            'You can do it before coaches are allowed to contact you. An athlete filling out a questionnaire is not something the recruiting rules limit.',
            'It shows interest in that specific school — something a coach can see.',
            'Many programs send camp dates and news to the prospects in their database, so you hear about opportunities first.',
          ] },
          { type: 'note', text: 'A questionnaire gets you on the radar; it doesn’t replace an email. Coaches receive a lot of them, so pair each one with a short personal note.' },
        ],
      },
      {
        heading: 'Have this ready before you start',
        blocks: [
          { type: 'list', items: [
            'An email address you check and a phone number.',
            'Your high school’s name, address and your graduation year.',
            'Position, height, weight and any testing or key stats.',
            'GPA, test scores and intended major, if you know them.',
            'NCAA Eligibility Center ID (or NAIA ID), if you have one.',
            'High school and club coach names, emails and phone numbers.',
            'A film or recruiting profile link, and your upcoming schedule.',
            'A parent or guardian’s contact information.',
          ] },
          { type: 'p', text: 'Keep it in one place and every form after the first takes a few minutes. Use exactly the same details on each one so schools can match you up.' },
        ],
      },
      {
        heading: 'Make sure it’s the real form',
        blocks: [
          { type: 'p', text: 'Look for the questionnaire on the college’s own athletics website, for your sport. Some links found online lead to third-party recruiting sites that ask you to create a profile or pay — that isn’t the school’s form. If a page asks for a credit card, it isn’t a college questionnaire.' },
          { type: 'list', items: [
            'Check that the form is for your sport, and for men’s or women’s where it matters. Some schools use one form for every sport with a dropdown to choose yours.',
            'Fill in every field you can. A half-empty form is easy to skip.',
            'Update it — or send the coach new information — when your grades, stats or schedule change.',
          ] },
        ],
      },
      {
        heading: 'After you submit',
        blocks: [
          { type: 'p', text: 'Email the coach who recruits your position the same day or the next. Keep it short:' },
          { type: 'example', title: 'After-questionnaire email', text: 'Hi Coach Reyes,\n\nI just filled out your recruiting questionnaire and wanted to introduce myself.\n\n[Grad year] [position] · [height] · [High School], [City, State]\nFilm and profile: [link]\n\n[One real reason your program interests me.]\n\nI’d like to be on your list as I go through the process.\n\nThanks for your time,\n[Your Name]' },
          { type: 'p', text: 'Then keep track of which schools you’ve done — it’s easy to lose count across twenty schools, and to wonder later whether a school has your information.' },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Recruiting', url: 'https://www.ncaa.org/eligibility-center/recruiting/' },
    ],
    cta: {
      title: 'Find the right form faster',
      text: 'RecruitGrid’s questionnaire finder links each school’s form for your sport, copies your answers so every form takes minutes, and tracks which schools you’ve submitted — with an email template for right after.',
      button: 'Find questionnaires',
      href: '/questionnaires',
    },
  },
  {
    slug: 'ncaa-core-courses',
    title: 'What Classes Do You Need? NCAA Core Courses Explained',
    description:
      'The 16 NCAA-approved core courses, the subjects they have to cover, the 10/7 rule, the GPA you need for Division I and II, and what Division III, NAIA and junior colleges require instead.',
    updated: '2026-09-15',
    readMinutes: 7,
    shortAnswer:
      'For Division I and II you need 16 NCAA-approved core courses in set subjects, a core-course GPA of at least 2.3 (D1) or 2.2 (D2), and a final transcript with proof of graduation. Division I adds the 10/7 rule: 10 of the 16 — including 7 in English, math or science — must be finished before senior year. Not every class at your school counts, so check your school’s NCAA-approved course list with your counselor early.',
    sections: [
      {
        heading: 'What a “core course” is',
        blocks: [
          { type: 'p', text: 'A core course is an academic class your high school has had approved by the NCAA — the courses that count toward eligibility. Every high school has its own NCAA-approved course list, and a class that is not on it does not count, whatever grade you get.' },
          { type: 'p', text: 'Your NCAA core-course GPA is calculated only from those approved courses. It is not the GPA on your report card, and it can come out higher or lower than the one your school shows.' },
          { type: 'note', text: 'Ask your counselor for your school’s NCAA-approved course list before you pick next year’s classes. Fixing a schedule as a freshman or sophomore is easy; finding a gap as a senior often isn’t.' },
        ],
      },
      {
        heading: 'Division I: 16 core courses',
        blocks: [
          { type: 'list', items: [
            'English: 4 years',
            'Math (Algebra I or higher): 3 years',
            'Science: 2 years',
            'Extra English, math or science: 1 year',
            'Social science: 2 years',
            'Extra core courses (world language, comparative religion or philosophy among them): 4 years',
          ] },
          { type: 'p', text: 'Division I also requires a core-course GPA of at least 2.3, a final transcript with proof of graduation, and certification by the NCAA Eligibility Center before you can practice, compete or receive athletics aid as a freshman.' },
        ],
      },
      {
        heading: 'The 10/7 rule (Division I only)',
        blocks: [
          { type: 'p', text: 'Timing counts as much as the total. Ten of your 16 core courses — seven of them in English, math or science — must be complete before the start of your seventh semester, which is the start of senior year.' },
          { type: 'p', text: 'In practice the work has to be spread across freshman, sophomore and junior years. You cannot save core courses for senior year and catch up.' },
          { type: 'note', text: 'Division I students who graduate on time may be able to use one additional NCAA-approved core course within a year after graduation, before enrolling full time in college.' },
        ],
      },
      {
        heading: 'Division II: 16 core courses, different spread',
        blocks: [
          { type: 'list', items: [
            'English: 3 years',
            'Math (Algebra I or higher): 2 years',
            'Science: 2 years',
            'Extra English, math or science: 3 years',
            'Social science: 2 years',
            'Extra core courses (world language, comparative religion or philosophy among them): 4 years',
          ] },
          { type: 'p', text: 'Division II requires a core-course GPA of at least 2.2 and a final transcript with proof of graduation. There is no 10/7 rule in Division II.' },
        ],
      },
      {
        heading: 'Division III, NAIA and junior college',
        blocks: [
          { type: 'list', items: [
            'Division III: schools set their own admissions and academic standards — there is no NCAA core-course requirement. Register with the Eligibility Center for an NCAA ID (a free Profile page) and ask each school what it expects.',
            'NAIA: an entering freshman is eligible with a final high school GPA of at least 2.3. Below that, you need two of these three: a 2.0 GPA, graduating in the top half of your class, or an 18 ACT / 970 SAT. Register at the NAIA Eligibility Center.',
            'Junior college: standards are set by the NJCAA or your state’s system and by the college itself, and are generally the most flexible. Ask the college directly — and if you plan to transfer to a four-year school later, ask what credits will transfer before you enroll.',
          ] },
        ],
      },
      {
        heading: 'What to do, by year',
        blocks: [
          { type: 'list', items: [
            'Freshman year: get your school’s NCAA-approved course list and plan four years of classes against it with your counselor.',
            'Sophomore year: create an NCAA Eligibility Center account, and check that you’re on pace for the 10/7 rule if Division I is possible.',
            'Junior year: recheck the count before you choose senior classes, and ask your counselor to upload your transcript once junior grades post.',
            'Senior year: keep your grades up — eligibility is decided on the final transcript — and have your counselor send that transcript with proof of graduation.',
          ] },
          { type: 'p', text: 'If a course was not approved, or a grade pulls the core GPA below the line, there are usually options — but only with time left to use them. That is the whole reason to check early.' },
        ],
      },
      {
        heading: 'Where these numbers come from',
        blocks: [
          { type: 'p', text: 'Everything above is taken from the NCAA Eligibility Center’s own Division I, II and III pages and the NAIA’s freshman eligibility rules, checked on September 15, 2026. Standards change, and rules differ for international students. Confirm with the official pages below and your counselor before making a decision.' },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Division I initial eligibility requirements', url: 'https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-i/' },
      { label: 'NCAA Division II initial eligibility requirements', url: 'https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-ii/' },
      { label: 'NCAA Division III initial eligibility requirements', url: 'https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-iii/' },
      { label: 'NCAA Eligibility Center (register)', url: 'https://web3.ncaa.org/ecwr3/' },
      { label: 'NAIA freshman eligibility basics', url: 'https://interpretations.naia.org/basics-of-freshman-eligibility/' },
      { label: 'NAIA Eligibility Center (PlayNAIA)', url: 'https://www.playnaia.org/' },
    ],
    cta: {
      title: 'Keep the academic steps on your list',
      text: 'RecruitGrid’s monthly checklist reminds you to check core courses with your counselor, register with the Eligibility Center and send transcripts — in the year each one matters.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'highlight-video-coaches-watch',
    title: 'How to Make a Highlight Video College Coaches Actually Watch',
    description:
      'How long it should be, what goes in the first 30 seconds, how to show who you are in every clip, what to leave out, and when to send full game film instead.',
    updated: '2026-09-17',
    readMinutes: 6,
    shortAnswer:
      'Keep it to two to four minutes, put your best five or six plays first, and make it obvious in every clip which player is you. Coaches often decide in the first 30 seconds whether to keep watching, so the opening matters more than the length. Have full game film ready for when a coach asks.',
    sections: [
      {
        heading: 'Start with who you are',
        blocks: [
          { type: 'p', text: 'Open with a simple title card for three to five seconds: name, graduation year, position, height, high school and club team, jersey number, and an email or phone number. No music intro, no slow-motion montage.' },
          { type: 'p', text: 'Then go straight to basketball, soccer, softball — whatever the sport. Every second before the first play is a second a coach might close the video.' },
        ],
      },
      {
        heading: 'The first 30 seconds decide it',
        blocks: [
          { type: 'list', items: [
            'Put your five or six best plays first — not in the order they happened.',
            'Lead with what a coach at your position wants to see: a guard creating and finishing, a pitcher’s velocity and command, a defender winning one-on-one.',
            'Show the whole play, from a second or two before your action to just after it. A coach wants to see how you read the situation, not only the finish.',
          ] },
        ],
      },
      {
        heading: 'Make it easy to find you',
        blocks: [
          { type: 'list', items: [
            'Before each clip, mark yourself — a circle or arrow for a second, or freeze the first frame. Coaches will not guess which jersey is yours.',
            'Use your jersey number and color in the title card, so a coach can follow you if the marker is missed.',
            'Film from high and wide when you can, so the whole play is visible.',
          ] },
        ],
      },
      {
        heading: 'Length and what to leave out',
        blocks: [
          { type: 'list', items: [
            'Two to four minutes is plenty. A longer video usually means weaker plays mixed in with strong ones.',
            'Skip loud music with lyrics — many coaches watch with the sound off, and some find it distracting.',
            'Leave out plays where you are not doing much, repeated clips of the same move, and anything from years ago unless it is your only film.',
            'Include a few plays that show more than scoring: defense, effort, communication, what you do off the ball.',
          ] },
        ],
      },
      {
        heading: 'Full game film',
        blocks: [
          { type: 'p', text: 'A highlight video gets a coach interested; full game film is how they evaluate. Keep two or three recent full games uploaded and ready, and when a coach asks for more, send them the same day.' },
          { type: 'p', text: 'Update your highlights during and after each season. New film is also the best reason to send a coach a short update email.' },
        ],
      },
      {
        heading: 'Where to put it',
        blocks: [
          { type: 'p', text: 'Upload to Hudl or YouTube (unlisted is fine), and put the link in the first lines of every email and on your recruiting profile. Test the link from a phone that isn’t signed in to anything — a private video is a dead end for a coach.' },
        ],
      },
    ],
    sources: [],
    cta: {
      title: 'Put your film where coaches will see it',
      text: 'Add your Hudl or YouTube link to your RecruitGrid profile, and every email you send includes it — with an alert when a coach opens it.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'college-coach-phone-call-questions',
    title: 'What to Say When a College Coach Calls — and What to Ask',
    description:
      'How to handle the first call with a college coach, how to talk about yourself, and the questions worth asking about playing time, the roster, academics and cost.',
    updated: '2026-09-17',
    readMinutes: 7,
    shortAnswer:
      'Answer yourself, be ready to talk about your season and your goals, and ask real questions — coaches expect them, and they tell you whether a program fits. Keep a short list of questions on your phone, take notes after every call, and send a thank-you the same day.',
    sections: [
      {
        heading: 'Before the phone rings',
        blocks: [
          { type: 'list', items: [
            'Save the coaches on your list in your contacts, so you recognize the call and answer it.',
            'Know a few things about each program: last season’s record, the conference, the head coach’s name, and a major you might study there.',
            'Have your season stats, grades and upcoming schedule where you can see them.',
            'The athlete takes the call, not a parent. Coaches want to hear how you communicate.',
          ] },
        ],
      },
      {
        heading: 'On the call',
        blocks: [
          { type: 'list', items: [
            'Find a quiet place, say thank you, and let the coach lead at first.',
            'When asked about yourself, be specific: your position, what you do well, what you are working on, and your goals in college — on the court or field and in the classroom.',
            'It’s fine to say “I don’t know yet” about a major or a decision date. It’s not fine to sound uninterested.',
          ] },
        ],
      },
      {
        heading: 'Questions to ask about the program',
        blocks: [
          { type: 'list', items: [
            'How do you see me fitting into your program — what position and role?',
            'How many players at my position are you recruiting in my class?',
            'What does a typical week look like in season and out of season?',
            'How do players earn playing time as freshmen?',
            'What is your style of play, and why do you think my game fits it?',
          ] },
        ],
      },
      {
        heading: 'Questions about school, life and cost',
        blocks: [
          { type: 'list', items: [
            'How do athletes on the team balance classes with practice and travel? Are there majors that don’t work with the schedule?',
            'What academic support is there for athletes?',
            'Is there athletic aid available for my position, and how do academic and need-based aid work alongside it at your school?',
            'What should I do next — a visit, a camp, a questionnaire, more film?',
          ] },
          { type: 'note', text: 'Asking about money is normal and expected. Coaches would rather you ask than be surprised later.' },
        ],
      },
      {
        heading: 'After the call',
        blocks: [
          { type: 'list', items: [
            'Write down what you learned while it’s fresh — names, what they asked for, any dates.',
            'Send a short thank-you email the same day, mentioning one thing from the conversation.',
            'Do what they asked for, and set a reminder if they said to follow up at a certain time.',
          ] },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Recruiting (contact rules)', url: 'https://www.ncaa.org/eligibility-center/recruiting/' },
    ],
    cta: {
      title: 'Keep every conversation on track',
      text: 'RecruitGrid keeps notes on each coach, has a thank-you template for right after a call, and reminds you on the day a coach’s next step is due.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'parents-role-in-recruiting',
    title: 'The Parent’s Role in College Recruiting: What Helps and What Hurts',
    description:
      'How parents can help without taking over: what coaches want from families, where parents make the biggest difference, and the mistakes that cost athletes opportunities.',
    updated: '2026-09-17',
    readMinutes: 6,
    shortAnswer:
      'Coaches want to recruit the athlete, not the parent. The biggest help a parent gives is behind the scenes — organizing, keeping deadlines, handling the money questions and asking honest questions at home — while the athlete does the emailing, the calls and the talking.',
    sections: [
      {
        heading: 'What coaches notice',
        blocks: [
          { type: 'p', text: 'College coaches recruit a person they will coach for four years. How an athlete communicates — and how the family behaves — is part of what they evaluate. Coaches watch sidelines and stands at games and camps, and many say a difficult parent can end their interest in a player they otherwise like.' },
        ],
      },
      {
        heading: 'Where parents help most',
        blocks: [
          { type: 'list', items: [
            'Organizing: a shared list of schools, deadlines, camp dates and who has been contacted.',
            'Keeping momentum: a weekly check-in on what was sent, who replied and what is due.',
            'Honest conversations at home about level, distance, cost and what matters beyond sports.',
            'Money: understanding financial aid, the FAFSA and what each school will really cost.',
            'Visits: coming along, asking your own questions, and watching how the program treats families.',
            'Film: helping record games and keeping the video organized.',
          ] },
        ],
      },
      {
        heading: 'What to let the athlete do',
        blocks: [
          { type: 'list', items: [
            'Send the emails, from the athlete’s own address. Draft them together if that helps.',
            'Take coach calls and answer texts.',
            'Talk first during visits and meetings. Parents can add questions after.',
            'Make the final decision, with your guidance.',
          ] },
        ],
      },
      {
        heading: 'Mistakes that cost opportunities',
        blocks: [
          { type: 'list', items: [
            'Writing to coaches as the parent, or answering questions meant for the athlete.',
            'Criticizing coaches, officials or teammates in the stands or on social media.',
            'Overselling ability. Coaches evaluate for themselves; exaggeration hurts trust.',
            'Aiming only at dream schools. A list with realistic and sure-thing schools keeps options open.',
            'Leaving money questions until an offer arrives.',
          ] },
        ],
      },
      {
        heading: 'Questions worth asking coaches as a parent',
        blocks: [
          { type: 'list', items: [
            'What does support for athletes look like — academics, health, time management?',
            'What is the total cost of attendance, and what aid is typical for athletes in this program?',
            'How do you communicate with families, and who do we contact with questions?',
          ] },
        ],
      },
    ],
    sources: [],
    cta: {
      title: 'Stay in the loop without taking over',
      text: 'With a RecruitGrid account, the athlete does the outreach and a parent can get a short Sunday update: coaches contacted, who opened the profile, and what’s coming up.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'social-media-college-coaches',
    title: 'What College Coaches Look at on Your Social Media',
    description:
      'Why coaches check recruits’ social media, what helps and what hurts, a clean-up checklist, and how to use your accounts to share film and updates.',
    updated: '2026-09-17',
    readMinutes: 5,
    shortAnswer:
      'Assume every coach recruiting you will look. Remove anything you wouldn’t want a coach, teacher or employer to see, keep a clear photo and bio, and use your accounts to share film, stats, schedules and the teams you play for.',
    sections: [
      {
        heading: 'Why coaches look',
        blocks: [
          { type: 'p', text: 'Social media is a quick look at character: how you talk about teammates, coaches and opponents, how you handle losses, and what you post and share. Coaches are adding someone to a team and a campus, and many say what they find online has changed their interest in a recruit — in both directions.' },
        ],
      },
      {
        heading: 'What hurts',
        blocks: [
          { type: 'list', items: [
            'Profanity, sexual content, drugs or alcohol, and photos with them in the background.',
            'Complaining about coaches, teammates, officials or teachers.',
            'Harassing or mocking anyone, including in comments and reposts.',
            'Anything illegal or dangerous — including “jokes.”',
          ] },
          { type: 'note', text: 'Reposts, likes and comments count. So does a private account that a friend screenshots.' },
        ],
      },
      {
        heading: 'What helps',
        blocks: [
          { type: 'list', items: [
            'A clear photo and a bio with your sport, position, graduation year, school and club team.',
            'Short highlight clips and a link to your full highlight video.',
            'Schedules and tournament dates, so coaches know where to see you.',
            'Academic achievements, community service and team moments.',
            'Tagging your high school or club team, and following programs you are genuinely interested in.',
          ] },
        ],
      },
      {
        heading: 'A clean-up checklist',
        blocks: [
          { type: 'list', items: [
            'Scroll back through at least two years of posts, stories highlights and tagged photos.',
            'Check likes, reposts and comments, not only your own posts.',
            'Change a handle that you wouldn’t say out loud to a coach.',
            'Search your full name to see what comes up.',
            'Ask a coach or counselor to take a quick honest look.',
          ] },
        ],
      },
      {
        heading: 'Messages from coaches',
        blocks: [
          { type: 'p', text: 'Many coaches reach out through direct messages. Check your message requests folder, answer promptly and politely, and move the conversation to email or a call when it gets serious. Be careful with accounts that claim to be coaches but aren’t from an official program — look for a verified school account or confirm through the athletics website.' },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Recruiting (contact rules)', url: 'https://www.ncaa.org/eligibility-center/recruiting/' },
    ],
    cta: {
      title: 'Send coaches to one clean page',
      text: 'A RecruitGrid profile puts your film, stats and grades on one page to link from your bio — hidden from Google, and you’ll know when a coach opens it.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'how-much-are-athletic-scholarships',
    title: 'How Much Are Athletic Scholarships Really Worth?',
    description:
      'Full versus partial scholarships, what changed in Division I in 2025, why Division III and academic aid can cost less than an offer elsewhere, and how to compare real costs between schools.',
    updated: '2026-09-17',
    readMinutes: 7,
    shortAnswer:
      'Outside a few sports at the top of Division I, most athletic aid is partial — a share of the cost, not all of it. Division III schools offer no athletic scholarships but can offer academic and need-based aid. The number that matters is what a school will actually cost your family after all aid, so compare net cost, not the word “scholarship.”',
    sections: [
      {
        heading: 'Full and partial scholarships',
        blocks: [
          { type: 'p', text: 'A full athletic scholarship covers tuition, fees, room, board and books. Many athletes receive a partial scholarship instead: a coach divides a limited budget across a roster, so an award might cover a quarter or half of the cost, and it can change from year to year.' },
          { type: 'p', text: 'Always ask exactly what an award covers, for how many years, and what happens to it if you are injured or the coach leaves. Get it in writing.' },
        ],
      },
      {
        heading: 'What changed in Division I in 2025',
        blocks: [
          { type: 'p', text: 'After the House settlement, the NCAA removed sport-specific scholarship limits in Division I from July 1, 2025. Schools in the settlement’s conferences, and others that opted in, now have roster limits instead, and can choose to offer scholarships to any or all athletes on that roster.' },
          { type: 'p', text: 'That can mean more scholarships in some programs — but it is each school’s choice, and roster spots are now limited. Ask each Division I program how it handles scholarships and roster spots in your sport.' },
        ],
      },
      {
        heading: 'Division II, NAIA and junior college',
        blocks: [
          { type: 'p', text: 'Division II and NAIA programs can offer athletic scholarships, and awards are commonly partial and combined with academic or need-based aid. Junior college rules depend on the association and division — for example, NJCAA Division III programs and California community colleges do not offer athletic scholarships. Ask each college what it can offer.' },
        ],
      },
      {
        heading: 'Division III: no athletic scholarships, but not necessarily more expensive',
        blocks: [
          { type: 'p', text: 'Division III schools do not offer athletic scholarships. Many do offer merit scholarships and need-based grants, and some private schools with high sticker prices end up costing less than a public school’s partial athletic offer. Strong grades widen these options.' },
        ],
      },
      {
        heading: 'How to compare what schools will really cost',
        blocks: [
          { type: 'list', items: [
            'File the FAFSA every year from senior year. Many schools also use the CSS Profile.',
            'Use each college’s Net Price Calculator — every college that takes federal aid is required to have one on its website.',
            'Look up average net price by family income on the College Scorecard.',
            'Compare offers on total cost after all aid, over four years — not on the size of the athletic award.',
            'Ask whether academic aid can be combined with athletic aid; policies differ by school and division.',
          ] },
        ],
      },
    ],
    sources: [
      { label: 'NCAA: Division I roster limit changes (2025)', url: 'https://www.ncaa.org/news/2025/6/23/media-center-di-board-of-directors-formally-adopts-changes-to-roster-limits.aspx' },
      { label: 'NCAA Division III: no athletics scholarships', url: 'https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-iii/' },
      { label: 'College Scorecard', url: 'https://collegescorecard.ed.gov/' },
      { label: 'FAFSA (studentaid.gov)', url: 'https://studentaid.gov/h/apply-for-aid/fafsa' },
    ],
    cta: {
      title: 'Build a list you can afford',
      text: 'RecruitGrid keeps your schools in Dream, Target and Safety lanes across every level — so the best offer isn’t the only one you have.',
      button: 'Start free',
      href: '/app',
    },
  },
  {
    slug: 'junior-college-route',
    title: 'The Junior College Route: How It Works and When It Makes Sense',
    description:
      'Why athletes choose junior college, what scholarships are available, how recruiting works at the two-year level, and what to check before planning a transfer to a four-year school.',
    updated: '2026-09-17',
    readMinutes: 6,
    shortAnswer:
      'Junior college lets an athlete play right away, improve, raise grades and cost less — then transfer to a four-year school. It works best when you choose a program that plays at a high level, develops players, and has a track record of sending athletes on. Plan the transfer from day one: credits and eligibility rules decide whether it works.',
    sections: [
      {
        heading: 'Why athletes choose junior college',
        blocks: [
          { type: 'list', items: [
            'More playing time sooner, often against strong competition.',
            'A year or two to grow physically and improve before four-year coaches evaluate again.',
            'A chance to raise grades or complete requirements for four-year eligibility.',
            'Lower cost, sometimes with athletic aid.',
            'Many four-year coaches recruit junior college players who are ready to contribute right away.',
          ] },
        ],
      },
      {
        heading: 'Scholarships at junior colleges',
        blocks: [
          { type: 'p', text: 'It depends on the association and the division. In the NJCAA, Division I colleges can offer athletic scholarships, Division II aid is more limited, and Division III programs don’t offer athletic scholarships. California community colleges do not offer athletic scholarships, though tuition is low. Ask each college exactly what it offers.' },
        ],
      },
      {
        heading: 'How junior college recruiting works',
        blocks: [
          { type: 'p', text: 'Junior college coaches can contact athletes at any time, and many recruit late — through spring and summer after senior year. Email them the same way you would a four-year coach: film, stats, grades and schedule. Many junior college programs also hold tryouts or camps.' },
        ],
      },
      {
        heading: 'Choosing a program',
        blocks: [
          { type: 'list', items: [
            'Ask how many players have moved on to four-year programs in the last few years, and to which levels.',
            'Ask about academic support and how many players finish their associate degree.',
            'Look at housing, cost and how far from home — some junior colleges have no dorms.',
            'Visit if you can, and talk to current players.',
          ] },
        ],
      },
      {
        heading: 'Plan the transfer from day one',
        blocks: [
          { type: 'p', text: 'Transfer eligibility rules for moving from a two-year to a four-year school are specific and depend on the division, your high school academic record, and the credits and grades you earn. Meet with an academic advisor in your first semester, take courses that transfer, and ask the compliance office at the four-year schools you are interested in what they will require.' },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Eligibility Center', url: 'https://web3.ncaa.org/ecwr3/' },
      { label: 'NJCAA', url: 'https://www.njcaa.org/' },
      { label: '3C2A — California Community College Athletic Association', url: 'https://www.3c2asports.org/' },
    ],
    cta: {
      title: 'Keep junior colleges on your list',
      text: 'RecruitGrid covers NAIA and junior college programs alongside the NCAA — with coaching staff links, so they belong in your Safety lane from the start.',
      button: 'Start free',
      href: '/app',
    },
  },
];

// Planned, listed on /resources so families know what's coming. Not linked.
export const UPCOMING_GUIDES = [
];

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug) || null;
