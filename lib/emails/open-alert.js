// "A coach opened your profile" — sent to the athlete the first time a coach
// opens the link in a day (app/api/opened). Built from the same pieces as the
// parent update so the account emails look like one product.
//
// The link may have gone out in an email or pasted into the school's
// questionnaire (the Questionnaires tab copies one per school), so the copy
// doesn't say which.
//
// The point of the email is timing: a follow-up that lands while the coach is
// still thinking about the athlete is the one most likely to be answered. So
// the one button opens a follow-up to that coach, ready to write.

import { esc, shell, header, button } from './parent-weekly';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const SITE = 'https://recruitgrid.app';

/**
 * @param {object} o
 * @param {string} o.firstName
 * @param {string} o.coachLabel     "Coach Reyes" or "A coach"
 * @param {string} o.school
 * @param {number} o.openCount      opens so far, including this one
 * @param {string} o.lastEmailed    "Sep 2", or '' when never logged
 * @param {string} o.coachId
 * @param {string} o.unsubscribeUrl
 */
export function openAlertEmail({ firstName, coachLabel, school, openCount, lastEmailed, coachId, unsubscribeUrl }) {
  const who = school ? `${coachLabel} at ${school}` : coachLabel;
  const subject = `${who} opened your profile`;
  const facts = [
    openCount > 1 ? `That's ${openCount} opens so far.` : 'First time opening it.',
    lastEmailed ? `You last emailed them ${lastEmailed}.` : '',
  ].filter(Boolean).join(' ');
  const body = [
    header(`👀 ${esc(who)} just opened your profile`, ''),
    `<tr><td style="padding:22px 32px 2px;">
       <p style="margin:0 0 12px;font:400 15px/1.6 ${FONT};color:${BODY};">
         ${firstName ? `${esc(firstName)}, the` : 'The'} recruiting profile link you sent ${school ? esc(school) : 'this coach'} was opened. ${esc(facts)}
       </p>
       <p style="margin:0;font:400 15px/1.6 ${FONT};color:${BODY};">
         Now is a good time to follow up — a short note with something new: a game, a stat, new film, or where they can see you play next.
       </p>
     </td></tr>`,
    button(`${SITE}/app?write=${encodeURIComponent(coachId)}&template=t_followup`, 'Write a follow-up →'),
    `<tr><td style="padding:4px 32px 8px;">
       <p style="margin:0;font:400 13px/1.6 ${FONT};color:${MUTED};">
         Only real opens count: link scanners and your own visits don't. You'll get at most one of these per coach per day.
       </p>
     </td></tr>`,
  ].join('');
  const footer = `You're getting this because you sent this school your RecruitGrid profile link, by email or in a questionnaire. <a href="${esc(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">Turn off these alerts</a>`;
  return { subject, html: shell({ title: subject, preheader: 'A good moment to send a follow-up.', body, footer }) };
}
