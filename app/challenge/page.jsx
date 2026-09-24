import Link from 'next/link';
import { CHALLENGE_DAYS } from '@/lib/emails/challenge';

// The public page for the 7-day challenge.
//
// This is the marketing plan's "lead magnet", except nobody downloads a PDF
// and nothing is gated behind an email capture form: creating the free account
// IS the sign-up, and the week arrives by email starting the next morning.
// A checklist PDF would have been a second thing to build, a second list to
// maintain, and a worse first experience than the product itself.
//
// The day list is imported from the email module rather than retyped, so the
// page can never drift from what actually gets sent.

export const metadata = {
  title: 'The 7-Day College Recruiting Challenge — RecruitGrid',
  description:
    'One task a day for a week: publish a profile, build a school list, find the coaches, send the first email. Free, and by the end your athlete has contacted a real college coach.',
  alternates: { canonical: 'https://recruitgrid.app/challenge' },
  openGraph: {
    title: 'The 7-Day College Recruiting Challenge — RecruitGrid',
    url: 'https://recruitgrid.app/challenge',
  },
};

const WHY = [
  ['It is one thing a day', 'Ten minutes at most, in an order that makes sense. No one has to work out what comes first.'],
  ['It uses your own schools', 'Every task happens against the schools your athlete actually cares about, not a demo.'],
  ['It ends with an email sent', 'Not a plan to email someone. An email, to a real coach, from your athlete’s own address.'],
];

export default function ChallengePage() {
  return (
    <main className="app-shell guide-shell">
      <p className="guide-kicker">Free · starts the morning after you sign up</p>
      <h1 className="guide-h1">The 7-day recruiting challenge</h1>
      <p className="guide-lead">
        Most families know roughly what recruiting involves and still never start, because there is no obvious
        first move. This is seven of them, one a day. By the end of the week your athlete will have written to a
        college coach — and will have the profile, the school list and the follow-up dates that make the next one
        easier.
      </p>

      <div className="challenge-days">
        {CHALLENGE_DAYS.map((d) => (
          <div key={d.n} className="challenge-day">
            <span className="challenge-day-n">Day {d.n}</span>
            <span className="challenge-day-task">{d.task}</span>
            <span className="challenge-day-mins">{d.mins}</span>
          </div>
        ))}
      </div>

      <div className="guide-cta">
        <div>
          <div className="guide-cta-title">Start the week</div>
          <p>
            Create a free account and day 1 arrives tomorrow morning. No card, and if a task is already done
            that day’s email says so and asks for ten seconds instead.
          </p>
        </div>
        <Link className="btn gold" href="/app">Start free →</Link>
      </div>

      <section style={{ marginTop: 30 }}>
        <h2 className="guide-h2">Why a week works better than a website</h2>
        {WHY.map(([title, text]) => (
          <p key={title} style={{ lineHeight: 1.6, marginBottom: 12 }}>
            <b>{title}.</b> {text}
          </p>
        ))}
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 className="guide-h2">Read first, if you’d rather</h2>
        <p style={{ lineHeight: 1.6 }}>
          The <Link href="/resources">free guides</Link> cover the same ground at your own pace — how to email a
          college coach, what questionnaires are for, and{' '}
          <Link href="/resources/how-college-recruiting-works">how recruiting works from the coach’s side</Link>.
        </p>
      </section>
    </main>
  );
}
