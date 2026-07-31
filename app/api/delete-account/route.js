import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

// Deleting the auth.users row cascades through profiles -> coaches/film/
// templates/user_camps/subscriptions (all "on delete cascade" in the
// schema), and detaches them from any team they're on ("on delete set
// null"). Storage objects aren't covered by that cascade — those live in a
// separate system keyed by path, not a foreign key — so they're removed
// explicitly first.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const admin = createAdminClient();

  for (const bucket of ['avatars', 'film']) {
    const { data: files } = await admin.storage.from(bucket).list(user.id);
    if (files?.length) {
      await admin.storage.from(bucket).remove(files.map((f) => `${user.id}/${f.name}`));
    }
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
