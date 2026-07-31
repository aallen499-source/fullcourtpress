import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Clears the cookie-based session so /app and proxy.js see the user as
// signed out too — the static page's own client-side signOut() only clears
// its local copy, not the server-readable cookie session.
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
