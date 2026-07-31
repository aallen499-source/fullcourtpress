import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Bridges the cookie-based session (set by /auth/callback, read by proxy.js
// and /app) into the static app page, which uses a separate plain-JS
// Supabase client that only knows about localStorage. Without this, the
// homepage has no way to know a real sign-in already happened server-side.
//
// Must never be cached — the response depends entirely on the request's
// cookies, so a cached "signedIn: false" from an earlier anonymous visit
// would keep showing "Sign in" forever even after someone actually signs in.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const body = session
    ? { signedIn: true, access_token: session.access_token, refresh_token: session.refresh_token }
    : { signedIn: false };

  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
