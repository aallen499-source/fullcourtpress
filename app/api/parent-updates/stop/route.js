import { createAdminClient } from '@/lib/supabase-admin';

// Stops the weekly update for whoever holds the link. POST only, for the same
// reason as unsubscribe: scanners GET every link. Also the target of the
// List-Unsubscribe header, which Gmail and Outlook POST to directly.
//
// A bad or used code still reports success — there is nothing for the sender
// to do differently, and a "no such code" answer would let codes be guessed.
export async function POST(request) {
  const token = new URL(request.url).searchParams.get('t') || '';
  if (!/^[a-f0-9]{24}$/.test(token)) return Response.json({ ok: true });

  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({
      parent_email: null,
      parent_token: null,
      parent_invited_at: null,
      parent_confirmed_email: null,
      parent_confirmed_at: null,
    })
    .eq('parent_token', token);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
