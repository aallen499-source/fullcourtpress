'use client';

import { useEffect, useState } from 'react';

// "Add to Home Screen" nudge for the dashboard.
//
// This exists for a reason beyond a nicer icon: on iOS, web push is delivered
// ONLY to a PWA that has been added to the Home Screen. Safari in a tab gets
// nothing, ever. So camp reminders arriving as notifications instead of email
// depends entirely on people installing first, and nothing in the product
// currently asks them to.
//
// Two different jobs, because the platforms differ:
//   Android/Chrome — fires beforeinstallprompt, which we stash and replay from
//                    our own button. One shot: once prompt() is called the
//                    event is spent and the browser will not hand us another.
//   iOS/Safari     — has no programmatic prompt at all. The only option is to
//                    tell someone where the button is, so this renders
//                    instructions rather than a button.
//
// Deliberately not shown on someone's first visit. A cold install prompt to
// someone who has been in the app for ninety seconds gets dismissed, and on
// Android a dismissed prompt is not offered again for a long time — so asking
// early actively costs us the install we wanted.

const VISITS_KEY = 'rg_app_visits';
const DISMISSED_KEY = 'rg_install_dismissed_at';
const SHOW_FROM_VISIT = 2;
const RESHOW_AFTER_DAYS = 30;
// The card is revealed a beat after mount rather than on first paint. Sliding
// something in while the dashboard is still assembling itself reads as an
// interruption, and it competes with the content someone actually opened the
// app for. It also keeps the reveal out of the effect body, which React 19
// flags as a cascading render.
const REVEAL_DELAY_MS = 2500;

// Every localStorage access is wrapped: Safari in private mode throws on read
// as well as write, and an exception here would take the whole dashboard down
// with it. A browser that will not store anything simply never sees the card.
function readLS(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeLS(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode, or storage disabled — nothing to do */
  }
}

function isStandalone() {
  // Two checks because they disagree: the media query is the standard, and
  // navigator.standalone is the iOS-only legacy flag Safari still sets.
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// Only Safari can install a PWA on iOS. Chrome, Firefox and Edge on iOS are
// Safari underneath but do not expose Add to Home Screen, so showing them the
// instructions would send someone hunting for a button that isn't there.
function isIosSafari() {
  const ua = window.navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ reports itself as a Mac; the touch points give it away.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios && !/crios|fxios|edgios|opios/i.test(ua);
}

export default function InstallPrompt() {
  const [mode, setMode] = useState(null); // 'android' | 'ios' | null
  const [deferred, setDeferred] = useState(null);

  useEffect(() => {
    if (isStandalone()) {
      // Nothing to ask for — but this is the only moment anything server-side
      // learns the install happened, so record it before returning. Fire and
      // forget: a failed stamp costs a number on a dashboard, and must never
      // surface to someone who has done nothing wrong.
      fetch('/api/installed', { method: 'POST' }).catch(() => {});
      return;
    }

    const dismissedAt = Number(readLS(DISMISSED_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < RESHOW_AFTER_DAYS * 86400000) return;

    // Counted once per mount, which is once per dashboard load. Someone who
    // signed up today and is still on their first session is not asked.
    const visits = Number(readLS(VISITS_KEY) || 0) + 1;
    writeLS(VISITS_KEY, String(visits));
    if (visits < SHOW_FROM_VISIT) return;

    let timer;

    if (isIosSafari()) {
      timer = setTimeout(() => setMode('ios'), REVEAL_DELAY_MS);
      return () => clearTimeout(timer);
    }

    // Android/desktop Chrome. The event fires only when the browser considers
    // the app installable, so this is also our installability check — if it
    // never fires, we correctly show nothing rather than a button that fails.
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      timer = setTimeout(() => setMode('android'), REVEAL_DELAY_MS);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    writeLS(DISMISSED_KEY, String(Date.now()));
    setMode(null);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    // Spent either way — accepted or dismissed, this event cannot be reused.
    setDeferred(null);
    setMode(null);
    writeLS(DISMISSED_KEY, String(Date.now()));
  };

  if (!mode) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderLeft: '3px solid var(--gold)',
        borderRadius: 8,
        padding: '14px 16px',
        margin: '16px 0 0',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
          Keep RecruitGrid on your home screen
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.55 }}>
          {mode === 'ios' ? (
            <>
              Tap the Share button in Safari, then <strong>Add to Home Screen</strong>.
              It opens full screen, and it&apos;s how camp reminders can reach you as
              notifications rather than email.
            </>
          ) : (
            <>
              Opens full screen, loads faster on gym wifi, and it&apos;s how camp
              reminders can reach you as notifications rather than email.
            </>
          )}
        </div>
        {mode === 'android' && (
          <button className="btn gold small" style={{ marginTop: 10 }} onClick={install}>
            Install
          </button>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--sub)',
          fontSize: 18,
          lineHeight: 1,
          cursor: 'pointer',
          padding: 4,
        }}
      >
        ×
      </button>
    </div>
  );
}
