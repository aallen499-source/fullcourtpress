import { createClient } from '@/lib/supabase-server';

// Stamped the first time someone opens the dashboard from a home screen icon.
//
// Request-scoped client, not admin, so the profiles RLS policy is what limits
// this to the caller's own row — the body carries nothing, and there is no
// user id to forge.

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // is('installed_at', null) keeps the first open, rather than overwriting it
  // on every launch and turning the column into "last opened". The distinction
  // matters: this is meant to answer how many people ever got that far.
  const { error } = await supabase
    .from('profiles')
    .update({ installed_at: new Date().toISOString() })
    .eq('id', user.id)
    .is('installed_at', null);

  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true });
}
