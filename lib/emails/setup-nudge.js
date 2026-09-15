// The two setup reminders (app/api/cron/setup-nudges). Friendly, short, from
// Angela, and honest about how many there will be — the second says it's the
// last. Uses the shared account-email layout.

import { esc, shell, header, button } from './parent-weekly';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const SITE = 'https://recruitgrid.app';

const para = (text) => `<p style="margin:0 0 12px;font:400 15px/1.6 ${FONT};color:${BODY};">${text}</p>`;

/**
 * @param {object} o
 * @param {1|2}    o.which
 * @param {string} o.firstName  may be empty — most haven't entered a name yet
 * @param {string} o.unsubscribeUrl
 */
export function setupNudgeEmail({ which, firstName, unsubscribeUrl }) {
  const hi = firstName ? `Hi ${esc(firstName)},` : 'Hi there,';
  const setupUrl = `${SITE}/app?setup=1`;
  let subject;
  let body;
  if (which === 1) {
    subject = 'You’re about 3 minutes from coach-ready';
    body = [
      header('Your profile takes about 3 minutes', ''),
      `<tr><td style="padding:24px 32px 2px;">
        ${para(hi)}
        ${para('Angela here from RecruitGrid. You signed up a few days ago but haven’t finished setting up — so I wanted to make sure it’s easy to pick back up.')}
        ${para('Setup is five quick screens: your details, one film link, and your first three schools. When it’s done you’ll have:')}
        <ul style="margin:0 0 12px;padding-left:20px;font:400 15px/1.7 ${FONT};color:${BODY};">
          <li>a recruiting profile link to put in every coach email</li>
          <li>your schools, each linked to its coaching staff</li>
          <li>an email when a coach opens your profile</li>
        </ul>
      </td></tr>`,
      button(setupUrl, 'Finish my setup →'),
      `<tr><td style="padding:6px 32px 10px;">
        <p style="margin:0;font:400 13px/1.6 ${FONT};color:${MUTED};">
          If recruiting is on hold right now, no problem — this is the only reminder for a while. Questions? Just reply; I read every one.<br>— Angela
        </p>
      </td></tr>`,
    ].join('');
  } else {
    subject = 'Still here whenever you’re ready';
    body = [
      header('Still here whenever you’re ready', ''),
      `<tr><td style="padding:24px 32px 2px;">
        ${para(hi)}
        ${para('It’s been about a month since I last wrote. Recruiting moves at its own pace, so whenever you’re ready, your RecruitGrid account is right where you left it — and setup still takes about three minutes.')}
        ${para(`If you’d rather read first, our free <a href="${SITE}/resources" style="color:#8A6412;">recruiting resources</a> cover how to email a coach, when coaches can contact you, and what the college levels really mean.`)}
      </td></tr>`,
      button(setupUrl, 'Finish my setup →'),
      `<tr><td style="padding:6px 32px 10px;">
        <p style="margin:0;font:400 13px/1.6 ${FONT};color:${MUTED};">
          This is my last reminder about setup — I won’t email about it again. Wishing you a great season.<br>— Angela
        </p>
      </td></tr>`,
    ].join('');
  }
  const footer = `You’re getting this because you created a RecruitGrid account. <a href="${esc(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">Stop update emails</a>`;
  return { subject, html: shell({ title: subject, preheader: which === 1 ? 'Five quick screens and you’re set.' : 'Your account is right where you left it.', body, footer }) };
}
