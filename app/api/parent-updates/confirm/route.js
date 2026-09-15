import { createAdminClient } from '@/lib/supabase-admin';

// POST only. Mail scanners open every link in a message, and a confirmation
// that happened on GET would be confirmed by Outlook's link checker rather
// than a person. The emailed link goes to /parent, which has a button.
export async function POST(request) {
  const token = new URL(request.url).searchParams.get('t') || '';
  if (!/^[a-f0-9]{24}$/.test(token)) return Response.json({ error: 'This link is missing its code.' }, { status: 400 });

  const admin = createAdminClient();
  const { data: p, error } = await admin
    .from('profiles')
    .select('id, name, parent_email')
    .eq('parent_token', token)
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!p?.parent_email) {
    return Response.json({ error: 'This link has expired — the address may have been changed or removed.' }, { status: 404 });
  }

  const { error: writeErr } = await admin
    .from('profiles')
    .update({ parent_confirmed_email: p.parent_email, parent_confirmed_at: new Date().toISOString() })
    .eq('id', p.id);
  if (writeErr) return Response.json({ error: writeErr.message }, { status: 500 });

  return Response.json({ ok: true, firstName: String(p.name || '').trim().split(/\s+/)[0] || '' });
}
