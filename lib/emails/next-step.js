// The morning a coach's next step comes due (app/api/cron/next-steps).
// One email per athlete per day, listing every step due, so a busy day is one
// email rather than five.

import { esc, shell, header, button } from './parent-weekly';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
const INK = '#17181A';
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const LINE = '#EDEEF0';
const SITE = 'https://recruitgrid.app';

/**
 * @param {object} o
 * @param {string} o.firstName
 * @param {Array}  o.steps  [{ coachId, coachLabel, school, note, late }]
 * @param {string} o.unsubscribeUrl
 */
export function nextStepEmail({ firstName, steps, unsubscribeUrl }) {
  const one = steps.length === 1 ? steps[0] : null;
  const subject = one
    ? `Today: ${one.note || `follow up with ${one.coachLabel}`}${one.school ? ` · ${one.school}` : ''}`
    : `${steps.length} recruiting next steps due today`;
  const rows = steps
    .map(
      (st, i) => `<tr><td style="padding:12px 0;${i < steps.length - 1 ? `border-bottom:1px solid ${LINE};` : ''}">
        <div style="font:700 15px/1.4 ${FONT};color:${INK};">${esc(st.note || 'Follow up')}</div>
        <div style="font:400 13px/1.5 ${FONT};color:${MUTED};margin-top:2px;">
          ${esc(st.coachLabel)}${st.school ? ` · ${esc(st.school)}` : ''}${st.late ? ' · this was due earlier' : ''}
          ${steps.length > 1 ? `· <a href="${SITE}/app?write=${encodeURIComponent(st.coachId)}&template=t_followup" style="color:#8A6412;">Write to them →</a>` : ''}
        </div>
      </td></tr>`
    )
    .join('');
  const body = [
    header(one ? '📅 Your next step is today' : `📅 ${steps.length} next steps today`, ''),
    `<tr><td style="padding:22px 32px 2px;">
       <p style="margin:0 0 6px;font:400 15px/1.6 ${FONT};color:${BODY};">
         ${firstName ? `${esc(firstName)}, you` : 'You'} set ${one ? 'this' : 'these'} for today on RecruitGrid:
       </p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
     </td></tr>`,
    one
      ? button(`${SITE}/app?write=${encodeURIComponent(one.coachId)}&template=t_followup`, `Write to ${esc(one.coachLabel)} →`)
      : button(`${SITE}/app`, 'Open RecruitGrid →'),
    `<tr><td style="padding:4px 32px 8px;">
       <p style="margin:0;font:400 13px/1.6 ${FONT};color:${MUTED};">
         When it's done, tap Done next to it on your roster. To move it, open the coach and change the date.
       </p>
     </td></tr>`,
  ].join('');
  const footer = `You're getting this because you set a next step in RecruitGrid. <a href="${esc(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">Turn off reminder emails</a>`;
  return { subject, html: shell({ title: subject, preheader: steps.map((s) => s.school).filter(Boolean).join(', '), body, footer }) };
}
