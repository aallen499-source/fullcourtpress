import { createAdminClient } from '@/lib/supabase-admin';
import { setupNudgeEmail } from '@/lib/emails/setup-nudge';
import { ymdIn } from '@/lib/monthly-checklist';

// Two gentle setup reminders, then silence (supabase/63):
//   1. three calendar days after the signup date, if the profile still isn't
//      published — someone who joins on the 14th hears on the 17th
//   2. four weeks after the first (the 17th → the 15th of next month)
// Counted in Pacific calendar days, not hours: the job runs once a day at
// 7am, so an hour count pushed an evening signup a whole extra day.
// Never to coach accounts, anyone who turned off update emails, or anyone
// who has published. Runs from the daily cron.

const TZ = 'America/Los_Angeles';
const FIRST_AFTER_DAYS = 3;
const SECOND_AFTER_DAYS = 28;

// YYYY-MM-DD in Pacific time, plus a number of days. Date strings compare
// correctly as strings.
const dayPlus = (ts, days) => {
  const [y, m, d] = ymdIn(new Date(ts), TZ).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};
const SITE = 'https://recruitgrid.app';

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

export async function GET(request) {
  if (!isAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  const admin = createAdminClient();
  const today = ymdIn(new Date(), TZ);
  const { data: rows, error } = await admin
    .from('profiles')
    .select('id, name, role, created_at, public_published, email_product_updates, unsubscribe_token, setup_nudge1_at, setup_nudge2_at')
    .or('public_published.is.null,public_published.eq.false')
    .is('setup_nudge2_at', null);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const due = [];
  for (const p of rows || []) {
    if (p.role === 'coach' || p.email_product_updates === false) continue;
    if (!p.setup_nudge1_at) {
      if (p.created_at && today >= dayPlus(p.created_at, FIRST_AFTER_DAYS)) due.push({ p, which: 1 });
    } else if (today >= dayPlus(p.setup_nudge1_at, SECOND_AFTER_DAYS)) {
      due.push({ p, which: 2 });
    }
  }
  if (!due.length) return Response.json({ sent: 0, reason: 'nobody due' });

  const emails = await authEmails(admin);
  let sent = 0;
  const failures = [];
  for (const { p, which } of due) {
    const to = emails.get(p.id);
    if (!to) continue;
    const { subject, html } = setupNudgeEmail({
      which,
      firstName: String(p.name || '').trim().split(/\s+/)[0] || '',
      unsubscribeUrl: `${SITE}/unsubscribe?t=${p.unsubscribe_token}&type=updates`,
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
            'List-Unsubscribe': `<${SITE}/api/unsubscribe?t=${p.unsubscribe_token}&type=updates>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
      await admin.from('profiles').update({ [which === 1 ? 'setup_nudge1_at' : 'setup_nudge2_at']: new Date().toISOString() }).eq('id', p.id);
      sent++;
    } catch (e) {
      failures.push({ user: p.id, error: String(e.message || e) });
    }
  }
  return Response.json({ sent, due: due.length, failures });
}
