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
          We sent {isNewIntent ? 'a link to finish setting up your account' : 'a sign-in link'} to{' '}
          <strong>{email}</strong>. It expires in about an hour.
        </p>
        <p className="muted">
          Nothing yet? Check your spam folder. School email accounts sometimes block
          outside mail — a personal address usually works better.
        </p>
        <button onClick={() => { setSent(false); setEmail(''); }}>
          Use a different email
        </button>
      </main>
    );
  }

  return (
    <main className="auth-wrap">
      <h1>{isNewIntent ? 'Get Started — Free' : 'Sign in to RecruitGrid'}</h1>
      <p className="muted">
        {isNewIntent
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
