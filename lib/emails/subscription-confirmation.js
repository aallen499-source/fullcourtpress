// Post-payment confirmation email.
//
// Same construction rules as camp-reminder.js: tables and inline styles,
// because Outlook renders through Word and drops <style> blocks, flexbox and
// grid. Absolute image URLs, and every element degrades to something readable
// when images are blocked.
//
// This is transactional — it is the receipt for a purchase the recipient just
// made, sent once, and there is nothing to unsubscribe from. That is why there
// is no List-Unsubscribe header and no postal address in the footer, unlike
// newsletter.js. Do not add promotional content here without revisiting that.
//
// Why this email exists: a parent paid, got no confirmation from the product,
// and emailed support 39 minutes later asking whether her account had been
// activated. Everything above the fold is aimed at that question — the plan
// she bought, the account it landed on, and an explicit statement that no
// further action is required. The "first step" block is secondary.

const INK = '#17181A';
const GOLD = '#E8B23B';
const PAPER = '#FAFAF8';
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const SITE = 'https://recruitgrid.app';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  );
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// The webhook passes through whatever Stripe has as the product name, which is
// editable in the Stripe dashboard and has already drifted once. Match loosely
// on substrings rather than an exact table, and fall back to the athlete shape
// — the paid tier everyone else is on — rather than rendering a blank email.
function planShape(planName) {
  const lower = (planName || '').toLowerCase();

  if (lower.includes('team') || lower.includes('club')) {
    return {
      kind: 'team',
      // Team/Club is a one-time charge for a 4-month window, so "renews" would
      // be wrong twice over — nothing recurs and there is nothing to cancel.
      periodLabel: 'Your team access runs through',
      periodTail: 'Nothing auto-renews, and there is nothing to cancel.',
      stepTitle: 'Add your athletes',
      stepBody:
        'Your roster holds up to 12 athletes. Add them from the Team tab and each one gets their own profile, film and coach list under your account.',
      ctaLabel: 'Set up your roster',
      ctaHref: `${SITE}/app`,
      unlocked: [
        'Every verified camp — boys and girls',
        'Up to 12 athletes on one roster',
        'A coach/director overview of all of them',
        'Unlimited coaches and video uploads per athlete',
      ],
    };
  }

  if (lower.includes('season')) {
    return {
      kind: 'season',
      periodLabel: 'Your Season Pass runs through',
      periodTail: 'It expires on its own — there is nothing to cancel.',
      stepTitle: 'Start with the camp list',
      stepBody:
        'Every verified camp is open to you now. Filter by state and division, and mark the ones you are interested in so they show up on your dashboard.',
      ctaLabel: 'Browse every camp',
      ctaHref: `${SITE}/app`,
      unlocked: [
        'Every verified camp — boys and girls',
        'Unlimited coaches on your roster',
        'Unlimited video uploads',
        'Shareable single-clip links',
      ],
    };
  }

  return {
    kind: 'athlete',
    periodLabel: 'Your plan renews on',
    periodTail: 'You can cancel anytime from the Plans tab — no email required.',
    stepTitle: 'Start with the camp list',
    stepBody:
      'Every verified camp is open to you now. Filter by state and division, and mark the ones you are interested in so they show up on your dashboard.',
    ctaLabel: 'Browse every camp',
    ctaHref: `${SITE}/app`,
    unlocked: [
      'Every verified camp — boys and girls',
      'Unlimited coaches on your roster',
      'Unlimited video uploads',
      'Shareable single-clip links',
      'Spreadsheet import',
    ],
  };
}

export function subscriptionConfirmationEmail({
  firstName,
  planName,
  currentPeriodEnd,
  loginEmail,
}) {
  const shape = planShape(planName);
  const label = planName || 'your plan';
  const until = formatDate(currentPeriodEnd);

  const subject = `You're all set — ${label} is active`;

  const unlockedRows = shape.unlocked
    .map(
      (item) => `
      <tr><td style="padding:5px 0;font:400 15px/1.5 ${FONT};color:${BODY};">
        <span style="color:${GOLD};font-weight:700;">&#10003;</span>&nbsp;&nbsp;${esc(item)}
      </td></tr>`
    )
    .join('');

  // Only rendered when Stripe gave us a date. A one-time charge whose product
  // name doesn't match the season/team patterns lands here with null, and an
  // empty row reads better than "runs through Invalid Date".
  const periodBlock = until
    ? `
     <p style="margin:0 0 4px;font:400 15px/1.6 ${FONT};color:${BODY};">
       ${esc(shape.periodLabel)} <strong style="color:${INK};">${esc(until)}</strong>.
     </p>
     <p style="margin:0;font:400 13px/1.6 ${FONT};color:${MUTED};">${esc(shape.periodTail)}</p>`
    : '';

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#EDEEF0;">
<!-- preheader: shown next to the subject in most inboxes, hidden in the body -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your payment went through and your account is active. Nothing else is needed from you.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEEF0;padding:28px 12px;">
 <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

   <!-- header -->
   <tr><td style="background:${INK};padding:26px 32px;" align="center">
     <img src="${SITE}/icon-192.png" width="46" height="46" alt="RecruitGrid"
          style="display:block;border:0;border-radius:9px;margin:0 auto 10px;">
     <div style="font:700 19px/1 ${FONT};color:${PAPER};letter-spacing:.2px;">Recruit<span style="color:${GOLD};">Grid</span></div>
   </td></tr>

   <!-- confirmation strip -->
   <tr><td style="background:${GOLD};padding:11px 32px;" align="center">
     <div style="font:700 12px/1 ${FONT};letter-spacing:1.4px;text-transform:uppercase;color:${INK};">Your account is active</div>
   </td></tr>

   <!-- body -->
   <tr><td style="padding:30px 32px 8px;">
     <p style="margin:0 0 18px;font:400 15px/1.6 ${FONT};color:${BODY};">
       Hi${firstName ? ' ' + esc(firstName) : ''} — thank you. Your payment went through and
       <strong style="color:${INK};">${esc(label)}</strong> is active on your account right now.
       There is nothing else you need to do, and nothing you need to send us.
     </p>

     <!-- account the plan landed on: the fastest way for someone to spot that
          they checked out with a different address than they signed up with -->
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="background:#F7F8F9;border:1px solid #E4E6E9;border-radius:10px;margin-bottom:22px;">
       <tr><td style="padding:16px 18px;">
         <div style="font:600 12px/1.4 ${FONT};letter-spacing:.6px;text-transform:uppercase;color:${MUTED};margin-bottom:6px;">Signed in as</div>
         <div style="font:600 15px/1.5 ${FONT};color:${INK};word-break:break-all;">${esc(loginEmail || '')}</div>
       </td></tr>
     </table>

     ${periodBlock}
   </td></tr>

   <!-- first step -->
   <tr><td style="padding:22px 32px 0;">
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="border-top:1px solid #E4E6E9;">
       <tr><td style="padding:22px 0 0;">
         <h2 style="margin:0 0 6px;font:700 17px/1.3 ${FONT};color:${INK};">${esc(shape.stepTitle)}</h2>
         <p style="margin:0 0 18px;font:400 15px/1.6 ${FONT};color:${BODY};">${esc(shape.stepBody)}</p>
       </td></tr>
     </table>
   </td></tr>

   <!-- cta -->
   <tr><td style="padding:0 32px 24px;" align="center">
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
       <tr><td style="background:${GOLD};border-radius:8px;">
         <a href="${shape.ctaHref}"
            style="display:inline-block;padding:13px 30px;font:700 15px/1 ${FONT};color:${INK};text-decoration:none;">
           ${esc(shape.ctaLabel)}
         </a>
       </td></tr>
     </table>
   </td></tr>

   <!-- what unlocked -->
   <tr><td style="padding:0 32px 26px;">
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="border-top:1px solid #E4E6E9;">
       <tr><td style="padding:20px 0 0;">
         <div style="font:600 12px/1.4 ${FONT};letter-spacing:.6px;text-transform:uppercase;color:${MUTED};margin-bottom:10px;">What just unlocked</div>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${unlockedRows}</table>
       </td></tr>
     </table>
   </td></tr>

   <!-- footer -->
   <tr><td style="background:#F7F8F9;padding:20px 32px;border-top:1px solid #E4E6E9;" align="center">
     <p style="margin:0 0 8px;font:400 13px/1.6 ${FONT};color:${BODY};">
       Stuck on anything, or does the address above look wrong?
       Just reply to this email — it comes straight to me.
     </p>
     <p style="margin:0;font:400 12px/1.6 ${FONT};color:${MUTED};">
       Angela &middot; RecruitGrid &middot; <a href="${SITE}" style="color:${MUTED};">recruitgrid.app</a>
     </p>
   </td></tr>

  </table>
 </td></tr>
</table>
</body></html>`;

  return { subject, html };
}
