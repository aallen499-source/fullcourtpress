// Camp reminder email.
//
// Written as tables with inline styles on purpose. Outlook renders through
// Word, which ignores flexbox, grid, and most <style> blocks — a layout that
// looks right in a browser can collapse entirely there. Tables and inline
// attributes are the boring thing that works everywhere.
//
// Images are absolute URLs because there is no page context in an inbox, and
// every meaningful element degrades if images are blocked: the header still
// reads as text, and the CTA is a styled link rather than an image.

const INK = '#17181A';
const GOLD = '#E8B23B';
const PAPER = '#FAFAF8';
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const SITE = 'https://recruitgrid.app';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC', // camp dates are plain dates; local parsing shifts them a day
  });
}

export function campReminderEmail({ firstName, camp, daysAway, unsubscribeUrl }) {
  const when = formatDate(camp.date);
  const countdown =
    daysAway === 0 ? 'is today' : daysAway === 1 ? 'is tomorrow' : `is in ${daysAway} days`;

  const where = [camp.city, camp.state].filter(Boolean).join(', ');
  const rows = [
    ['When', when],
    ['Where', where || null],
    ['Division', camp.division || null],
    ['Cost', camp.cost != null ? `$${camp.cost}` : null],
  ].filter(([, v]) => v);

  const detailRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:7px 0;font:600 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;letter-spacing:.6px;text-transform:uppercase;color:${MUTED};width:92px;vertical-align:top;">${label}</td>
          <td style="padding:7px 0;font:400 15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${BODY};">${value}</td>
        </tr>`
    )
    .join('');

  const subject = `${camp.camp_name} ${countdown} — ${camp.school}`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#EDEEF0;">
<!-- preheader: shown next to the subject in most inboxes, hidden in the body -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${camp.school} · ${when}${where ? ' · ' + where : ''}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEEF0;padding:28px 12px;">
 <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

   <!-- header -->
   <tr><td style="background:${INK};padding:26px 32px;" align="center">
     <img src="${SITE}/icon-192.png" width="46" height="46" alt="RecruitGrid"
          style="display:block;border:0;border-radius:9px;margin:0 auto 10px;">
     <div style="font:700 19px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${PAPER};letter-spacing:.2px;">Recruit<span style="color:${GOLD};">Grid</span></div>
   </td></tr>

   <!-- countdown strip -->
   <tr><td style="background:${GOLD};padding:11px 32px;" align="center">
     <div style="font:700 12px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:${INK};">Your camp ${countdown}</div>
   </td></tr>

   <!-- body -->
   <tr><td style="padding:30px 32px 8px;">
     <p style="margin:0 0 18px;font:400 15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${BODY};">
       Hi${firstName ? ' ' + firstName : ''} — a reminder about a camp you're registered for.
     </p>
     <h1 style="margin:0 0 3px;font:700 21px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${INK};">${camp.camp_name}</h1>
     <div style="font:400 15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${MUTED};margin-bottom:18px;">${camp.school}</div>

     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="border-top:1px solid #E4E6E9;border-bottom:1px solid #E4E6E9;padding:4px 0;margin-bottom:22px;">
       ${detailRows}
     </table>
   </td></tr>

   <!-- cta -->
   <tr><td style="padding:0 32px 26px;" align="center">
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
       <tr><td style="background:${GOLD};border-radius:8px;">
         <a href="${camp.source_url || SITE + '/app'}"
            style="display:inline-block;padding:13px 30px;font:700 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${INK};text-decoration:none;">
           ${camp.source_url ? 'Camp details &amp; registration' : 'Open RecruitGrid'}
         </a>
       </td></tr>
     </table>
     <p style="margin:16px 0 0;font:400 13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${MUTED};">
       Double-check the time and what to bring on the school's own page — details change after we verify them.
     </p>
   </td></tr>

   <!-- footer -->
   <tr><td style="background:#F7F8F9;padding:20px 32px;border-top:1px solid #E4E6E9;" align="center">
     <p style="margin:0 0 8px;font:400 12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${MUTED};">
       You're getting this because you marked this camp as registered in
       <a href="${SITE}/app" style="color:${MUTED};">RecruitGrid</a>.
     </p>
     <p style="margin:0;font:400 12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${MUTED};">
       <a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Turn off camp reminders</a>
     </p>
   </td></tr>

  </table>
 </td></tr>
</table>
</body></html>`;

  return { subject, html };
}
