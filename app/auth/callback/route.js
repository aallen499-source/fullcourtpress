import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { welcomeEmail } from '@/lib/emails/welcome';

// Sent once, the first time someone verifies — never on later sign-ins, since
// clicking a magic link *is* how you sign in here and this route runs every
// time. See the .select() below for how a first verification is detected.
//
// Never throws. Signing in must not fail because an email didn't send: this
// runs between a successful verification and the redirect into the app, so an
// uncaught error here would strand someone on the sign-in page holding a
// perfectly valid session.
async function sendWelcomeEmail(loginEmail) {
  if (!process.env.RESEND_API_KEY) {
    console.error('auth/callback: RESEND_API_KEY unset, skipping welcome email');
    return;
  }
  try {
    const { subject, html } = welcomeEmail({ loginEmail });
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RecruitGrid <notifications@recruitgrid.app>',
        // The footer promises a reply reaches a person, so point it at the
        // mailbox that is actually read rather than the send-only address.
        reply_to: 'info@recruitgrid.app',
        to: loginEmail,
        subject,
        html,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.error('auth/callback: welcome email failed:', err);
  }
}

// Where the emailed link lands.
//
// Two paths on purpose:
//   token_hash + type -> verifyOtp()             (preferred)
//   code              -> exchangeCodeForSession  (PKCE, legacy)
//
// PKCE stores a one-time verifier in the browser that *requested* the link.
// That breaks on phones: someone types their email in Safari, then taps the
// link from the Mail or Gmail app, which opens in a separate in-app browser
// with its own storage. The verifier isn't there, the exchange fails, and they
// land back on sign-in with no session — repeatedly, which reads as a loop
// rather than an error.
//
// verifyOtp needs nothing stored locally, so it works regardless of which
// browser opens the link. The PKCE branch stays for links already in inboxes.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/app';

  const supabase = await createClient();
  let verified = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    verified = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  }

  if (verified) {
    // Make sure a profile row exists for this user — but only create it,
    // never overwrite it. Every sign-in re-runs this (clicking the magic
    // link *is* how you sign in), so a plain upsert here was silently
    // reverting any contact email someone had customized on My Info back
    // to their login email on every subsequent sign-in.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // login_email is separate from the editable "email" field above —
      // it always mirrors the real auth email so Stripe payments (checked
      // out with that same address) can be matched back to this account
      // even after someone customizes their contact email in My Info.
      //
      // The .select() is what makes the welcome email possible. ignoreDuplicates
      // compiles to ON CONFLICT DO NOTHING, and Postgres only returns rows it
      // actually inserted — so a brand-new account comes back with one row and
      // every subsequent sign-in comes back empty. That distinction is the only
      // reliable "this is their first time" signal available here; profiles has
      // a created_at, but comparing it to now() would be a race and a guess.
      const { data: inserted, error: profileErr } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, email: user.email, login_email: user.email },
          { onConflict: 'id', ignoreDuplicates: true }
        )
        .select('id');

      // A failed insert must not send a welcome — better no email than one
      // greeting someone whose account row doesn't exist.
      if (!profileErr && inserted?.length > 0) {
        await sendWelcomeEmail(user.email);
      }
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Expired, already used, or opened somewhere PKCE can't complete.
  return NextResponse.redirect(`${origin}/signin?error=link_invalid`);
}
