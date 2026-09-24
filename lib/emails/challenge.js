// The 7-day challenge (app/api/cron/challenge).
//
// One task a day, none longer than ten minutes, ending with the athlete having
// written to a real college coach. It exists because of the 2026-09-23 pull:
// 35 accounts, 4 published profiles, one athlete who had ever emailed anybody.
// The gap is not information — the guides, staff links and questionnaires are
// all there — it is that nobody tells a family what to do today.
//
// Day 3 is deliberately its own day, and deliberately before questionnaires
// (the marketing plan had it the other way round). Every account outside the
// founder's had picked schools and saved ZERO coach addresses, so finding one
// human being to write to is the wall, not paperwork.
//
// Every day adapts. If the task is already done the email says so and asks for
// ten seconds instead of ten minutes — otherwise day 1 reads as an insult to
// someone who published a profile a month ago. `done` decides which of the two
// bodies is used; `stats` fills the numbers in day 7's recap.

import { esc, shell, header, button } from './parent-weekly';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const GOLD = '#8A6412';
const SITE = 'https://recruitgrid.app';

const para = (t) => `<p style="margin:0 0 12px;font:400 15px/1.6 ${FONT};color:${BODY};">${t}</p>`;
const list = (items) => `<ul style="margin:0 0 12px;padding-left:20px;font:400 15px/1.7 ${FONT};color:${BODY};">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const label = (t) => `<p style="margin:0 0 14px;font:700 12px/1 ${FONT};letter-spacing:1.6px;text-transform:uppercase;color:${GOLD};">${t}</p>`;
const note = (t) => `<table role="presentation" width="100%" style="margin:2px 0 14px;"><tr><td style="background:#F6F1E3;border-left:3px solid #E8B23B;padding:11px 14px;font:400 14px/1.55 ${FONT};color:${BODY};">${t}</td></tr></table>`;

const APP = `${SITE}/app`;

/** The seven days. `todo` is the normal body; `did` runs when it's already done. */
const DAYS = [
  {
    n: 1,
    title: 'Your profile',
    mins: '6 minutes',
    subject: 'Day 1: the thing coaches actually open',
    task: 'Publish your profile',
    doneTask: 'Check your profile',
    href: `${SITE}/app?setup=1`,
    todo: () => [
      para('Welcome to the 7-day challenge. One task a day, none longer than ten minutes, and by the end of the week your athlete will have written to a real college coach.'),
      para('Today is the profile. It is the link that goes in every email you ever send a coach — height, position, grad year, film, schedule and grades on one page they can open on a phone between games.'),
    ],
    did: () => [
      para('Welcome to the 7-day challenge — one task a day, none longer than ten minutes, ending with an email to a real college coach.'),
      para('<b>Day 1 is already done: your profile is published.</b> So today takes ten seconds instead of ten minutes — open it, check the film link plays and the grad year is right, and that is the day.'),
    ],
  },
  {
    n: 2,
    title: 'Your school list',
    mins: '10 minutes',
    subject: 'Day 2: ten schools, three lanes',
    task: 'Add ten schools',
    doneTask: 'Look at your list again',
    href: APP,
    todo: () => [
      para('Ten schools today, split three ways:'),
      list([
        '<b>Dream</b> — two or three. The ones you would drop everything for.',
        '<b>Target</b> — five or six. Realistic, and where most of your replies will come from.',
        '<b>Safety</b> — two or three. Schools that would take your athlete today.',
      ]),
      para('Most families put eight of ten in the Dream lane and hear nothing all year. The Target lane is the one that answers, and the Safety lane is what keeps a senior playing somewhere.'),
      note('Division II, Division III, NAIA and junior colleges belong on this list. Most college athletes play outside Division I, and those coaches recruit later and reply more often.'),
    ],
    did: ({ stats }) => [
      para(`<b>You already have ${stats.schools} schools on your list</b>, so today is a read-through rather than a build.`),
      para('Check the split: two or three Dream, five or six Target, two or three Safety. If almost everything sits in the Dream lane, move a few — the Target lane is the one that answers.'),
    ],
  },
  {
    n: 3,
    title: 'Find the coaches',
    mins: '10 minutes',
    subject: 'Day 3: who do you actually email?',
    task: 'Save three coach emails',
    doneTask: 'Add one more coach',
    href: APP,
    todo: () => [
      para('This is the day everyone gets stuck on, so it gets a day to itself.'),
      para('Every school on your list carries a link to that school’s coaching staff page — 1,200-plus colleges are already linked. Open three of them, find the <b>recruiting coordinator</b> or an assistant coach for your position, and save the address on that school in your roster.'),
      list([
        'Assistant coaches and recruiting coordinators read their own email. Head coaches at bigger programs often do not.',
        'No address listed? Use the department phone number or the general athletics address and ask who handles recruiting for your class.',
      ]),
      note('Three is enough. You are not building a mailing list today — you are getting to one real human being.'),
    ],
    did: ({ stats }) => [
      para(`<b>${stats.addresses} of your schools already have a coach’s address saved</b>, which puts you ahead of almost everyone who starts this week.`),
      para('If you have ten minutes anyway, add one more — the staff link sits on each school in your roster.'),
    ],
  },
  {
    n: 4,
    title: 'Questionnaires',
    mins: '8 minutes',
    subject: 'Day 4: the form that puts you in their system',
    task: 'Fill out three questionnaires',
    doneTask: 'Log any you have sent',
    href: `${SITE}/questionnaires`,
    todo: () => [
      para('A recruiting questionnaire is how a program puts an athlete in its database. It is not an application, and filling one in is not being recruited — but coaches do check whether the name in their inbox is already in the system.'),
      para('We have the forms for 1,900-plus programs. Find three schools from your list, fill them in, and log them so that in March you are not guessing which ones you did.'),
      note('Use the athlete’s own email address, not a parent’s. Everything afterwards — camp invites, replies, newsletters — goes to whatever address is typed into that form.'),
    ],
    did: ({ stats }) => [
      para(`<b>${stats.questionnaires} questionnaires logged already.</b> Nothing to do today unless you have sent others outside RecruitGrid — log those too, so the list is the truth in March.`),
    ],
  },
  {
    n: 5,
    title: 'The first email',
    mins: '10 minutes',
    subject: 'Day 5: send it',
    task: 'Write to one coach',
    doneTask: 'Write to one more',
    href: APP,
    todo: () => [
      para('Today is the whole point of the week.'),
      para('Pick one school from Day 3 — a Target, not a Dream. The draft is already written: stats, film and profile link filled in. Add one sentence that only applies to that school, and send it from the athlete’s own email.'),
      list([
        'One sentence is enough: something true about the program, the campus, or the way they play.',
        'Send it from the athlete’s address. Coaches want to hear from the player.',
        'If a coach opens the profile link, you get an email telling you.',
      ]),
      note('It will feel like a big deal to send. It is a completely ordinary email for a coach to receive — they get hundreds, and they read them.'),
    ],
    did: ({ stats }) => [
      para(`<b>You have already written to ${stats.emailed} ${stats.emailed === 1 ? 'coach' : 'coaches'}.</b> That is the hard part done.`),
      para('Today’s version is simpler: send one more, to the next school down your Target lane. The draft is already waiting.'),
    ],
  },
  {
    n: 6,
    title: 'Follow-up dates',
    mins: '5 minutes',
    subject: 'Day 6: the part nobody does',
    task: 'Set your next steps',
    doneTask: 'Check your dates',
    href: APP,
    todo: () => [
      para('Most families send one round of emails, hear nothing for two weeks, and quietly decide recruiting is not for them. The coaches are not ignoring anyone — they are in season and the inbox is full.'),
      para('So put the next move on the calendar now: a follow-up a couple of weeks out for the coach you wrote yesterday, and a date for the next two schools on the list.'),
      note('We will remind you on the day. That is what turns a burst of effort into a process.'),
    ],
    did: () => [
      para('<b>You already have next steps on the calendar</b>, which is more than most families manage all season.'),
      para('Worth a two-minute look: are the dates still right, and is anything already overdue?'),
    ],
  },
  {
    n: 7,
    title: 'Your plan',
    mins: '5 minutes',
    subject: 'Day 7: what you built this week',
    task: 'See this month’s checklist',
    doneTask: 'See this month’s checklist',
    href: APP,
    todo: ({ stats }) => [
      para('Seven days ago this was a spreadsheet, or nothing at all. Now:'),
      list([
        stats.published ? 'a published profile with a link that works' : 'an account ready for the profile whenever you are',
        `${stats.schools} school${stats.schools === 1 ? '' : 's'} on the list`,
        `${stats.addresses} coach${stats.addresses === 1 ? '' : 'es'} with a real address`,
        `${stats.questionnaires} questionnaire${stats.questionnaires === 1 ? '' : 's'} logged`,
        `${stats.emailed} coach${stats.emailed === 1 ? '' : 'es'} written to`,
      ]),
      para('From here it runs on a rhythm instead of a push:'),
      list([
        'a short checklist each month, built around the graduation year',
        'a to-do list when you open the app — only what is actually due',
        'a Sunday summary for a parent, so nobody has to ask how it is going',
      ]),
      note('Reply and tell me how the week went — what was confusing, what was missing. I read every one, and it decides what I build next. — Angela'),
    ],
  },
];

/**
 * @param {object}  o
 * @param {number}  o.day    1–7
 * @param {boolean} o.done   the task is already complete
 * @param {string}  o.firstName
 * @param {object}  o.stats  { published, schools, addresses, questionnaires, emailed, nextSteps }
 * @param {string}  o.unsubscribeUrl
 */
export function challengeEmail({ day, done, firstName, stats, unsubscribeUrl }) {
  const d = DAYS[Math.min(Math.max(day, 1), 7) - 1];
  const useDid = done && typeof d.did === 'function';
  const hi = firstName ? `Hi ${esc(firstName)},` : 'Hi there,';
  const blocks = (useDid ? d.did : d.todo)({ stats });
  const next = d.n < 7 ? DAYS[d.n].title : '';

  const body = [
    header(`Day ${d.n} — ${d.title}`, `${useDid ? 'Already done' : d.mins} · Day ${d.n} of 7`),
    `<tr><td style="padding:22px 32px 2px;">${label('Today’s task')}${para(hi)}${blocks.join('')}</td></tr>`,
    button(d.href, `${(useDid ? d.doneTask : d.task)} →`),
    `<tr><td style="padding:6px 32px 10px;">
      <p style="margin:0;font:400 13px/1.6 ${FONT};color:${MUTED};">
        Day ${d.n} of 7${next ? ` · tomorrow: ${next}` : ' · that’s the week — nothing more from the challenge'}
      </p>
    </td></tr>`,
  ].join('');

  const footer = `You’re getting this because you started the RecruitGrid 7-day challenge. <a href="${esc(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">Stop the challenge emails</a>`;
  return { subject: d.subject, html: shell({ title: d.subject, preheader: useDid ? 'Already done — ten seconds today.' : d.task, body, footer }) };
}

export const CHALLENGE_DAYS = DAYS.map((d) => ({ n: d.n, title: d.title, mins: d.mins, task: d.task }));
