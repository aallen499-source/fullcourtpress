import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

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
      await supabase
        .from('profiles')
        .upsert(
          { id: user.id, email: user.email, login_email: user.email },
          { onConflict: 'id', ignoreDuplicates: true }
        );
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Expired, already used, or opened somewhere PKCE can't complete.
  return NextResponse.redirect(`${origin}/signin?error=link_invalid`);
}
