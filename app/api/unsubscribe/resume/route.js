import { createAdminClient } from '@/lib/supabase-admin';

// The opposite of ../route.js. Separate endpoint rather than a flag on the
// same one so that a mail client's one-click POST can only ever turn mail
// *off* — an opt-in must never be something a link fetch can do on the
// recipient's behalf.
export async function POST(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('t');
  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }

  // Mirrors ../route.js: turn back on whichever stream was turned off.
  const column =
    url.searchParams.get('type') === 'newsletter' ? 'email_newsletter' : 'email_reminders';

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .update({ [column]: true })
    .eq('unsubscribe_token', token)
    .select('id');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, updated: data?.length ?? 0 });
}
