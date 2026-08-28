'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

// Two mailing streams share this page. The copy has to name the right one —
// telling someone "camp reminders are off" when they unsubscribed from the
// newsletter would leave them believing they'd stopped mail they'll keep
// getting, and they'd mark the next reminder as spam rather than trusting it.
const COPY = {
  reminders: {
    ask: 'Turn off camp reminders?',
    askBody:
      "You'll stop getting emails about camps you've marked as registered. This doesn't affect billing or sign-in emails, and your account stays exactly as it is.",
    button: 'Turn off camp reminders',
    working: 'Turning off…',
    off: 'Camp reminders are off',
    offBody: "You won't get any more reminder emails about camps you've registered for.",
    on: 'Camp reminders are back on',
    onBody: "We'll email you a week before a camp you're registered for.",
  },
  newsletter: {
    ask: 'Unsubscribe from the weekly email?',
    askBody:
      "You'll stop getting the weekly recruiting tip and new camp roundup. Reminders about camps you've registered for will keep coming — those are separate, and this doesn't touch them.",
    button: 'Unsubscribe',
    working: 'Unsubscribing…',
    off: "You're unsubscribed",
    offBody:
      "No more weekly emails. You'll still get reminders about camps you've marked as registered.",
    on: "You're subscribed again",
    onBody: "The weekly tip and new camp roundup will land on Tuesdays.",
  },
};

// A button rather than an automatic opt-out on page load. Mail scanners fetch
// every link in a message, so "unsubscribe on arrival" silently unsubscribes
// people whose employer runs link-checking. One deliberate click is the cost.
function UnsubscribeInner() {
  const params = useSearchParams();
  const token = params.get('t');
  const type = params.get('type') === 'newsletter' ? 'newsletter' : 'reminders';
  const copy = COPY[type];
  const q = `t=${token}${type === 'newsletter' ? '&type=newsletter' : ''}`;
  const [state, setState] = useState('idle'); // idle | working | done | error

  async function submit(turnOn) {
    setState('working');
    try {
      const res = await fetch(
        turnOn ? `/api/unsubscribe/resume?${q}` : `/api/unsubscribe?${q}`,
        { method: 'POST' }
      );
      setState(res.ok ? (turnOn ? 'resumed' : 'done') : 'error');
    } catch {
      setState('error');
    }
  }

  if (!token) {
    return (
      <p>
        This link is missing its code. Open the link straight from the email, or manage your
        email settings in <Link href="/app">your account</Link>.
      </p>
    );
  }

  if (state === 'done') {
    return (
      <>
        <h1>{copy.off}</h1>
        <p>{copy.offBody}</p>
        <p>
          Changed your mind?{' '}
          <button type="button" className="btn ghost small" onClick={() => submit(true)}>
            Turn them back on
          </button>
        </p>
        <p style={{ marginTop: 22 }}>
          <Link href="/app">← Back to RecruitGrid</Link>
        </p>
      </>
    );
  }

  if (state === 'resumed') {
    return (
      <>
        <h1>{copy.on}</h1>
        <p>{copy.onBody}</p>
        <p style={{ marginTop: 22 }}>
          <Link href="/app">← Back to RecruitGrid</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>{copy.ask}</h1>
      <p>{copy.askBody}</p>
      <button
        type="button"
        className="btn gold"
        onClick={() => submit(false)}
        disabled={state === 'working'}
      >
        {state === 'working' ? copy.working : copy.button}
      </button>
      {state === 'error' && (
        <p style={{ color: '#B4342B', marginTop: 14 }}>
          That didn&apos;t work. Try again, or email info@recruitgrid.app and I&apos;ll do it by hand.
        </p>
      )}
      <p style={{ marginTop: 22 }}>
        <Link href="/app">← Back to RecruitGrid</Link>
      </p>
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '56px 20px' }}>
      <Suspense fallback={null}>
        <UnsubscribeInner />
      </Suspense>
    </main>
  );
}
