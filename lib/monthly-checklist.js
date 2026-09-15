// "This month": a short recruiting checklist for where an athlete is in high
// school right now, worked out from their graduation year and today's date.
//
// Most of what families pay a recruiting service for is someone telling them
// what to do next and when. The readiness panel covers getting set up once;
// this covers the four years after, a season at a time.
//
// Rules of the road for the wording:
// - Only dates we are sure of. Most Division I and II coaches can start calling,
//   texting and emailing on June 15 after sophomore year; Division III, NAIA
//   and junior college coaches can contact athletes at any time. Football and a
//   few other D1 sports have their own dates, so the list says so rather than
//   guessing at every sport.
// - An athlete can email any coach at any age. Before the contact date a D1 or
//   D2 coach can still read it and send camp information or a questionnaire —
//   they just can't write back personally. So emailing is never "too early".
// - Every item is something the athlete can do this month, and where RecruitGrid
//   has a place for it, the item opens that tab.
//
// Some items tick themselves from what is already stored (`auto`); the rest the
// athlete ticks. Those ticks are kept in the browser per month — a new month is
// a new list.

export const ELIGIBILITY_CENTER_URL = 'https://web3.ncaa.org/ecwr3/';
export const NAIA_ELIGIBILITY_URL = 'https://www.playnaia.org/';
export const FAFSA_URL = 'https://studentaid.gov/h/apply-for-aid/fafsa';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Where the athlete is in school. The school year is taken to start in August,
 * so June and July belong to the year just finished ("the summer after
 * sophomore year").
 */
export function classPosition(gradYear, now = new Date()) {
  const grad = parseInt(gradYear, 10);
  if (!grad) return null;
  const endYear = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
  const left = grad - endYear;
  if (left < 0) return { key: 'graduated', label: 'After graduation' };
  if (left > 3) return { key: 'middle', label: 'Before high school' };
  return [
    { key: 'senior', label: 'Senior year' },
    { key: 'junior', label: 'Junior year' },
    { key: 'sophomore', label: 'Sophomore year' },
    { key: 'freshman', label: 'Freshman year' },
  ][left];
}

// Aug–Oct, Nov–Feb, Mar–May, Jun–Jul: fall, in season for most winter and
// fall-into-winter sports, spring, summer.
function seasonOf(month) {
  if (month >= 7 && month <= 9) return 'fall';
  if (month >= 10 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  return 'summer';
}

const SEASON_LABEL = { fall: 'Fall', winter: 'Winter', spring: 'Spring', summer: 'Summer' };

// Each item: id (stable — ticks are stored by it), label, hint, and optionally
// tab (opens that tab), href (outside link), auto (ticked from stored data, see
// autoDone in app/app/page.jsx), months (only in those months, 0 = January).
const PLAN = {
  middle: {
    all: {
      intro: 'Nothing to send yet. The habits that matter later start now.',
      items: [
        { id: 'grades', label: 'Treat grades as part of your game', hint: 'Colleges see every high school grade, starting freshman year.' },
        { id: 'film', label: 'Start saving game clips', hint: 'A folder of clips now makes a highlight video easy later.', tab: 'film', auto: 'film' },
        { id: 'play', label: 'Play at the highest level you can', hint: 'Club, AAU or travel teams are where you learn what level you are.' },
      ],
    },
  },

  freshman: {
    fall: {
      intro: 'Every grade from here on counts toward college eligibility.',
      items: [
        { id: 'core', label: 'Ask your counselor which classes are NCAA core courses', hint: 'Division I needs 16 core courses. Picking the right ones now is free; fixing it senior year is not.' },
        { id: 'list10', label: 'Put 10 schools on your list', hint: 'Dream, Target and Safety. It will change — that is the point.', tab: 'roster', auto: 'coaches10' },
        { id: 'clips', label: 'Save film from every game this season', hint: 'Full games and short clips both.', tab: 'film', auto: 'filmMonth' },
      ],
    },
    winter: {
      intro: 'In season: play, save film, keep grades up.',
      items: [
        { id: 'feedback', label: 'Ask your coach what level they see you at', hint: 'An honest answer now keeps your list realistic.' },
        { id: 'q1', label: 'Fill out a questionnaire for a school on your list', hint: 'Any age is fine. It puts you in the program’s database.', tab: 'questionnaires', auto: 'questionnaireMonth' },
        { id: 'clips', label: 'Keep saving film', hint: 'Mark your best plays while you remember them.', tab: 'film', auto: 'filmMonth' },
      ],
    },
    spring: {
      intro: 'Summer camps post now. Pick where you want to be seen.',
      items: [
        { id: 'camps', label: 'Look for a summer camp at a school on your list', hint: 'The Camps tab shows which list schools have one posted.', tab: 'camps' },
        { id: 'highlight', label: 'Cut a first highlight video', hint: 'Two to four minutes, best plays first.', tab: 'film', auto: 'filmMonth' },
        { id: 'finish', label: 'Finish the year with strong grades', hint: 'Freshman grades are on the transcript coaches see.' },
      ],
    },
    summer: {
      intro: 'Summer is when you get better and get seen.',
      items: [
        { id: 'camp', label: 'Go to one camp at a school on your list', hint: 'Save it in the Camps tab so it shows on your timeline.', tab: 'camps', auto: 'campTracked' },
        { id: 'measure', label: 'Write down your height, stats and any testing numbers', hint: 'They go on your profile and every email.', tab: 'myinfo' },
      ],
    },
  },

  sophomore: {
    fall: {
      intro: 'Coaches can’t write back personally yet, but they read. Start introducing yourself.',
      items: [
        { id: 'ec', label: 'Start a free NCAA Eligibility Center profile', hint: 'Needed for Division I and II. The free profile is enough for now.', href: ELIGIBILITY_CENTER_URL },
        { id: 'list20', label: 'Grow your list to 20 schools across all three lanes', hint: 'More Target and Safety schools than Dream.', tab: 'roster', auto: 'coaches20' },
        { id: 'intro', label: 'Email an introduction to your Target schools', hint: 'Templates → Initial Introduction. Three this month is a good start.', tab: 'templates', auto: 'emailed3' },
        { id: 'q', label: 'Submit questionnaires for schools on your list', hint: 'Four minutes each, and it puts you in their system.', tab: 'questionnaires', auto: 'questionnaireMonth' },
      ],
    },
    winter: {
      intro: 'In season. New film is the best reason to email a coach.',
      items: [
        { id: 'update', label: 'Send a season update with new film', hint: 'Templates → Season / Film Update, to every coach you have emailed.', tab: 'templates', auto: 'emailed3' },
        { id: 'film', label: 'Add this season’s film to your profile', hint: 'Coaches click the newest link first.', tab: 'film', auto: 'filmMonth' },
        { id: 'core', label: 'Check your core courses with your counselor', hint: 'Make sure next year’s schedule keeps you on track.' },
      ],
    },
    spring: {
      intro: 'Plan the summer that matters most so far.',
      items: [
        { id: 'camps', label: 'Pick two or three summer camps where your list schools will be', hint: '“On your list” at the top of the Camps tab shows them.', tab: 'camps', auto: 'campTracked' },
        { id: 'stats', label: 'Update your profile with this season’s stats', hint: 'My Info → Stats.', tab: 'myinfo' },
        { id: 'visit', label: 'Visit a campus near you that is on your list', hint: 'An unofficial visit is on your own dime and can happen any time.' },
      ],
    },
    summer: {
      intro: 'From June 15, most Division I and II coaches can call, text and email you. Football and a few other sports have later dates.',
      items: [
        { id: 'ready', label: 'Make sure every coach on your list has your current email, phone and film', hint: 'Check My Info and your profile page.', tab: 'myinfo', months: [5] },
        { id: 'reply', label: 'Answer every coach who reaches out within a day or two', hint: 'Even a “not interested” coach deserves a thank-you.' },
        { id: 'before', label: 'Tell coaches which camps and events you’ll be at', hint: 'Templates → Before a Camp or Showcase.', tab: 'templates', auto: 'emailed3' },
        { id: 'after', label: 'Follow up after each camp', hint: 'Templates → After a Camp or Combine, within a few days.', tab: 'templates' },
      ],
    },
  },

  junior: {
    fall: {
      intro: 'The year most college programs build their lists. Most coaches at every level can talk to you now.',
      items: [
        { id: 'update', label: 'Email your Target coaches a junior-year update', hint: 'Grades, schedule and newest film. Aim for five coaches this month.', tab: 'templates', auto: 'emailed5' },
        { id: 'q', label: 'Submit a questionnaire for every list school that has one', hint: 'The Questionnaires tab links the right form for each school.', tab: 'questionnaires', auto: 'questionnaireMonth' },
        { id: 'opened', label: 'Follow up with coaches who opened your profile', hint: 'Look for 👀 on your roster. An open is the best time to send a note.', tab: 'roster' },
        { id: 'schedule', label: 'Send your season schedule so coaches can come watch', hint: 'Templates → Season / Film Update.', tab: 'templates' },
      ],
    },
    winter: {
      intro: 'In season. Keep the coaches who answered close, and keep the list honest.',
      items: [
        { id: 'film', label: 'Send new film to every coach who has replied', hint: 'A short update every few weeks is welcome, not pushy.', tab: 'templates', auto: 'emailed3' },
        { id: 'quiet', label: 'Follow up with anyone quiet for three weeks or more', hint: 'Templates → Follow-up.', tab: 'templates' },
        { id: 'lanes', label: 'Move schools between lanes based on who’s answering', hint: 'Replies tell you your level better than anything else.', tab: 'roster' },
      ],
    },
    spring: {
      intro: 'The summer after junior year is the busiest time for coaches to see you play. Plan it now.',
      items: [
        { id: 'camps', label: 'Plan summer camps and showcases where your list schools will be', hint: 'Showcases on RecruitGrid list the programs attending.', tab: 'camps', auto: 'campTracked' },
        { id: 'cert', label: 'Upgrade to an NCAA Certification Account if D1 or D2 schools are interested', hint: 'Needed before an official visit or a scholarship offer from those divisions.', href: ELIGIBILITY_CENTER_URL },
        { id: 'call', label: 'Ask the coaches you talk to most for a call or visit', hint: 'Templates → Requesting a Visit or Call.', tab: 'templates' },
      ],
    },
    summer: {
      intro: 'Get seen, then follow up. The follow-up is where most athletes drop off.',
      items: [
        { id: 'before', label: 'Tell coaches where you’ll play before each event', hint: 'Templates → Before a Camp or Showcase.', tab: 'templates', auto: 'emailed3' },
        { id: 'after', label: 'Email every coach you met within a few days', hint: 'Templates → After a Camp or Combine.', tab: 'templates' },
        { id: 'transcript', label: 'Ask your counselor to upload your transcript through junior year', hint: 'To the NCAA Eligibility Center, once junior grades post.', href: ELIGIBILITY_CENTER_URL, months: [5, 6] },
      ],
    },
  },

  senior: {
    fall: {
      intro: 'Narrow to the schools that are actually talking to you, and apply to them.',
      items: [
        { id: 'narrow', label: 'Focus on schools that have replied', hint: 'Keep Safety schools in play until you have an offer you want.', tab: 'roster' },
        { id: 'apply', label: 'Apply for admission at your Target and Safety schools', hint: 'Athletes still have to be admitted. Ask each coach about their deadlines.' },
        { id: 'fafsa', label: 'File the FAFSA', hint: 'It opens around October 1. Some aid runs out, so earlier is better.', href: FAFSA_URL, months: [9] },
        { id: 'naia', label: 'Register with the NAIA Eligibility Center if NAIA schools are on your list', hint: 'NAIA schools need it before you can play.', href: NAIA_ELIGIBILITY_URL },
        { id: 'keep', label: 'Keep emailing — D2, D3, NAIA and junior college coaches recruit into spring', hint: 'Templates → Season / Film Update.', tab: 'templates', auto: 'emailed3' },
      ],
    },
    winter: {
      intro: 'Many programs sign their class in November. Plenty of spots are still open after that.',
      items: [
        { id: 'timeline', label: 'Ask each coach talking to you what their signing timeline is', hint: 'A direct question is expected at this point.' },
        { id: 'update', label: 'Send senior season film to every coach still in the picture', hint: 'Templates → Season / Film Update.', tab: 'templates', auto: 'emailed3' },
        { id: 'walkon', label: 'Ask about walk-on spots where a scholarship isn’t there', hint: 'Templates → Walk-On Inquiry.', tab: 'templates' },
      ],
    },
    spring: {
      intro: 'Decision season. Compare the whole package, not just the sport.',
      items: [
        { id: 'compare', label: 'Compare offers: aid, playing time, degree and cost after aid', hint: 'Ask each school for the numbers in writing.' },
        { id: 'deposit', label: 'Check each school’s enrollment deposit deadline', hint: 'Many are May 1.' },
        { id: 'closeout', label: 'Send a courtesy note to every school you’re not choosing', hint: 'Templates → Courtesy Close-out. Coaches remember.', tab: 'templates' },
      ],
    },
    summer: {
      intro: 'Last paperwork before you report.',
      items: [
        { id: 'final', label: 'Ask your counselor to send your final transcript and proof of graduation', hint: 'To the NCAA or NAIA Eligibility Center — you can’t be cleared without it.', href: ELIGIBILITY_CENTER_URL },
        { id: 'thanks', label: 'Thank the coaches and people who helped you get here', hint: 'Templates → Thank You.', tab: 'templates' },
      ],
    },
  },

  graduated: {
    all: {
      intro: 'Still looking? Junior college and prep years are real routes.',
      items: [
        { id: 'juco', label: 'Email junior college coaches', hint: 'They can contact you any time and often fill rosters late.', tab: 'templates' },
        { id: 'film', label: 'Keep your film and profile current', hint: 'Coaches will look again after a year of development.', tab: 'film', auto: 'filmMonth' },
      ],
    },
  },
};

/**
 * The checklist for this athlete this month, or null without a graduation year.
 * @returns {{ monthKey, title, intro, items }}
 */
export function monthlyChecklist(gradYear, now = new Date()) {
  const pos = classPosition(gradYear, now);
  if (!pos) return null;
  const month = now.getMonth();
  const season = seasonOf(month);
  const block = PLAN[pos.key][season] || PLAN[pos.key].all;
  const items = block.items.filter((it) => !it.months || it.months.includes(month));
  return {
    monthKey: `${now.getFullYear()}-${String(month + 1).padStart(2, '0')}`,
    title: `${MONTHS[month]} · ${pos.label}`,
    season: SEASON_LABEL[season],
    intro: block.intro,
    items,
  };
}

// YYYY-MM-DD for a moment, in a time zone (the browser's own when omitted).
// en-CA is the locale that formats dates that way.
export function ymdIn(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

const CONTACTED = (status) => !!status && status !== 'not_contacted';

/**
 * Which `auto` checklist keys are satisfied by stored data. Shared by the
 * Roster strip and the parent email, so the two never disagree about what is
 * done. Only counts this month where the item is about this month.
 *
 * @param {object} data { coaches, film, camps } — camps are user_camps rows
 * @param {Date}   now
 * @param {string} [timeZone] omitted in the browser; the server passes one
 */
export function checklistAutoDone({ coaches = [], film = [], camps = [] }, now = new Date(), timeZone) {
  const today = ymdIn(now, timeZone);
  const month = today.slice(0, 7);
  const inThisMonth = (ts) => !!ts && ymdIn(new Date(ts), timeZone).slice(0, 7) === month;
  const emailedThisMonth = coaches.filter((c) => CONTACTED(c.status) && inThisMonth(c.status_changed_at)).length;
  return {
    film: film.length > 0,
    filmMonth: film.some((f) => inThisMonth(f.created_at)),
    coaches10: coaches.length >= 10,
    coaches20: coaches.length >= 20,
    emailed3: emailedThisMonth >= 3,
    emailed5: emailedThisMonth >= 5,
    questionnaireMonth: coaches.some((c) => inThisMonth(c.questionnaire_submitted_at)),
    campTracked: camps.some((c) => (c.camp_date && c.camp_date >= today) || inThisMonth(c.created_at)),
  };
}

/** Checklist items with `done` and `auto` resolved. ticks: item ids ticked by hand this month. */
export function resolveChecklist(checklist, autoDone, ticks = []) {
  return (checklist?.items || []).map((it) => ({
    ...it,
    auto: !!(it.auto && autoDone[it.auto]),
    done: !!(it.auto && autoDone[it.auto]) || ticks.includes(it.id),
  }));
}
