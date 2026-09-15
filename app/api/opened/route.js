import { createAdminClient } from '@/lib/supabase-admin';
import { sendPushToUser } from '@/lib/push';
import { coachLastName } from '@/lib/default-templates';
import { openAlertEmail } from '@/lib/emails/open-alert';
import { sendEmail } from '@/lib/parent-weekly';

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
    .select('*')
    .eq('public_slug', slug)
    .eq('public_published', true)
    .maybeSingle();
  if (!profile) return done();

  // The code must belong to a coach on THIS athlete's roster, so a code copied
  // onto another athlete's link does nothing.
  const { data: coach } = await admin
    .from('coaches')
    .select('id, name, school, status, status_changed_at, last_emailed_at, link_last_opened_at, link_open_count')
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

    // And an email, for the many athletes who never turned notifications on.
    // Same once-a-day rule as the push. email_open_alerts is undefined until
    // migration 56 runs, which counts as on.
    if (profile.email_open_alerts !== false) {
      try {
        // The auth record, not profiles.login_email, which can be empty for
        // accounts that haven't signed in since it was added.
        const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
        const to = authUser?.user?.email || profile.login_email;
        if (!to) throw new Error('no email on the account');
        const surname = coachLastName(coach.name);
        const lastContact = [coach.last_emailed_at, coach.status && coach.status !== 'not_contacted' ? coach.status_changed_at : null]
          .filter(Boolean)
          .sort()
          .pop();
        const { subject, html } = openAlertEmail({
          firstName: String(profile.name || '').trim().split(/\s+/)[0] || '',
          coachLabel: surname ? `Coach ${surname}` : 'A coach',
          school: coach.school || '',
          openCount: (coach.link_open_count || 0) + 1,
          lastEmailed: lastContact
            ? new Date(lastContact).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })
            : '',
          coachId: coach.id,
          unsubscribeUrl: `https://recruitgrid.app/unsubscribe?t=${profile.unsubscribe_token}&type=opens`,
        });
        await sendEmail({
          to,
          subject,
          html,
          headers: {
            'List-Unsubscribe': `<https://recruitgrid.app/api/unsubscribe?t=${profile.unsubscribe_token}&type=opens>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });
      } catch (err) {
        console.error('opened: alert email failed:', err?.message || err);
      }
    }
  }

  return done();
}
