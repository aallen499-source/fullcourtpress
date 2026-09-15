'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

// A slim bar across the public pages with a way back into the app.
//
// Installed on a phone, RecruitGrid runs without browser chrome — no back
// button, no address bar. Anyone who tapped from the dashboard to Resources,
// a camp page or their own profile had no way home except closing the app.
//
// Where it shows:
// - Public pages (resources, camps, questionnaires, pricing, about…): the
//   RecruitGrid name, and "My dashboard" for a signed-in visitor or
//   "Start free" for everyone else.
// - Athlete profiles and film share pages: only a small "← My dashboard" link,
//   and only for a signed-in visitor. Those pages are mostly seen by college
//   coaches, and they should look like the athlete's page, not an ad.
// - Never on the dashboard, sign-in, or the landing page (which has its own).

const APP_PAGES = ['/app', '/signin', '/auth', '/api'];
const PUBLIC_PREFIXES = ['/resources', '/camps', '/questionnaires', '/pricing', '/about', '/privacy', '/terms', '/parent', '/unsubscribe'];

export default function SiteNav() {
  const pathname = usePathname() || '/';
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // getSession reads the stored session without a network call — enough to
    // choose a link. Nothing here grants access; /app checks for real.
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!cancelled) setSignedIn(!!data?.session);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (pathname === '/' || APP_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isPublic) {
    // An athlete profile (/jamario-smith) or a film share (/f/…).
    if (!signedIn) return null;
    return (
      <div className="site-nav site-nav-min">
        <Link href="/app" className="site-nav-back">← My dashboard</Link>
      </div>
    );
  }

  return (
    <nav className="site-nav">
      <Link href="/" className="site-nav-brand">
        Recruit<span>Grid</span>
      </Link>
      <div className="site-nav-links">
        <Link href="/resources">Resources</Link>
        <Link href="/camps">Camps</Link>
        <Link href="/app" className="btn gold small">
          {signedIn ? 'My dashboard →' : 'Start free →'}
        </Link>
      </div>
    </nav>
  );
}
