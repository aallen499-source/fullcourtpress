'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Where the links in parent emails land: confirming the weekly update, or
// stopping it. A button rather than acting on page load, because mail
// scanners open every link — a confirmation on arrival would be confirmed by a
// link checker, not a person. See lib/parent-weekly.js.

const COPY = {
  confirm: {
    ask: 'Get a weekly recruiting update?',
    body: 'A short email every Sunday: coaches contacted, which coaches opened the recruiting profile, schools that have gone quiet, camps coming up and this month’s checklist. Stop any time from the link at the bottom of each one.',
    button: 'Yes, send me the updates',
    working: 'Confirming…',
    done: (first) => `You’re set${first ? ` — ${first}’s` : '. The'} first update arrives Sunday morning.`,
    doneBody: 'Nothing is sent to coaches from these emails. They only show what’s happening in the RecruitGrid account.',
  },
  stop: {
    ask: 'Stop the weekly recruiting update?',
    body: 'You won’t get any more Sunday updates at this address. The athlete’s RecruitGrid account isn’t affected.',
    button: 'Stop the updates',
    working: 'Stopping…',
    done: () => 'The weekly update is off.',
    doneBody: 'To start it again, the athlete can add this address in their RecruitGrid account settings, and you’ll get a new confirmation email.',
  },
};

function ParentInner() {
  const params = useSearchParams();
  const token = params.get('t') || '';
  const action = params.get('a') === 'stop' ? 'stop' : 'confirm';
  const copy = COPY[action];
  const [state, setState] = useState('idle'); // idle | working | done | error
  const [message, setMessage] = useState('');
  const [first, setFirst] = useState('');

  async function submit() {
    setState('working');
    try {
      const res = await fetch(`/api/parent-updates/${action}?t=${encodeURIComponent(token)}`, { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(body.error || '');
        setState('error');
        return;
      }
      setFirst(body.firstName || '');
      setState('done');
    } catch {
      setState('error');
    }
  }

  if (!token) {
    return <p>This link is missing its code. Open it straight from the email.</p>;
  }

  if (state === 'done') {
    return (
      <>
        <h1>{copy.done(first)}</h1>
        <p>{copy.doneBody}</p>
      </>
    );
  }

  return (
    <>
      <h1>{copy.ask}</h1>
      <p>{copy.body}</p>
      <button type="button" className="btn gold" onClick={submit} disabled={state === 'working'}>
        {state === 'working' ? copy.working : copy.button}
      </button>
      {state === 'error' && (
        <p style={{ color: '#B4342B', marginTop: 14 }}>
          {message || 'That didn’t work.'} Try again, or email info@recruitgrid.app and I’ll sort it out by hand.
        </p>
      )}
      <p style={{ marginTop: 22 }}>
        <Link href="/">About RecruitGrid</Link>
      </p>
    </>
  );
}

export default function ParentPage() {
  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '56px 20px' }}>
      <Suspense fallback={null}>
        <ParentInner />
      </Suspense>
    </main>
  );
}
