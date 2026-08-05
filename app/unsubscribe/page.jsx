'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

// A button rather than an automatic opt-out on page load. Mail scanners fetch
// every link in a message, so "unsubscribe on arrival" silently unsubscribes
// people whose employer runs link-checking. One deliberate click is the cost.
function UnsubscribeInner() {
  const token = useSearchParams().get('t');
  const [state, setState] = useState('idle'); // idle | working | done | error

  async function submit(turnOn) {
    setState('working');
    try {
      const res = await fetch(
        turnOn ? `/api/unsubscribe/resume?t=${token}` : `/api/unsubscribe?t=${token}`,
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
        This link is missing its code. Open the link straight from the email, or manage reminders
        in <Link href="/app">your account</Link>.
      </p>
    );
  }

  if (state === 'done') {
    return (
      <>
        <h1>Camp reminders are off</h1>
        <p>You won&apos;t get any more reminder emails about camps you&apos;ve registered for.</p>
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
        <h1>Camp reminders are back on</h1>
        <p>We&apos;ll email you a week before a camp you&apos;re registered for.</p>
        <p style={{ marginTop: 22 }}>
          <Link href="/app">← Back to RecruitGrid</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Turn off camp reminders?</h1>
      <p>
        You&apos;ll stop getting emails about camps you&apos;ve marked as registered. This
        doesn&apos;t affect billing or sign-in emails, and your account stays exactly as it is.
      </p>
      <button
        type="button"
        className="btn gold"
        onClick={() => submit(false)}
        disabled={state === 'working'}
      >
        {state === 'working' ? 'Turning off…' : 'Turn off camp reminders'}
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
