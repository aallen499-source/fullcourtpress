// Owner outreach drafts.
//
// These are personal, one-to-one notes Angela sends to a named person about
// their own account. They are deliberately NOT the house email template:
// no logo, no HTML, no unsubscribe footer. A marketing-looking email asking
// "did something go wrong?" reads as a campaign and gets ignored, which is
// the exact opposite of the point.
//
// Sent as plain text for the same reason. Resend will deliver a `text` body
// as-is, so what she reads on the page is character-for-character what the
// family receives.
//
// NO EM DASHES anywhere in this file's copy. Her rule, and it also happens to
// be what stops these reading as machine-written.

export const FREE_COACH_LIMIT = 10;
const SITE = 'https://recruitgrid.app';

/** First name only, falling back to something that still reads like a person. */
export function firstNameOf(name) {
  const first = String(name || '').trim().split(/\s+/)[0] || '';
  return first || 'there';
}

/** "September", for referring back to when somebody bought. */
export function monthOf(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
}

export const PLAN_LABELS = {
  annual: 'the Athlete plan',
  season: 'a Season Pass',
  team: 'a Team/Club Pass',
};

/**
 * Someone on the free plan who has built a real roster.
 *
 * Two versions on purpose. At the cap they have already been stopped, so the
 * note has to explain what happened. Below the cap they have not, and telling
 * them early turns a toll booth into a heads-up. The second version is the
 * nicer email, which is why anyone at 8 or 9 gets it rather than waiting.
 */
export function wallDraft({ firstName, coaches, limit = FREE_COACH_LIMIT }) {
  const name = firstNameOf(firstName);
  const atCap = coaches >= limit;
  const left = Math.max(0, limit - coaches);

  const subject = atCap
    ? `You've got ${limit} coaches in RecruitGrid`
    : `Nice work on your roster`;

  const opening = atCap
    ? `You signed up a few days ago and you already have ${coaches} coaches on your roster, with your profile published. Most families never get past three. I know how much work it takes to sit down and find ${coaches} real coaches, so I wanted to say well done properly.`
    : `You signed up recently and you already have ${coaches} coaches on your roster, with your profile published. Most families never get past three, so I wanted to say well done properly.`;

  const capLine = atCap
    ? `One thing worth knowing: the free plan stops at ${limit}, so the next coach you try to add won't save. That isn't a bug, it's just where the free tier ends. The Athlete plan is $79 for the year, it lifts the cap and it opens the full camp list: ${SITE}/pricing`
    : `Worth a heads-up before you run into it: the free plan stops at ${limit}, so you have ${left} ${left === 1 ? 'slot' : 'slots'} left. The Athlete plan is $79 for the year and lifts the cap: ${SITE}/pricing. No rush at all, I'd just rather you heard it from me than from an error message.`;

  const body = `Hi ${name},

I'm Angela, and I'm the one who built RecruitGrid. It's still small enough that I can see who is really using it, and your account stood out to me this week.

${opening}

${capLine}

That isn't really why I'm writing, though. You're at the point where the next move is sending those first emails, and that's where almost everyone slows down. If you reply with the schools you're aiming at, I'll go through your list and tell you honestly whether it looks right, too high or too low. No charge and nothing attached. I would just really love to see a family get all the way through this.

Thank you for giving it a go. It means a lot.

Angela
RecruitGrid`;

  return { subject, body };
}

/**
 * Someone who paid and then never started.
 *
 * The subject names the problem out loud. A cheerful "getting started tips!"
 * subject to somebody who paid two months ago and did nothing is the email
 * they already ignored once.
 */
export function stalledDraft({ firstName, plan, boughtOn, includeRefund = true }) {
  const name = firstNameOf(firstName);
  const label = PLAN_LABELS[plan] || 'a plan';
  const month = monthOf(boughtOn);
  const when = month ? ` back in ${month}` : '';

  const refund = includeRefund
    ? `

And if it turns out this just isn't what you needed, say the word and I'll refund you. I would genuinely rather do that than keep money from someone who hasn't got anything out of it.`
    : '';

  const body = `Hi ${name},

Angela here, the person who built RecruitGrid.

You bought ${label}${when}, and when I look at your account there aren't any coaches on it yet. I'd much rather ask than guess: did something go wrong, or was it just never obvious what to do first?

If it wasn't clear, that part is mine to fix and not yours.

If you can spare twenty minutes I'm happy to set the whole thing up with you: the coach list, your profile and a first email ready to send. Or just reply with the schools you're interested in and I'll put them in for you myself.${refund}

Either way, I'd really like to hear what happened.

Angela
RecruitGrid`;

  return { subject: `Did RecruitGrid not work for you?`, body };
}
