import { createAdminClient } from '@/lib/supabase-admin';
import { challengeEmail } from '@/lib/emails/challenge';
import { ymdIn } from '@/lib/monthly-checklist';

// The 7-day challenge, one email a morning (supabase/67).
//
// Day 1 goes the morning after the account is created, then one a day until
// day 7. Each day is sent at most once, and each is checked against what the
// account has actually done so the email can say "already done" instead of
// asking for something that happened last month.
//
// Enrolment is by trigger on profile INSERT, so only accounts created after
// supabase/67 ran are in it — nobody who signed up before is retro-blasted.
// To invite an existing account, set challenge_started_at by hand; the header
// comment in the migration has the statement.
//
// Runs from the daily cron, after the two nudge jobs, which both skip anyone
// mid-challenge so nobody gets two emails about the same task.

const TZ = 'America/Los_Angeles';
const SITE = 'https://recruitgrid.app';
const LAST_DAY = 7;

const dayPlus = (ts, days) => {
  const [y, m, d] = ymdIn(new Date(ts), TZ).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

async function authEmails(admin) {
  const byId = new Map();
  for (let page = 1; page < 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) break;
    for (const u of data?.users || []) if (u.email) byId.set(u.id, u.email);
    if (!data?.users?.length || data.users.length < 1000) break;
  }
  return byId;
}

// What counts as "done" for each day. Deliberately generous: someone who did
// the work outside RecruitGrid and recorded it here should not be nagged.
const isDone = (day, stats) => {
  if (day === 1) return stats.published;
  if (day === 2) return stats.schools >= 10;
  if (day === 3) return stats.addresses >= 3;
  if (day === 4) return stats.questionnaires >= 3;
  if (day === 5) return stats.emailed >= 1;
  if (day === 6) return stats.nextSteps >= 1;
  return false; // day 7 is a summary — there is nothing to have done early
};

export async function GET(request) {
  if (!isAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  const admin = createAdminClient();
  const today = ymdIn(new Date(), TZ);

  const { data: rows, error } = await admin
    .from('profiles')
    .select('id, name, role, public_published, challenge_started_at, challenge_day, email_challenge, unsubscribe_token')
    .not('challenge_started_at', 'is', null)
    .lt('challenge_day', LAST_DAY);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const due = [];
  for (const p of rows || []) {
    if (p.role === 'coach' || p.email_challenge === false) continue;
    const nextDay = (p.challenge_day || 0) + 1;
    // Day N is due N days after the start date, so day 1 lands the morning
    // after signup and nobody gets two days in one morning.
    if (today >= dayPlus(p.challenge_started_at, nextDay)) due.push({ p, day: nextDay });
  }
  if (!due.length) return Response.json({ sent: 0, reason: 'nobody due' });

  const ids = due.map(({ p }) => p.id);
  const [{ data: coachRows }, { data: qRows }] = await Promise.all([
    admin.from('coaches').select('user_id, email, last_emailed_at, status, next_step_on').in('user_id', ids),
    admin.from('questionnaire_submissions').select('user_id').in('user_id', ids),
  ]);

  const statsFor = (id, published) => {
    const mine = (coachRows || []).filter((c) => c.user_id === id);
    return {
      published: !!published,
      schools: mine.length,
      addresses: mine.filter((c) => (c.email || '').trim()).length,
      questionnaires: (qRows || []).filter((q) => q.user_id === id).length,
      emailed: mine.filter((c) => c.last_emailed_at || (c.status && c.status !== 'not_contacted')).length,
      nextSteps: mine.filter((c) => c.next_step_on).length,
    };
  };

  const emails = await authEmails(admin);
  let sent = 0;
  const failures = [];

  for (const { p, day } of due) {
    const to = emails.get(p.id);
    if (!to) continue;
    const stats = statsFor(p.id, p.public_published);
    const { subject, html } = challengeEmail({
      day,
      done: isDone(day, stats),
      firstName: String(p.name || '').trim().split(/\s+/)[0] || '',
      stats,
      unsubscribeUrl: `${SITE}/unsubscribe?t=${p.unsubscribe_token}&type=challenge`,
    });

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Angela at RecruitGrid <notifications@recruitgrid.app>',
          reply_to: 'info@recruitgrid.app',
          to,
          subject,
          html,
          headers: {
            'List-Unsubscribe': `<${SITE}/api/unsubscribe?t=${p.unsubscribe_token}&type=challenge>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
      await admin
        .from('profiles')
        .update({ challenge_day: day, challenge_day_sent_at: new Date().toISOString() })
        .eq('id', p.id);
      sent++;
    } catch (e) {
      failures.push({ user: p.id, day, error: String(e.message || e) });
    }
  }

  return Response.json({ sent, due: due.length, failures });
}
