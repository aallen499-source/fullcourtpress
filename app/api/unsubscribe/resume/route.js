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
  // opens: "a coach opened your profile" alerts. updates: occasional
  // what's-new emails (see supabase/56-open-alerts-and-announcement.sql).
  const COLUMNS = { newsletter: 'email_newsletter', opens: 'email_open_alerts', updates: 'email_product_updates' };
  const column = COLUMNS[url.searchParams.get('type')] || 'email_reminders';

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
