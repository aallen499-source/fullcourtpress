// The first-coach-email nudges (app/api/cron/first-email).
//
// Why this email exists, written down because the numbers were stark: on
// 2026-09-23 the whole platform had 35 accounts, 4 published profiles and
// exactly ONE athlete who had ever emailed a coach — and that one was the
// founder's son. People sign up, publish a profile, feel finished, and never
// come back. Publishing is the satisfying part; writing to a stranger who
// might say no is the part that gets put off forever.
//
// So this does not say "come back to RecruitGrid". It names one school the
// athlete chose themselves and gives them the single next click for it —
// either the coach's inbox or the staff page where that address lives.
//
// Three shapes, because "send your first email" is useless advice if there is
// nobody to send it to yet:
//   write   — a coach row with an address: deep-link straight into the composer
//   find    — schools on the list but no addresses: link that school's staff page
//   schools — published with an empty list: go add three schools
//
// Two of these, a week apart, then silence. Same rule as the setup reminders:
// a nudge that keeps coming after it is clearly unwanted is just mail.

import { esc, shell, header, button } from './parent-weekly';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const SITE = 'https://recruitgrid.app';

const para = (text) => `<p style="margin:0 0 12px;font:400 15px/1.6 ${FONT};color:${BODY};">${text}</p>`;

/**
 * @param {object} o
 * @param {1|2}    o.which          first nudge or last one
 * @param {'write'|'find'|'schools'} o.mode
 * @param {string} o.firstName      may be empty
 * @param {string} o.school         the one school this email is about
 * @param {string} o.coachLabel     "Coach Burcar", or "the staff" when unnamed
 * @param {string} o.coachId        for the /app?write= deep link (mode 'write')
 * @param {string} o.staffUrl       that school's staff directory (mode 'find')
 * @param {string} o.unsubscribeUrl
 */
export function firstEmailNudge({ which, mode, firstName, school, coachLabel, coachId, staffUrl, unsubscribeUrl }) {
  const hi = firstName ? `Hi ${esc(firstName)},` : 'Hi there,';
  const last = which === 2;
  const schoolName = esc(school || '');
  const coach = esc(coachLabel || 'the staff');

  let subject;
  let headline;
  let lead;
  let ctaUrl;
  let ctaLabel;

  if (mode === 'write') {
    subject = last ? `Still worth sending — ${school}` : `One email to ${school}`;
    headline = 'Your profile is live. Now send it to somebody.';
    lead = [
      para(hi),
      para(`Your profile has been published for a few days, which means the link works and the film loads — and ${coach} at <b>${schoolName}</b> hasn’t heard from you yet.`),
      para('The draft is already written. Your stats, your film and your profile link are filled in; you add one sentence about why that school, and send it from your own email app.'),
    ].join('');
    ctaUrl = `${SITE}/app?write=${encodeURIComponent(coachId || '')}&template=t_intro`;
    ctaLabel = `Write to ${coach} →`;
  } else if (mode === 'find') {
    subject = last ? `Still worth finding — ${school}` : `Who to email at ${school}`;
    headline = 'Your profile is live. One address away.';
    lead = [
      para(hi),
      para(`<b>${schoolName}</b> is on your list, but there’s no coach email saved for it yet — so nothing can go out.`),
      para('Their staff page lists the coaching staff and their addresses. Copy the recruiting coordinator or an assistant coach, put it on the school in your roster, and the draft is ready to send.'),
    ].join('');
    ctaUrl = staffUrl || `${SITE}/app`;
    ctaLabel = `Find the coach at ${schoolName} →`;
  } else {
    subject = last ? 'Still here when you pick your schools' : 'Your profile is live — who’s it for?';
    headline = 'Your profile is live. Now pick the schools.';
    lead = [
      para(hi),
      para('Your profile is published and the link works. The next part is a list of schools to send it to — three is enough to start.'),
      para('Add them in your roster and each one comes with a link to that school’s coaching staff, so you can find who to write to.'),
    ].join('');
    ctaUrl = `${SITE}/app`;
    ctaLabel = 'Add my first schools →';
  }

  const tail = last
    ? 'This is the last nudge about it — you won’t hear from me on this again. Whenever you do send one, the alerts will tell you if the coach opens your profile.<br>— Angela'
    : 'If you’ve already emailed coaches outside RecruitGrid, mark them contacted on your roster and I’ll stop nagging. Questions? Just reply; I read every one.<br>— Angela';

  const body = [
    header(headline, ''),
    `<tr><td style="padding:24px 32px 2px;">${lead}</td></tr>`,
    button(ctaUrl, ctaLabel),
    `<tr><td style="padding:6px 32px 10px;">
      <p style="margin:0;font:400 13px/1.6 ${FONT};color:${MUTED};">${tail}</p>
    </td></tr>`,
  ].join('');

  const footer = `You’re getting this because you created a RecruitGrid account. <a href="${esc(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">Stop update emails</a>`;
  const preheader = mode === 'write'
    ? `The draft to ${school} is already written.`
    : mode === 'find'
    ? `Their staff page has the address.`
    : 'Three schools is enough to start.';

  return { subject, html: shell({ title: subject, preheader, body, footer }) };
}
