// Weekly newsletter email.
//
// Same construction rules as camp-reminder.js: tables and inline styles,
// because Outlook renders through Word and drops <style> blocks, flexbox and
// grid. Absolute image URLs, and every element degrades to something readable
// when images are blocked.
//
// One difference that matters legally: this is MARKETING, not transactional.
// CAN-SPAM requires a physical postal address in the footer of commercial
// email, so POSTAL_ADDRESS below is not decoration and must not be removed.
// The camp reminder has no such requirement, which is why it has no address.

import { tipForWeek } from '../newsletter-tips';

const INK = '#17181A';
const GOLD = '#E8B23B';
const PAPER = '#FAFAF8';
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const SITE = 'https://recruitgrid.app';

// The commercial mailbox, not a home address — the audience here is high
// school athletes and their families, and a footer address is permanent.
const POSTAL_ADDRESS = [
  'RecruitGrid',
  'Angela Schmeckpeper',
  '9620 S Las Vegas Blvd, Suite E4 #1146',
  'Las Vegas, NV 89123',
];

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";

function formatDate(d) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  );
}

function campRow(c) {
  const where = [c.city, c.state].filter(Boolean).join(', ');
  const meta = [formatDate(c.date), where, c.cost != null ? `$${c.cost}` : null]
    .filter(Boolean)
    .join(' · ');
  const label = `${esc(c.school)} — ${esc(c.camp_name)}`;
  const title = c.source_url
    ? `<a href="${esc(c.source_url)}" style="color:${INK};text-decoration:none;">${label}</a>`
    : label;

  return `
    <tr><td style="padding:11px 0;border-bottom:1px solid #EDEEF0;">
      <div style="font:600 15px/1.4 ${FONT};color:${INK};">${title}</div>
      <div style="font:400 13px/1.5 ${FONT};color:${MUTED};margin-top:2px;">${esc(meta)}</div>
    </td></tr>`;
}

function section(heading, camps) {
  if (!camps.length) return '';
  return `
   <tr><td style="padding:4px 32px 0;">
     <div style="font:700 12px/1 ${FONT};letter-spacing:1.2px;text-transform:uppercase;color:${MUTED};margin-bottom:4px;">${esc(heading)}</div>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${camps.map(campRow).join('')}</table>
   </td></tr>`;
}

/**
 * @param {object}   opts
 * @param {string}   opts.firstName      may be empty
 * @param {Array}    opts.newCamps       camps added in the last week
 * @param {Array}    opts.upcomingCamps  camps happening soon
 * @param {string}   opts.unsubscribeUrl must carry &type=newsletter
 * @param {Date}     [opts.now]
 */
export function newsletterEmail({ firstName, newCamps = [], upcomingCamps = [], unsubscribeUrl, now = new Date() }) {
  const tip = tipForWeek(now);

  // The subject leads with the tip rather than "RecruitGrid Weekly". A brand
  // name in the subject line is what people learn to skip; a specific, useful
  // sentence is what gets opened.
  const subject = tip.title;

  const preheader = newCamps.length
    ? `${newCamps.length} new camp${newCamps.length === 1 ? '' : 's'} added this week`
    : 'This week\'s recruiting tip';

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#EDEEF0;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEEF0;padding:28px 12px;">
 <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

   <!-- header -->
   <tr><td style="background:${INK};padding:26px 32px;" align="center">
     <img src="${SITE}/icon-192.png" width="46" height="46" alt="RecruitGrid"
          style="display:block;border:0;border-radius:9px;margin:0 auto 10px;">
     <div style="font:700 19px/1 ${FONT};color:${PAPER};letter-spacing:.2px;">Recruit<span style="color:${GOLD};">Grid</span></div>
   </td></tr>

   <!-- tip -->
   <tr><td style="padding:30px 32px 10px;">
     <div style="font:700 12px/1 ${FONT};letter-spacing:1.2px;text-transform:uppercase;color:${MUTED};margin-bottom:10px;">This week</div>
     <h1 style="margin:0 0 10px;font:700 21px/1.3 ${FONT};color:${INK};">${esc(tip.title)}</h1>
     <p style="margin:0 0 22px;font:400 15px/1.65 ${FONT};color:${BODY};">${esc(tip.body)}</p>
   </td></tr>

   ${section('Just added', newCamps)}
   ${section('Coming up', upcomingCamps)}

   <!-- cta -->
   <tr><td style="padding:26px 32px 28px;" align="center">
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
       <tr><td style="background:${GOLD};border-radius:8px;">
         <a href="${SITE}/app"
            style="display:inline-block;padding:13px 30px;font:700 15px/1 ${FONT};color:${INK};text-decoration:none;">
           Open RecruitGrid
         </a>
       </td></tr>
     </table>
   </td></tr>

   <!-- footer -->
   <tr><td style="background:#F7F8F9;padding:20px 32px;border-top:1px solid #E4E6E9;" align="center">
     <p style="margin:0 0 10px;font:400 12px/1.6 ${FONT};color:${MUTED};">
       You're getting this because you turned on the weekly email in
       <a href="${SITE}/app" style="color:${MUTED};">RecruitGrid</a>.
       <a href="${esc(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>
     </p>
     <p style="margin:0;font:400 11px/1.6 ${FONT};color:${MUTED};">
       ${POSTAL_ADDRESS.map(esc).join('<br>')}
     </p>
   </td></tr>

  </table>
 </td></tr>
</table>
</body></html>`;

  return { subject, html };
}
