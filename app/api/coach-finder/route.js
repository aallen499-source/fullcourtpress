import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { sportOf } from '@/lib/staff-page-parser';
import { canUseFinder, buildResults } from '@/lib/coach-finder';

// GET /api/coach-finder?sport=&gender=&states=WA,OR&divisions=D1,D2
//
// Every coach in a sport with a published address, one row per school,
// filtered by state and division. The paid half of coach_contacts.
//
// Entitlement is checked HERE with the service role, and the table's own
// policy (supabase/77) checks it again for direct reads. Belt and braces,
// because this is the one place a free account has a reason to try the
// console. Accounts from before 2026-11-11 pass: they were promised the
// free plan covered everything, and for them it does.

export const maxDuration = 30;
const PAGE = 1000; // PostgREST's per-request ceiling; larger limits are silently cut

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in again.' }, { status: 401 });

  const admin = createAdminClient();
  const [{ data: me }, { data: sub }] = await Promise.all([
    admin.from('profiles').select('id, created_at, is_owner').eq('id', user.id).maybeSingle(),
    admin.from('subscriptions').select('status, current_period_end').eq('user_id', user.id).maybeSingle(),
  ]);
  const isPaid = !!sub && sub.status === 'active' && (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
  if (!canUseFinder({ isPaid, isOwner: !!me?.is_owner, createdAt: me?.created_at })) {
    return Response.json({ error: 'Coach Finder is part of the Athlete plans.', upgrade: true }, { status: 402 });
  }

  const q = new URL(request.url).searchParams;
  const key = sportOf(q.get('sport') || '');
  if (!key) return Response.json({ error: 'Pick a sport.' }, { status: 400 });
  const gender = ['men', 'women'].includes(q.get('gender')) ? q.get('gender') : '';
  const csv = (name) => (q.get(name) || '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  const states = csv('states');
  const divisions = csv('divisions');

  const rows = [];
  let truncated = false;
  for (let from = 0; from < 8 * PAGE; from += PAGE) {
    let query = admin
      .from('coach_contacts')
      .select('school, state, assoc, sport, source_url, name, title, email, kind, rank, gender, checked_at')
      .eq('sport', key)
      .not('email', 'is', null)
      .order('school')
      .range(from, from + PAGE - 1);
    if (states.length) query = query.in('state', states);
    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    rows.push(...(data || []));
    if ((data || []).length < PAGE) break;
    if (from + PAGE >= 8 * PAGE) truncated = true;
  }

  const results = buildResults(rows, { gender, divisions, states });
  return Response.json(
    { sport: key, gender, states, divisions, count: results.length, truncated, results },
    { headers: { 'Cache-Control': 'private, max-age=120' } }
  );
}
