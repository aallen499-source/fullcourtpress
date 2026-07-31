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
      // Make sure a profile row exists for this user.
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, email: user.email }, { onConflict: 'id' });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Expired, already used, or tampered with — all land here.
  return NextResponse.redirect(`${origin}/signin?error=link_invalid`);
}
