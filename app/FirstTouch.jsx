'use client';

import { useEffect } from 'react';
import { captureTouch } from '@/lib/first-touch';

// Notes where this visit came from, in this browser only. Nothing leaves the
// device here: it is read again, and sent, only if the visitor asks for a
// sign-in link (app/signin/page.jsx). The reasoning is in lib/first-touch.js.
export default function FirstTouch() {
  useEffect(() => { captureTouch(); }, []);
  return null;
}
