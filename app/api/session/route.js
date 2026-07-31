import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Bridges the cookie-based session (set by /auth/callback, read by proxy.js
// and /app) into the static app page, which uses a separate plain-JS
// Supabase client that only knows about localStorage. Without this, the
// homepage has no way to know a real sign-in already happened server-side.
export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ signedIn: false });
  return NextResponse.json({
    signedIn: true,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
