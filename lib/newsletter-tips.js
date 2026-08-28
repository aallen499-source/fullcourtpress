// The rotating tip library for the weekly newsletter.
//
// One tip per week, chosen by week number so the rotation is deterministic —
// the same week always produces the same tip, which means a re-run of a failed
// send doesn't hand someone a different email than their teammate got.
//
// Deliberately about CRAFT, not rules. NCAA contact rules differ by division
// and sport and change most years; a newsletter that states them confidently
// will eventually be wrong, and being wrong about eligibility is the kind of
// error a family acts on. Everything here is process advice that stays true:
// how to write, what to send, when to follow up, what to ask. Where a rule is
// unavoidable, it points at the school or the NCAA rather than paraphrasing.

export const TIPS = [
  {
    title: 'Put the film link in the first two lines',
    body:
      'A college coach opens your email between meetings on a phone. If the film is buried under a paragraph about how much your athlete admires the program, it does not get watched. Lead with name, grad year, position, and the link. The admiration can go underneath — it is read second or not at all.',
  },
  {
    title: 'Three minutes of film beats thirty',
    body:
      'Your highlight reel is a trailer, not the movie. Put your five or six best plays first, because that is how far most coaches watch. If a coach wants more, they will ask for full game film — and the fact that they asked tells you more than any reply.',
  },
  {
    title: 'Send the email from the athlete, not the parent',
    body:
      'Coaches notice. A note written in the athlete\'s own voice, with their own account, signals someone who will manage their own life on campus. Parents can absolutely draft it together — just send it from the player.',
  },
  {
    title: 'Name something specific about the program',
    body:
      'One concrete sentence — a game you watched, a player whose role you would want, the major you are actually after — separates you from a hundred identical form letters. It has to be true and it has to be specific. "Great program" reads as mass mail because it is.',
  },
  {
    title: 'The questionnaire is the front door',
    body:
      'Most programs will not open a recruiting file until their own questionnaire is in. It is unglamorous and it takes ten minutes. Do it before the email, not after — then your name is already in their system when they go looking.',
  },
  {
    title: 'Follow up once, after two weeks',
    body:
      'No reply is not a no. Coaches triage recruiting mail around their season, and a note that arrives during a road trip is simply gone. One short follow-up two weeks later, with any new film or a recent result, is normal and expected. A third is not.',
  },
  {
    title: 'Update your list to reflect who answers',
    body:
      'The schools that reply are your real list. It is easy to spend a whole season on five dream programs that never wrote back while ignoring the coach who answered in a day. Rank by who is engaging, not by who you wish would.',
  },
  {
    title: 'Widen the list past the names you know',
    body:
      'There are well over a thousand four-year programs across NCAA, NAIA and junior college. Most families can name fifteen. The best fit — playing time, money, a coach who wants you — is usually at a school you had not heard of a year ago.',
  },
  {
    title: 'Ask the money question early',
    body:
      'Ask what a realistic aid package looks like for someone in your position, and ask it before an official visit rather than after. It is a normal question, coaches answer it every week, and the answer decides whether the rest of the conversation is worth having.',
  },
  {
    title: 'Camps are a tryout, so pick them accordingly',
    body:
      'A camp at a school with no interest in your athlete is an expensive weekend. A camp where the coach already knows your name — because you emailed, because your film is in — is an audition. Do the outreach first, then register.',
  },
  {
    title: 'Keep grades in the conversation',
    body:
      'Coaches at every level ask about GPA and test scores early, because academic money is real money and admissions can end a recruitment that athletics started. Put the numbers in your emails once they are good enough to help you.',
  },
  {
    title: 'Get the club or high school coach to make one call',
    body:
      'A thirty-second call from a coach who has seen your athlete play carries more weight than ten emails from the family. Ask for it specifically — name the school, name the coach — rather than asking them to "help with recruiting".',
  },
  {
    title: 'Answer within a day',
    body:
      'When a coach finally writes back, speed is signal. A same-day reply says you are organized and genuinely interested. Set up your phone so recruiting mail is not sitting unread in a promotions folder for a week.',
  },
  {
    title: 'Write down what each coach said',
    body:
      'By January you will not remember which assistant said they would come watch, or which school asked for full game film. Log it the day it happens. The families who end up with options are almost always the ones who kept notes.',
  },
  {
    title: 'Film beats stats, but stats beat adjectives',
    body:
      'Nobody is recruited off a stat line alone, and nobody is recruited off "explosive athlete" at all. Film first, a couple of verifiable numbers second, and let the coach reach their own conclusion about the adjectives.',
  },
  {
    title: 'Check eligibility requirements at the source',
    body:
      'Division rules, registration steps and academic requirements differ by division and change from year to year. Confirm what applies to your athlete on the NCAA, NAIA or NJCAA site directly, and ask the compliance office at any school you get serious about. Do not take a rule from a message board, or from us.',
  },
  {
    title: 'One email per program, to the right coach',
    body:
      'Find the assistant who recruits your position or your region — it is usually on the staff page. A note to the head coach at a big program is competing with hundreds. A note to the right assistant is competing with far fewer, and they are the one who will bring your name up.',
  },
  {
    title: 'Make your film easy to open',
    body:
      'No downloads, no logins, no expiring links. A coach with fifteen seconds and a locked file simply moves on. Test your own link in a private browser window before you send it to anyone.',
  },
  {
    title: 'Interest cools quietly, so re-warm it deliberately',
    body:
      'A coach who was keen in June may not have thought about your athlete since. A short note with a new clip, a new result, or an updated GPA gives them a reason to open the file again. That is not pestering; that is the job.',
  },
  {
    title: 'Recruit the school, not just the team',
    body:
      'Ask what happens if the injury comes, or the coach leaves, or the sport ends after two years. If the school is somewhere your athlete would still want to be, the decision is safe. If it is not, no amount of playing time makes it safe.',
  },
];

/**
 * Deterministic tip for a given date — same week always yields the same tip,
 * so a retried send can't deliver a different email than the first attempt.
 * Cycles through the whole library before repeating.
 */
export function tipForWeek(date = new Date()) {
  // Weeks since the Unix epoch. Crude on purpose: it only has to be stable and
  // to advance by exactly one each week.
  const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
  return TIPS[week % TIPS.length];
}
