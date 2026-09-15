// The Sunday parent update, and the one confirmation email that has to come
// first.
//
// Same construction rules as camp-reminder.js: tables and inline styles, since
// Outlook renders through Word. Copy uses the athlete's name, never "he" or
// "she" — we don't know an athlete's pronouns, and the name is always right.
//
// The postal address is in both footers. The weekly update is about the
// family's own account rather than marketing, but it goes to someone who
// isn't the account holder, and the address costs nothing.

const INK = '#17181A';
const GOLD = '#E8B23B';
const PAPER = '#FAFAF8';
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const LINE = '#EDEEF0';
const SITE = 'https://recruitgrid.app';
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
const POSTAL = 'RecruitGrid · 9620 S Las Vegas Blvd, Suite E4 #1146, Las Vegas, NV 89123';

const TIER_STYLE = {
  dream: ['Dream', '#EDE7F6', '#5B3F8F'],
  target: ['Target', '#FBF1DA', '#8A6412'],
  safety: ['Safety', '#E3F1E7', '#2F6B40'],
};

export function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function tierTag(tier) {
  const t = TIER_STYLE[tier];
  if (!t) return '';
  return ` <span style="display:inline-block;font:700 10px/1 ${FONT};letter-spacing:.6px;text-transform:uppercase;padding:3px 6px;border-radius:3px;background:${t[1]};color:${t[2]};vertical-align:1px;">${t[0]}</span>`;
}

function label(text) {
  return `<div style="font:700 11px/1 ${FONT};letter-spacing:1.3px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">${text}</div>`;
}

function rows(items) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items
    .map(
      (r, i) => `<tr><td style="padding:10px 0;${i < items.length - 1 ? `border-bottom:1px solid ${LINE};` : ''}">
        <div style="font:400 15px/1.45 ${FONT};color:${INK};">${r.title}</div>
        ${r.meta ? `<div style="font:400 13px/1.5 ${FONT};color:${MUTED};margin-top:1px;">${r.meta}</div>` : ''}
      </td></tr>`
    )
    .join('')}</table>`;
}

function section(inner) {
  return `<tr><td style="padding:20px 32px 2px;">${inner}</td></tr>`;
}

function shell({ title, preheader, body, footer }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#EDEEF0;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEEF0;padding:28px 12px;">
 <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${PAPER};border-radius:10px;overflow:hidden;">
   ${body}
   <tr><td style="padding:18px 32px 24px;border-top:1px solid ${LINE};">
     <p style="margin:0 0 6px;font:400 12px/1.6 ${FONT};color:${MUTED};">${footer}</p>
     <p style="margin:0;font:400 12px/1.6 ${FONT};color:${MUTED};">${POSTAL}</p>
   </td></tr>
  </table>
 </td></tr>
</table>
</body></html>`;
}

function header(title, sub) {
  return `<tr><td style="background:${INK};padding:22px 32px;">
     <div style="font:700 12px/1 ${FONT};letter-spacing:2.4px;color:${GOLD};">RECRUITGRID</div>
     <div style="font:700 24px/1.25 ${FONT};color:#FFFFFF;margin:10px 0 3px;">${title}</div>
     ${sub ? `<div style="font:400 13px/1.4 ${FONT};color:#A9ABB1;">${sub}</div>` : ''}
   </td></tr>`;
}

function button(href, text) {
  return `<tr><td style="padding:20px 32px 8px;">
     <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${GOLD};border-radius:6px;">
       <a href="${esc(href)}" style="display:inline-block;padding:13px 22px;font:700 14px/1 ${FONT};color:${INK};text-decoration:none;">${text}</a>
     </td></tr></table>
   </td></tr>`;
}

/**
 * @param {object} w  from composeParentWeekly in lib/parent-weekly.js
 * @param {string} stopUrl
 */
export function parentWeeklyEmail(w, stopUrl) {
  const first = esc(w.firstName);
  const stat = (n, text, gold) => `<td width="33%" style="padding:0 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E4E5E8;border-radius:6px;">
        <tr><td align="center" style="padding:12px 6px;">
          <div style="font:700 28px/1 ${FONT};color:${gold && n ? '#C99A34' : INK};">${n}</div>
          <div style="font:400 12px/1.3 ${FONT};color:${MUTED};margin-top:4px;">${text}</div>
        </td></tr>
      </table></td>`;

  const parts = [];
  parts.push(header(`${first}'s recruiting week`, esc(w.subtitle)));
  parts.push(`<tr><td style="padding:22px 28px 2px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${stat(w.stats.contacted, w.stats.contacted === 1 ? 'coach contacted' : 'coaches contacted')}
      ${stat(w.stats.opened, w.stats.opened === 1 ? 'coach opened the profile' : 'coaches opened the profile', true)}
      ${stat(w.stats.questionnaires, w.stats.questionnaires === 1 ? 'questionnaire' : 'questionnaires')}
    </tr></table></td></tr>`);

  if (w.opens.length) {
    parts.push(section(label(`👀 Coaches who opened ${first}'s profile`) + rows(w.opens.map((o) => ({
      title: `${esc(o.coach)} · ${esc(o.school)}${tierTag(o.tier)}`,
      meta: esc(o.meta),
    })))));
  }

  if (w.question) {
    parts.push(`<tr><td style="padding:18px 32px 2px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="3" style="background:${GOLD};border-radius:2px;"></td>
        <td style="background:#FBF3DF;padding:14px 16px;">
          <div style="font:700 11px/1 ${FONT};letter-spacing:1.3px;text-transform:uppercase;color:#8A6412;margin-bottom:7px;">One thing to ask ${first} this week</div>
          <div style="font:400 15px/1.5 ${FONT};color:${BODY};">${esc(w.question)}</div>
        </td>
      </tr></table></td></tr>`);
  }

  if (w.nudges.length) {
    parts.push(section(label('Worth a nudge · no contact in 30+ days') + rows(w.nudges.map((n) => ({
      title: `${esc(n.school)}${tierTag(n.tier)}`,
      meta: esc(n.meta),
    })))));
  }

  if (w.upcoming.length) {
    parts.push(section(label('Coming up') + rows(w.upcoming.map((u) => ({
      title: u.url ? `<a href="${esc(u.url)}" style="color:${INK};text-decoration:none;">${esc(u.title)}</a>` : esc(u.title),
      meta: esc(u.meta),
    })))));
  }

  if (w.checklist.items.length) {
    parts.push(section(label(`${first}'s ${esc(w.checklist.month)} checklist`) + w.checklist.items.map((it) =>
      `<div style="font:400 14px/1.5 ${FONT};color:${it.done ? BODY : '#55585E'};padding:4px 0;">
         <span style="display:inline-block;width:20px;font-weight:700;color:${it.done ? '#3F7A4E' : '#B7B9BE'};">${it.done ? '✓' : '○'}</span>${esc(it.label)}
       </div>`).join('')));
  }

  parts.push(button(`${SITE}/app`, 'Open RecruitGrid →'));

  const footer = `${esc(w.athleteName)} added you to get this weekly update, and it was confirmed from this inbox. It shows activity on RecruitGrid — nothing here is sent to coaches. <a href="${esc(stopUrl)}" style="color:${MUTED};text-decoration:underline;">Stop these updates</a>`;

  return {
    subject: w.subject,
    html: shell({ title: w.subject, preheader: w.preheader, body: parts.join(''), footer }),
  };
}

/**
 * The only email sent to a parent address before it is confirmed.
 */
export function parentConfirmEmail({ athleteName, firstName, confirmUrl }) {
  const name = esc(athleteName || firstName || 'An athlete');
  const first = esc(firstName || athleteName || 'the athlete');
  const subject = `${athleteName || firstName || 'An athlete'} wants to send you weekly recruiting updates`;
  const body = [
    header('Weekly recruiting updates?', ''),
    `<tr><td style="padding:24px 32px 2px;">
       <p style="margin:0 0 14px;font:400 15px/1.6 ${FONT};color:${BODY};">
         ${name} uses RecruitGrid to keep track of college coaches, camps and recruiting emails, and added this address to get a short update every Sunday.
       </p>
       <p style="margin:0 0 6px;font:400 15px/1.6 ${FONT};color:${BODY};">Each update shows:</p>
       <ul style="margin:0 0 6px;padding-left:20px;font:400 15px/1.7 ${FONT};color:${BODY};">
         <li>how many coaches ${first} contacted that week</li>
         <li>which coaches opened ${first}'s recruiting profile</li>
         <li>schools that haven't heard from ${first} in a while</li>
         <li>camps coming up, and this month's checklist</li>
       </ul>
     </td></tr>`,
    button(confirmUrl, 'Yes, send me the updates'),
    `<tr><td style="padding:6px 32px 8px;">
       <p style="margin:0;font:400 13px/1.6 ${FONT};color:${MUTED};">
         Nothing is sent until you confirm. If you don't know ${name}, ignore this email and you won't hear from us again.
       </p>
     </td></tr>`,
  ].join('');
  return {
    subject,
    html: shell({ title: subject, preheader: 'Confirm to get a short update every Sunday.', body, footer: 'You got this because someone entered this address in their RecruitGrid account.' }),
  };
}
