'use client';

import { useEffect, useState } from 'react';

// Turns camp reminders into notifications instead of email.
//
// The iOS rule shapes this whole component: web push is delivered only to a
// PWA that has been added to the Home Screen. An iPhone user in a Safari tab
// cannot subscribe at all, so they are shown nothing here — app/app/
// InstallPrompt.jsx is what talks to them, and this appears once they install.
//
// Permission is requested from a real click, never on load. A browser gives a
// site one chance: a denied permission is sticky, cannot be re-prompted, and
// can only be undone in browser settings, which nobody does. So the button is
// the ask, and the copy says what they get before they are asked.

// VAPID keys travel as base64url, and applicationServerKey wants raw bytes.
function urlBase64ToUint8Array(base64) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = window.atob(padded);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export default function PushToggle() {
  const [state, setState] = useState('hidden'); // hidden|off|on|denied|working|error
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      // No VAPID key configured means no push is possible; showing a button
      // that always fails is worse than showing nothing.
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
      // iOS in a browser tab cannot subscribe, whatever the button says.
      if (isIos() && !isStandalone()) return;

      if (Notification.permission === 'denied') {
        if (!cancelled) setState('denied');
        return;
      }

      // Registering here rather than behind the click means the worker is
      // already active by the time someone presses the button, which is one
      // less thing to go wrong inside a user gesture.
      const reg = await navigator.serviceWorker.register('/sw.js');
      const existing = await reg.pushManager.getSubscription();
      if (!cancelled) setState(existing ? 'on' : 'off');
    })().catch(() => {
      if (!cancelled) setState('hidden');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setState('working');
    setMessage('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        // Required to be true by every browser: a push that shows no
        // notification is not allowed, and Safari revokes permission for it.
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error(await res.text());

      setState('on');
    } catch (err) {
      setState('error');
      setMessage(String(err?.message || err).slice(0, 160));
    }
  }

  async function disable() {
    setState('working');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        // Server first: if the row survives a failed local unsubscribe we would
        // keep pushing to a browser that has stopped listening, and the send
        // would succeed silently forever.
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('off');
    } catch {
      setState('on');
    }
  }

  if (state === 'hidden') return null;

  const card = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderLeft: '3px solid var(--gold)',
    borderRadius: 8,
    padding: '14px 16px',
    margin: '16px 0 0',
  };

  return (
    <div style={card}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
          {state === 'on' ? 'Camp reminders are on' : 'Get camp reminders as notifications'}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.55 }}>
          {state === 'denied' ? (
            <>
              Notifications are blocked for this site. You can turn them back on in
              your browser or phone settings — we can&apos;t ask again from here.
            </>
          ) : state === 'on' ? (
            <>A week before any camp you&apos;ve registered for, on this device.</>
          ) : state === 'error' ? (
            <>Couldn&apos;t turn these on{message ? `: ${message}` : '.'}</>
          ) : (
            <>
              A week before any camp you&apos;ve registered for — on your phone, instead
              of an email you might miss.
            </>
          )}
        </div>
        {(state === 'off' || state === 'error') && (
          <button className="btn gold small" style={{ marginTop: 10 }} onClick={enable}>
            Turn on notifications
          </button>
        )}
        {state === 'on' && (
          <button className="btn ghost small" style={{ marginTop: 10 }} onClick={disable}>
            Turn off
          </button>
        )}
        {state === 'working' && (
          <div className="muted small" style={{ marginTop: 10 }}>Working…</div>
        )}
      </div>
    </div>
  );
}
