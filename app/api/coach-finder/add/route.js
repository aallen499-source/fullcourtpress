import { createClient } from '@/lib/supabase-server';

// POST /api/coach-finder/add  { school, level, sport, name, email }
//
// "Add to roster" from the Coach Finder. Inserted with the athlete's OWN
// session, not the service role, on purpose: the free plan's ten-coach cap
// lives in the insert policy on coaches (supabase/21), and this has to be
// subject to it like every other way of adding a coach. The finder is paid,
// but a grandfathered free account can use it, and their roster cap still
// applies.

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in again.' }, { status: 401 });

  const b = await request.json().catch(() => ({}));
  const school = String(b.school || '').trim();
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim();
  if (!school || !name) return Response.json({ error: 'Missing school or coach.' }, { status: 400 });

  const level = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'].includes(b.level) ? b.level : 'D1';
  const { data, error } = await supabase
    .from('coaches')
    .insert({ user_id: user.id, name, school, level, sport: String(b.sport || '').trim() || null, email: email || null, status: 'not_contacted' })
    .select('id')
    .single();

  if (error) {
    // 42501 is the row-level policy saying no: on the free plan, that is the
    // ten-coach cap. Say that, not "new row violates row-level security".
    if (error.code === '42501') {
      return Response.json({ error: 'Your roster has the ten coaches the free plan holds. The Athlete plan lifts that.', cap: true }, { status: 403 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, id: data.id });
}
