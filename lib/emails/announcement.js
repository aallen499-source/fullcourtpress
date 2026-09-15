// A one-off "what's new" email to existing accounts, to bring back the
// families who signed up and stalled. Sent from the owner's button in account
// settings (app/api/announce). Each copy carries one next step picked from
// that account's own data, because "here are five features" is easy to
// ignore and "your list is ready — send your first three" is not.

import { esc, shell, header, button } from './parent-weekly';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
const INK = '#17181A';
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const LINE = '#EDEEF0';
const SITE = 'https://recruitgrid.app';

const FEATURES = [
  ['Find the coach', 'Pick a school and RecruitGrid links straight to its coaching staff directory — names and emails — for 1,040 NCAA schools.'],
  ['Write to your coaches', 'Choose your Target schools and write one personal email after another, with a box for the line that makes each one yours. Nothing sends until you press send.'],
  ['Know when a coach looks', 'When a coach opens the profile link you emailed, you’ll see 👀 on your roster and get an email, so you can follow up while it matters.'],
  ['This month’s checklist', 'What to do right now for your graduation year, from freshman fall to senior spring — and it ticks itself as you go.'],
  ['A Sunday update for a parent', 'A short weekly email to a parent: coaches contacted, who opened the profile, and what’s coming up.'],
];

/**
 * The single most useful next step for an account.
 * @param {object} a { coaches, withEmail, contacted, published }
 */
export function nextStepFor({ coaches, withEmail, contacted, published }) {
  if (!coaches) return 'Add three schools you’d love to play for. Each one now links to its coaching staff, so finding the right coach takes a minute.';
  if (!withEmail) return 'Add a coach’s email for the schools on your list — click “Find email” next to any school on your roster.';
  if (!contacted) return 'Your list is ready. On your Roster, click ✉ Write to coaches and send your first three.';
  if (!published) return 'Publish your profile (My Info → Publish) so the link in your emails works — and so you’ll know when a coach opens it.';
  return 'Turn on the Sunday update for a parent in your account settings, so someone else sees the wins too.';
}

/**
 * @param {object} o
 * @param {string} o.firstName
 * @param {string} o.nextStep
 * @param {string} o.unsubscribeUrl
 */
export function announcementEmail({ firstName, nextStep, unsubscribeUrl }) {
  const subject = firstName ? `${firstName}, RecruitGrid does a lot more now` : 'RecruitGrid does a lot more now';
  const featureRows = FEATURES.map(
    ([title, text], i) => `<tr><td style="padding:12px 0;${i < FEATURES.length - 1 ? `border-bottom:1px solid ${LINE};` : ''}">
      <div style="font:700 15px/1.4 ${FONT};color:${INK};">${esc(title)}</div>
      <div style="font:400 14px/1.55 ${FONT};color:${BODY};margin-top:2px;">${esc(text)}</div>
    </td></tr>`
  ).join('');
  const body = [
    header('New in RecruitGrid', 'Built from what families told me was hardest'),
    `<tr><td style="padding:24px 32px 2px;">
       <p style="margin:0 0 12px;font:400 15px/1.6 ${FONT};color:${BODY};">Hi${firstName ? ` ${esc(firstName)}` : ''},</p>
       <p style="margin:0 0 12px;font:400 15px/1.6 ${FONT};color:${BODY};">
         I’m Angela — I built RecruitGrid while going through recruiting with my own athlete. The hard part usually isn’t signing up. It’s knowing what to do next, and finding the right coach to write to. So that’s what I’ve been building.
       </p>
     </td></tr>`,
    `<tr><td style="padding:10px 32px 2px;">
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
         <td width="3" style="background:#E8B23B;border-radius:2px;"></td>
         <td style="background:#FBF3DF;padding:14px 16px;">
           <div style="font:700 11px/1 ${FONT};letter-spacing:1.3px;text-transform:uppercase;color:#8A6412;margin-bottom:7px;">Your next step</div>
           <div style="font:400 15px/1.5 ${FONT};color:${BODY};">${esc(nextStep)}</div>
         </td>
       </tr></table>
     </td></tr>`,
    `<tr><td style="padding:18px 32px 2px;">
       <div style="font:700 11px/1 ${FONT};letter-spacing:1.3px;text-transform:uppercase;color:${MUTED};margin:0 0 2px;">What’s new</div>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${featureRows}</table>
       <p style="margin:6px 0 0;font:400 13px/1.6 ${FONT};color:${MUTED};">All of it works on the free plan.</p>
     </td></tr>`,
    button(`${SITE}/app`, 'Pick up where you left off →'),
    `<tr><td style="padding:6px 32px 10px;">
       <p style="margin:0;font:400 14px/1.6 ${FONT};color:${BODY};">
         If anything’s confusing, just reply to this email. I read every one.<br>— Angela, RecruitGrid
       </p>
     </td></tr>`,
  ].join('');
  const footer = `You’re getting this because you have a RecruitGrid account. <a href="${esc(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">Stop update emails</a>`;
  return { subject, html: shell({ title: subject, preheader: 'Find the coach, write to them, and know when they look.', body, footer }) };
}
