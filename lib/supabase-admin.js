import { createClient } from '@supabase/supabase-js';

// Service-role client — bypasses Row Level Security entirely. Only use this
// on the server, and only where the caller isn't the end user themselves
// (e.g. a Stripe webhook writing subscription status for whichever customer
// the event is about). Never import this into anything that runs in the
// browser, and never expose SUPABASE_SERVICE_ROLE_KEY via NEXT_PUBLIC_.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
