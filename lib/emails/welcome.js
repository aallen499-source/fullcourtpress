// Welcome email, sent once when someone verifies their email for the first time.
//
// Same construction rules as camp-reminder.js: tables and inline styles,
// because Outlook renders through Word and drops <style> blocks, flexbox and
// grid. Absolute image URLs, and every element degrades when images are blocked.
//
// Transactional, like subscription-confirmation.js: one message, triggered by
// the recipient's own sign-up, about their own account. No List-Unsubscribe and
// no postal address. Adding anything promotional would change that — the
// weekly newsletter in newsletter.js is the place for that, and it carries the
// address CAN-SPAM requires.
//
// NOT sent at sign-up — sent at first successful verification. Signing up here
// *is* a magic-link email, so a welcome fired at the same moment would be the
// second message in two minutes and the less useful of the two.
//
// Deliberately one action. Nineteen accounts in, seventeen had added zero
// coaches, so the failure mode is not "didn't know feature X existed" — it is
// arriving at an empty dashboard with no obvious first move. Publishing the
// profile is that move: it is one screen, it is free, it produces a link they
// can actually send someone, and app/app/page.jsx already blocks emailing a
// coach until it's done ("Publish your profile first — My Info → Publish").
// Everything else is left out on purpose. Resist adding a feature tour here.

const INK = '#17181A';
const GOLD = '#E8B23B';
const PAPER = '#FAFAF8';
const BODY = '#2A2C30';
const MUTED = '#6B6E75';
const SITE = 'https://recruitgrid.app';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";

// No name in the greeting: this fires at first verification, before anyone has
// opened My Info, so profiles.name is reliably empty. "Hi ," reads worse than
// no greeting at all.
export function welcomeEmail({ loginEmail } = {}) {
  const subject = 'Welcome to RecruitGrid — start here';

  const freeRows = [
    'Unlimited YouTube and Hudl film links',
    'Up to 10 coaches on your roster',
    'All 10 email templates',
    'Your shareable profile link',
  ]
    .map(
      (item) => `
      <tr><td style="padding:5px 0;font:400 15px/1.5 ${FONT};color:${BODY};">
        <span style="color:${GOLD};font-weight:700;">&#10003;</span>&nbsp;&nbsp;${item}
      </td></tr>`
    )
    .join('');

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#EDEEF0;">
<!-- preheader: shown next to the subject in most inboxes, hidden in the body -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Publish your profile and you'll have a link you can send to any coach.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEEF0;padding:28px 12px;">
 <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

   <!-- header -->
   <tr><td style="background:${INK};padding:26px 32px;" align="center">
     <img src="${SITE}/icon-192.png" width="46" height="46" alt="RecruitGrid"
          style="display:block;border:0;border-radius:9px;margin:0 auto 10px;">
     <div style="font:700 19px/1 ${FONT};color:${PAPER};letter-spacing:.2px;">Recruit<span style="color:${GOLD};">Grid</span></div>
   </td></tr>

   <tr><td style="background:${GOLD};padding:11px 32px;" align="center">
     <div style="font:700 12px/1 ${FONT};letter-spacing:1.4px;text-transform:uppercase;color:${INK};">Your account is ready</div>
   </td></tr>

   <!-- body: one action, stated plainly -->
   <tr><td style="padding:30px 32px 0;">
     <p style="margin:0 0 18px;font:400 15px/1.6 ${FONT};color:${BODY};">
       Welcome — you're signed in and your account is set up. It's free, and it
       doesn't expire, so there's no clock running on any of this.
     </p>

     <h1 style="margin:0 0 8px;font:700 20px/1.3 ${FONT};color:${INK};">Start by publishing your profile</h1>
     <p style="margin:0 0 8px;font:400 15px/1.6 ${FONT};color:${BODY};">
       Go to <strong style="color:${INK};">My Info</strong>, fill in the basics —
       position, grad year, height, GPA — and hit <strong style="color:${INK};">Publish</strong>.
     </p>
     <p style="margin:0 0 22px;font:400 15px/1.6 ${FONT};color:${BODY};">
       That gives you a link like <span style="color:${MUTED};">recruitgrid.app/your-name</span>
       that you can send to any coach. It's the link that goes in every message
       you send from here, so it's worth five minutes before anything else.
     </p>
   </td></tr>

   <!-- cta -->
   <tr><td style="padding:0 32px 26px;" align="center">
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
       <tr><td style="background:${GOLD};border-radius:8px;">
         <a href="${SITE}/app"
            style="display:inline-block;padding:13px 30px;font:700 15px/1 ${FONT};color:${INK};text-decoration:none;">
           Fill in My Info
         </a>
       </td></tr>
     </table>
   </td></tr>

   <!-- what free covers: answers the "when does this start costing me" worry
        without turning into a pitch -->
   <tr><td style="padding:0 32px 26px;">
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E4E6E9;">
       <tr><td style="padding:20px 0 0;">
         <div style="font:600 12px/1.4 ${FONT};letter-spacing:.6px;text-transform:uppercase;color:${MUTED};margin-bottom:10px;">Included free, with no time limit</div>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${freeRows}</table>
       </td></tr>
     </table>
   </td></tr>

   <!-- footer -->
   <tr><td style="background:#F7F8F9;padding:20px 32px;border-top:1px solid #E4E6E9;" align="center">
     <p style="margin:0 0 8px;font:400 13px/1.6 ${FONT};color:${BODY};">
       Stuck, or not sure what to put somewhere? Just reply to this email — it
       comes straight to me, and I read all of them.
     </p>
     <p style="margin:0 0 8px;font:400 12px/1.6 ${FONT};color:${MUTED};">
       You're signed in as ${loginEmail || ''}
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
