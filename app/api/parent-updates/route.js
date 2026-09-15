import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { parentConfirmEmail } from '@/lib/emails/parent-weekly';
import { confirmUrlFor, sendEmail } from '@/lib/parent-weekly';

// Add, change or remove the parent address for the signed-in athlete.
//
// The caller is identified from their session; the write goes through the
// admin client because these columns are protected from browser writes (see
// supabase/55-parent-weekly.sql). Adding an address sends one confirmation
// email and nothing more — the weekly update starts only once someone at that
// address confirms.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// One confirmation email per athlete per this long, so the button can't be
// used to fire mail at an inbox.
const RESEND_AFTER_MS = 2 * 60 * 1000;

const CLEARED = {
  parent_email: null,
  parent_token: null,
  parent_invited_at: null,
  parent_confirmed_email: null,
  parent_confirmed_at: null,
};

async function signedInUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request) {
  const user = await signedInUser();
  if (!user) return Response.json({ error: 'Sign in again.' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Bad request.' }, { status: 400 });
  }
  const email = String(body?.email || '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return Response.json({ error: 'That email address doesn’t look right.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: p, error: readErr } = await admin
    .from('profiles')
    .select('name, parent_email, parent_token, parent_invited_at, parent_confirmed_email')
    .eq('id', user.id)
    .maybeSingle();
  if (readErr) return Response.json({ error: readErr.message }, { status: 500 });

  if (p?.parent_confirmed_email && p.parent_confirmed_email === email && p.parent_email === email) {
    return Response.json({ ok: true, status: 'confirmed' });
  }
  if (p?.parent_email === email && p.parent_invited_at && Date.now() - new Date(p.parent_invited_at).getTime() < RESEND_AFTER_MS) {
    return Response.json({ error: 'A confirmation email just went out. Give it a couple of minutes before sending another.' }, { status: 429 });
  }

  // A new address gets a new code, so links sent to an old address stop working.
  const token = p?.parent_email === email && p.parent_token ? p.parent_token : randomBytes(12).toString('hex');
  const { error: writeErr } = await admin
    .from('profiles')
    .update({
      parent_email: email,
      parent_token: token,
      parent_invited_at: new Date().toISOString(),
      parent_confirmed_email: null,
      parent_confirmed_at: null,
    })
    .eq('id', user.id);
  if (writeErr) return Response.json({ error: writeErr.message }, { status: 500 });

  const name = String(p?.name || '').trim();
  const { subject, html } = parentConfirmEmail({
    athleteName: name,
    firstName: name.split(/\s+/)[0] || '',
    confirmUrl: confirmUrlFor(token),
  });
  try {
    await sendEmail({ to: email, subject, html });
  } catch (e) {
    return Response.json({ error: `Saved, but the confirmation email didn’t send: ${e.message}` }, { status: 502 });
  }
  return Response.json({ ok: true, status: 'pending' });
}

export async function DELETE() {
  const user = await signedInUser();
  if (!user) return Response.json({ error: 'Sign in again.' }, { status: 401 });
  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update(CLEARED).eq('id', user.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, status: 'off' });
}
