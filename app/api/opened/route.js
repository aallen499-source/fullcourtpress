import { createAdminClient } from '@/lib/supabase-admin';
import { sendPushToUser } from '@/lib/push';
import { coachLastName } from '@/lib/default-templates';

// Records that the profile link an athlete emailed to one coach was opened.
// See supabase/54-profile-link-opens.sql for the reasoning.
//
// The route always answers 204, valid code or not, so it cannot be used to
// test which codes exist. It never reveals anything about the athlete or the
// coach, and it stores nothing about the visitor.

// Email security scanners (Outlook Safe Links, Mimecast, Proofpoint,
// Barracuda) and chat/link unfurlers open links on a person's behalf. None of
// them is a coach looking at film. The page also has to have been visible for
// four seconds before it reports, which most scanners never reach; this list
// catches the ones that run a real browser.
const NOT_A_PERSON =
  /bot|crawl|spider|slurp|preview|scanner|headless|phantom|python|curl|wget|java\/|go-http|okhttp|axios|node-fetch|microsoft office|ms-office|outlook|safelinks|mimecast|proofpoint|barracuda|facebookexternalhit|slackbot|discordbot|whatsapp|telegrambot|linkedinbot|twitterbot|embedly|google-read-aloud|googleimageproxy/i;

const TOKEN = /^[a-f0-9]{12}$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/;
const MIN_DWELL_MS = 4000;

// Reloads, a coach flicking back to the tab, and two clicks on the same email
// are one look, not three.
const SAME_LOOK_MS = 30 * 60 * 1000;

// One notification per coach per day. Enough to be useful, never a stream.
const NOTIFY_AGAIN_MS = 24 * 60 * 60 * 1000;

export async function POST(request) {
  const done = () => new Response(null, { status: 204 });

  let body;
  try {
    body = await request.json();
  } catch {
    return done();
  }
  const slug = String(body?.slug || '').toLowerCase();
  const token = String(body?.token || '').toLowerCase();
  if (!SLUG.test(slug) || !TOKEN.test(token)) return done();
  if (!(Number(body?.visibleMs) >= MIN_DWELL_MS)) return done();

  const ua = request.headers.get('user-agent') || '';
  if (!ua || NOT_A_PERSON.test(ua)) return done();

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('public_slug', slug)
    .eq('public_published', true)
    .maybeSingle();
  if (!profile) return done();

  // The code must belong to a coach on THIS athlete's roster, so a code copied
  // onto another athlete's link does nothing.
  const { data: coach } = await admin
    .from('coaches')
    .select('id, name, school, link_last_opened_at, link_open_count')
    .eq('user_id', profile.id)
    .eq('link_token', token)
    .maybeSingle();
  if (!coach) return done();

  const now = Date.now();
  const last = coach.link_last_opened_at ? new Date(coach.link_last_opened_at).getTime() : 0;
  if (last && now - last < SAME_LOOK_MS) return done();

  const at = new Date(now).toISOString();
  const { error } = await admin
    .from('coaches')
    .update({
      link_last_opened_at: at,
      link_open_count: (coach.link_open_count || 0) + 1,
      ...(last ? {} : { link_first_opened_at: at }),
    })
    .eq('id', coach.id);
  if (error) {
    console.error('opened: could not record open:', error.message);
    return done();
  }

  if (!last || now - last >= NOTIFY_AGAIN_MS) {
    try {
      const surname = coachLastName(coach.name);
      await sendPushToUser(admin, profile.id, {
        title: surname ? `Coach ${surname} opened your profile` : 'A coach opened your profile',
        body: coach.school ? `From your email to ${coach.school}` : 'From the link in your email',
        url: '/app',
        tag: `opened-${coach.id}`,
      });
    } catch (err) {
      // An open is already recorded; a failed notification must not undo it.
      console.error('opened: push failed:', err?.message || err);
    }
  }

  return done();
}
