// The single reminder for someone who asked for a sign-in link and never
// clicked it (app/api/cron/signup-reminder).
//
// Written to be read by somebody who has forgotten doing this. They typed an
// address into a box a day ago, got nothing useful out of it, and have no
// particular reason to trust the next email either. So it says what it is in
// the first line, carries one link, and says plainly that it is the only one.
//
// The link is a real, freshly generated sign-in link rather than a trip back
// to the sign-in form. Someone who did not engage the first time will not do
// two steps now, and the first step is the one that already failed them.

import { esc, shell, header, button } from './parent-weekly';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
const BODY = '#2A2C30';
const MUTED = '#6B6E75';

const para = (text) => `<p style="margin:0 0 12px;font:400 15px/1.6 ${FONT};color:${BODY};">${text}</p>`;

/**
 * @param {object} o
 * @param {string} o.signInUrl  a fresh, single-use sign-in link
 * @param {string} o.stopUrl    one-click "don't email me again"
 */
export function signupReminderEmail({ signInUrl, stopUrl }) {
  const subject = 'Your RecruitGrid sign-in link (the first one expired)';
  const body = [
    header('Here’s a fresh sign-in link', 'The first one expired after an hour'),
    `<tr><td style="padding:24px 32px 2px;">
      ${para('Hi there,')}
      ${para('You asked for a RecruitGrid sign-in link yesterday and it looks like you never got to use it. Those links expire after an hour, so here’s a new one.')}
      ${para('No password to remember. The button signs you straight in.')}
    </td></tr>`,
    button(signInUrl, 'Sign in to RecruitGrid →'),
    `<tr><td style="padding:14px 32px 10px;">
      <p style="margin:0 0 10px;font:400 13px/1.6 ${FONT};color:${MUTED};">
        If the first email never turned up, it may be sitting in spam. Marking it
        “not spam” will keep the next one out of there.
      </p>
      <p style="margin:0;font:400 13px/1.6 ${FONT};color:${MUTED};">
        This is the only reminder I’ll send. If you’ve changed your mind, just ignore it
        and you won’t hear from me again.<br>Angela
      </p>
    </td></tr>`,
  ].join('');

  // No "you are getting this because you are a subscriber" line, because they
  // are not one and saying so would be false. They asked for a sign-in link
  // and this is that link — which is also why the stop link says what it does
  // rather than "unsubscribe": there is no list to leave.
  const footer =
    `You asked for a sign-in link at recruitgrid.app yesterday. If that wasn’t you, ignore this email, ` +
    `nobody can get into an account without clicking the link above. ` +
    `<a href="${esc(stopUrl)}" style="color:${MUTED};text-decoration:underline;">Don’t email me again</a>`;

  return {
    subject,
    html: shell({
      title: subject,
      preheader: 'Your first link expired after an hour. Here’s a new one.',
      body,
      footer,
    }),
  };
}
