import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Where the emailed link lands. Exchanges the one-time code for a session,
// then sends the athlete into the app.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/app';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Make sure a profile row exists for this user — but only create it,
      // never overwrite it. Every sign-in re-runs this (clicking the magic
      // link *is* how you sign in), so a plain upsert here was silently
      // reverting any contact email someone had customized on My Info back
      // to their login email on every subsequent sign-in.
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, email: user.email }, { onConflict: 'id', ignoreDuplicates: true });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Expired, already used, or tampered with — all land here.
  return NextResponse.redirect(`${origin}/signin?error=link_invalid`);
}
