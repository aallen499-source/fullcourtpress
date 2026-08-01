import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

// Only the Stripe webhook (service role) may write subscriptions — regular
// users have no insert/update policy there on purpose, so nobody can grant
// themselves a plan. This route is the one deliberate exception: joining a
// team via invite code means the coach already paid for up to 12 athletes
// on the Team/Club plan, so the athlete gets full access for 4 months
// without paying individually. It only fires right after a real join_team()
// call succeeds, and never shortens an athlete's existing paid access.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', user.id).single();
  if (!profile?.team_id) {
    return NextResponse.json({ error: 'Not on a team' }, { status: 400 });
  }

  const admin = createAdminClient();
  const fourMonthsOut = new Date();
  fourMonthsOut.setMonth(fourMonthsOut.getMonth() + 4);

  const { data: existing } = await admin
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const alreadyCoveredLonger =
    existing?.status === 'active' && existing.current_period_end && new Date(existing.current_period_end) > fourMonthsOut;
  if (alreadyCoveredLonger) {
    return NextResponse.json({ ok: true, skipped: 'already has longer access' });
  }

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: user.id,
      plan: 'Team Member',
      status: 'active',
      current_period_end: fourMonthsOut.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, current_period_end: fourMonthsOut.toISOString() });
}
