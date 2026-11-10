import { createClient } from '@/lib/supabase-server';
import { staffDirectoryFor } from '@/lib/staff-directory';
import { sportOf } from '@/lib/staff-page-parser';
import { chooseSuggestion } from '@/lib/coach-suggest';

// GET /api/coach-suggest?school=&level=&sport=&gender=
//
// The suggestion under the add-coach form's email field. Signed-in only:
// coach_contacts is readable by authenticated users (supabase/75) and this
// runs with the athlete's own session, so RLS does the gating, not us.
//
// School matching is NOT done here. staffDirectoryFor() is the resolver the
// rest of the app already trusts for the staff-page link; it turns whatever
// the athlete typed ("University of Arkansas at Monticello") into the
// directory URL ("https://www.uamsports.com/staff-directory"), and that URL
// is exactly what coach_contacts.source_url holds. Matching on it means the
// suggestion and the staff-page link can never disagree about which school
// this is.

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in again.' }, { status: 401 });

  const q = new URL(request.url).searchParams;
  const school = (q.get('school') || '').trim();
  const level = (q.get('level') || '').trim();
  const sport = (q.get('sport') || '').trim();
  const gender = ['men', 'women'].includes(q.get('gender')) ? q.get('gender') : '';
  if (!school) return Response.json({ reason: 'no-school', best: null });

  const url = staffDirectoryFor(school, { level });
  if (!url) return Response.json({ reason: 'no-directory', best: null });

  const key = sportOf(sport);
  if (!key) return Response.json({ reason: 'no-sport', url, best: null });

  const { data, error } = await supabase
    .from('coach_contacts')
    .select('name, title, email, kind, rank, gender, heading, checked_at')
    .eq('source_url', url)
    .eq('sport', key)
    .limit(200);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const picked = chooseSuggestion(data || [], { gender });
  return Response.json(
    { reason: picked.best ? 'ok' : picked.unlisted.length ? 'unlisted' : 'none', url, sport: key, ...picked },
    { headers: { 'Cache-Control': 'private, max-age=300' } }
  );
}
