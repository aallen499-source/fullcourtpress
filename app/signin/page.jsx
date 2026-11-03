'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [prefilled, setPrefilled] = useState(false);
  const [isNewIntent, setIsNewIntent] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  // Came back from the 'check your email' screen to correct the address, as
  // opposed to arriving fresh. Only used to put the cursor in the box, but
  // that is the difference between fixing a typo in one keystroke and
  // hunting for the field again.
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    // "Get Started — Free" on the homepage sends brand-new visitors here
    // with ?intent=new (only when they have no local data yet), so this
    // page can read as sign-up rather than a login-only screen for them.
    const params = new URLSearchParams(window.location.search);
    if (params.get('intent') === 'new') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsNewIntent(true);
    }
    // The callback redirects here with ?error=link_invalid when a link can't
    // be verified. Without surfacing it, someone lands on a blank form with
    // no idea what happened, requests another link, and hits the same wall —
    // which is indistinguishable from the page looping.
    if (params.get('error') === 'link_invalid') {
      setError(
        "That sign-in link didn't work — it may have expired, already been used, or been opened in a different browser. Enter your email below and we'll send a fresh one."
      );
    }
    try {
      const raw = localStorage.getItem('recruiting-hq-data');
      const savedEmail = raw && JSON.parse(raw)?.settings?.email;
      if (savedEmail) {
        // One-time read of the locally-saved onboarding email so returning
        // users don't have to retype it; no equivalent outside an effect.
        setEmail(savedEmail);
        setPrefilled(true);
      }
    } catch {}
  }, []);

  async function sendLink(e) {
    e.preventDefault();
    setError('');
    setSending(true);

    const supabase = createClient();
    const next = new URLSearchParams(window.location.search).get('next') || '/app';

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // First-time email creates the account — signup and signin are one flow,
        // so there's no separate "register" step to explain.
        shouldCreateUser: true
      }
    });

    setSending(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <main className="auth-wrap">
        <h1>Check your email</h1>
        <p>
          We sent {isNewIntent ? 'a link to finish setting up your account' : 'a sign-in link'} to:
        </p>
        {/* On its own line and big enough to actually read. It used to sit
            inline in the sentence above, where a wrong character is easy to
            slide past — and sliding past it is the whole failure, because
            there is no "wrong password" to catch you. */}
        <p style={{
          fontSize: '1.15rem', fontWeight: 700, wordBreak: 'break-all',
          margin: '0 0 14px', padding: '12px 14px',
          border: '1px solid var(--line)', borderRadius: 8, background: 'var(--paper)',
        }}>
          {email}
        </p>
        <p>It expires in about an hour.</p>
        {/* Two athletes lost accounts this way by 2026-11-03: they already had
            working profiles and typed a shortened version of their own address
            on a later visit, which silently created a second, empty account and
            sent the link to an inbox they could not open. From their side the
            product simply stopped working. Naming the consequence is the only
            defence available, because the mistake is in the name part of the
            address and no automatic check can tell josh@ from joshua@. */}
        <p className="muted">
          Read it back before you wait. One wrong character and the link goes to an
          inbox you can&apos;t open, and you end up with a second empty account
          rather than the one you meant to use.
        </p>
        <p className="muted">
          Nothing yet? Check your spam folder. School email accounts sometimes block
          outside mail — a personal address usually works better.
        </p>
        {/* Keeps the address instead of wiping it. Correcting one character is
            the common case here; clearing the box forces a full retype, which
            is how you make the same typo twice. */}
        <button onClick={() => { setSent(false); setFixing(true); }}>
          That&apos;s not right — change it
        </button>
      </main>
    );
  }

  return (
    <main className="auth-wrap">
      <h1>{isNewIntent ? 'Get Started — Free' : 'Sign in to RecruitGrid'}</h1>
      <p className="muted">
        {fixing
          ? 'Check it character by character — especially the part before the @. If you have signed in before, it has to be the same address you used then, or you will land in a new empty account.'
          : isNewIntent
          ? "One email, no password. We'll send you a link that creates your account and takes you straight into the app."
          : prefilled
          ? "We found the email you started with below — confirm it's still right, or use a different one."
          : "No password. Enter your email and we'll send you a link that signs you in."}
      </p>

      <form onSubmit={sendLink}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // The input remounts when the sent screen is dismissed, so autoFocus
          // fires again here — it only applies on mount.
          autoFocus={fixing}
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Sending…' : isNewIntent ? 'Send my sign-up link' : 'Email me a sign-in link'}
        </button>
      </form>

      {error && <p role="alert" className="error">{error}</p>}

      <p className="muted small">
        {isNewIntent
          ? "If you're under 18, let a parent or guardian know you're signing up."
          : "First time here? Entering your email creates your account. If you're under 18, let a parent or guardian know you're signing up."}
      </p>
    </main>
  );
}
