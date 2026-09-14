'use client';

import { useEffect } from 'react';

// Tells /api/opened that the profile link emailed to one coach was really
// looked at. Renders nothing.
//
// Only reports once the page has been VISIBLE for four seconds in total —
// time in a background tab does not count — because email security scanners
// open every link in a message within a second or two and then leave. A false
// "your coach opened this" would do more harm than no signal at all.
const MIN_VISIBLE_MS = 4000;

export default function OpenBeacon({ slug }) {
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('c');
    if (!token || !/^[a-f0-9]{12}$/i.test(token)) return;
    if (navigator.webdriver) return; // automated browsers identify themselves

    let visibleMs = 0;
    let since = document.visibilityState === 'visible' ? performance.now() : null;
    let sent = false;

    const send = () => {
      if (sent) return;
      sent = true;
      fetch('/api/opened', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token, visibleMs: Math.round(visibleMs) }),
        keepalive: true,
      }).catch(() => {});
    };

    const check = () => {
      if (since !== null) {
        const t = performance.now();
        visibleMs += t - since;
        since = t;
      }
      if (visibleMs >= MIN_VISIBLE_MS) {
        send();
        clearInterval(timer);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        since = performance.now();
      } else {
        check();
        since = null;
      }
    };

    const timer = setInterval(check, 500);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [slug]);

  return null;
}
