import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendParentWeekly } from '@/lib/parent-weekly';

// "Send this week's update now" — so a family can see what the parent will
// get without waiting for Sunday. Goes only to the confirmed address, and at
// most every ten minutes. Doesn't touch parent_last_sent_at, so Sunday's
// update still goes out.
const EVERY_MS = 10 * 60 * 1000;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in again.' }, { status: 401 });

  const admin = createAdminClient();
  const { data: p } = await admin
    .from('profiles')
    .select('parent_email, parent_confirmed_email, parent_preview_at')
    .eq('id', user.id)
    .maybeSingle();
  if (!p?.parent_email || p.parent_confirmed_email !== p.parent_email) {
    return Response.json({ error: 'The parent address hasn’t been confirmed yet.' }, { status: 400 });
  }
  if (p.parent_preview_at && Date.now() - new Date(p.parent_preview_at).getTime() < EVERY_MS) {
    return Response.json({ error: 'One just went out. Try again in a few minutes.' }, { status: 429 });
  }

  await admin.from('profiles').update({ parent_preview_at: new Date().toISOString() }).eq('id', user.id);
  try {
    const result = await sendParentWeekly(admin, user.id);
    if (!result.sent) return Response.json({ error: 'The parent address hasn’t been confirmed yet.' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: `Couldn’t send: ${e.message}` }, { status: 502 });
  }
  return Response.json({ ok: true });
}
