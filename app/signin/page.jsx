'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

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
          We sent a sign-in link to <strong>{email}</strong>. It expires in about an hour.
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
      <h1>Sign in to Full Court Press</h1>
      <p className="muted">
        No password. Enter your email and we&apos;ll send you a link that signs you in.
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
          {sending ? 'Sending…' : 'Email me a sign-in link'}
        </button>
      </form>

      {error && <p role="alert" className="error">{error}</p>}

      <p className="muted small">
        First time here? Entering your email creates your account.
        If you&apos;re under 18, let a parent or guardian know you&apos;re signing up.
      </p>
    </main>
  );
}
