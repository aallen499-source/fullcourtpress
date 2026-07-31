'use client';

import { createBrowserClient } from '@supabase/ssr';

// Use this in any component marked 'use client'.
// The anon key is meant to be public — Row Level Security is what protects data.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
