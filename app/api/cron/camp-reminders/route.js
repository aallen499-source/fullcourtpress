import { createAdminClient } from '@/lib/supabase-admin';
import { campReminderEmail } from '@/lib/emails/camp-reminder';

// Vercel Cron calls this daily (see vercel.json) with an Authorization header
// matching CRON_SECRET, so nobody else can trigger a send.
function isAuthorized(request) {
  // Fail closed — same reasoning as subscription-reminders: interpolating an
  // unset CRON_SECRET yields the literal "Bearer undefined", which anyone
  // could send, so a missing env var would open the endpoint rather than
  // close it.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

const SITE = 'https://recruitgrid.app';
const WINDOW_DAYS = 7;

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date();
  const horizon = new Date(today.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // Camps happening between today and the horizon. Sweeping the whole window
  // rather than "exactly 7 days out" means a skipped cron run doesn't silently
  // drop a reminder — reminder_sent_at is what prevents duplicates, so a wider
  // net is safe.
  const { data: camps, error: campErr } = await admin
    .from('camps')
    .select('id, school, camp_name, date, city, state, division, cost, source_url')
    .gte('date', ymd(today))
    .lte('date', ymd(horizon));

  if (campErr) {
    return Response.json({ error: campErr.message }, { status: 500 });
  }
  if (!camps?.length) {
    return Response.json({ sent: 0, reason: 'no camps in window' });
  }

  const campById = new Map(camps.map((c) => [c.id, c]));

  // Only camps the athlete actually registered for. "considering" is a
  // shortlist, and emailing about everything someone bookmarked is how a
  // useful reminder turns into noise people mute.
  //
  // camp_id is null for camps a user typed in themselves; those store dates as
  // free text ("August 8-10"), which there is no honest way to count down from.
  const { data: userCamps, error: ucErr } = await admin
    .from('user_camps')
    .select('id, user_id, camp_id')
    .eq('status', 'registered')
    .is('reminder_sent_at', null)
    .in('camp_id', [...campById.keys()]);

  if (ucErr) {
    return Response.json({ error: ucErr.message }, { status: 500 });
  }
  if (!userCamps?.length) {
    return Response.json({ sent: 0, reason: 'nothing due' });
  }

  const { data: profiles, error: pErr } = await admin
    .from('profiles')
    .select('id, name, login_email, email_reminders, unsubscribe_token')
    .in('id', [...new Set(userCamps.map((u) => u.user_id))]);

  if (pErr) {
    return Response.json({ error: pErr.message }, { status: 500 });
  }
  const profileById = new Map((profiles || []).map((p) => [p.id, p]));

  let sent = 0;
  const skipped = { optedOut: 0, noEmail: 0 };
  const failures = [];

  for (const uc of userCamps) {
    const profile = profileById.get(uc.user_id);
    const camp = campById.get(uc.camp_id);
    if (!profile || !camp) continue;
    if (profile.email_reminders === false) {
      skipped.optedOut++;
      continue;
    }
    if (!profile.login_email) {
      skipped.noEmail++;
      continue;
    }

    // Both dates floored to UTC midnight; comparing a plain camp date against
    // a timestamp would round 7 days down to 6 for most of the day.
    const campDay = new Date(`${camp.date}T00:00:00Z`);
    const todayDay = new Date(`${ymd(today)}T00:00:00Z`);
    const daysAway = Math.round((campDay - todayDay) / (24 * 60 * 60 * 1000));

    const unsubscribeUrl = `${SITE}/unsubscribe?t=${profile.unsubscribe_token}`;
    const { subject, html } = campReminderEmail({
      firstName: (profile.name || '').trim().split(/\s+/)[0] || '',
      camp,
      daysAway,
      unsubscribeUrl,
    });

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'RecruitGrid <notifications@recruitgrid.app>',
          to: profile.login_email,
          subject,
          html,
          // Gmail and Outlook surface a native unsubscribe control from these,
          // and RFC 8058 one-click is what keeps bulk mail out of spam. The
          // POST variant must work without the recipient confirming anything,
          // which is why /api/unsubscribe accepts the token in the query.
          headers: {
            'List-Unsubscribe': `<${SITE}/api/unsubscribe?t=${profile.unsubscribe_token}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);

      // Marked only after Resend accepts it. If the send throws, the row stays
      // unmarked and tomorrow's run retries rather than losing the reminder.
      await admin
        .from('user_camps')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', uc.id);
      sent++;
    } catch (err) {
      // One bad address shouldn't abort everyone else's reminders.
      failures.push({ userCampId: uc.id, error: String(err.message || err) });
    }
  }

  return Response.json({ sent, skipped, failures: failures.slice(0, 10), failureCount: failures.length });
}
