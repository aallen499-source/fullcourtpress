import { createAdminClient } from '@/lib/supabase-admin';
import { firstEmailNudge } from '@/lib/emails/first-email';
import { ymdIn } from '@/lib/monthly-checklist';
import { staffDirectoryFor, staffSearchFor } from '@/lib/staff-directory';
import { chooseFirstEmailTarget, hasContactedAnyone } from '@/lib/first-email-target';

// Two nudges towards the first coach email, then silence (supabase/66):
//   1. two calendar days after the profile was published
//   2. seven days after the first
// Stops for good the moment ANY coach on the roster has been emailed, if the
// account turns off update emails, or after the second one.
//
// This is the gap the 2026-09-23 numbers exposed: publishing is now happening
// (3 of 6 new accounts, against 1 of 21 before the setup wizard) but outreach
// is not — one athlete in the whole database had ever emailed a coach. The
// setup nudges chase people who never published; this one chases the people
// who did and then stopped, which is now the bigger group.
//
// Counted in Pacific calendar days for the same reason as setup-nudges: the
// job runs once a day, so an hours-based count pushes an evening publish a
// whole extra day. Runs from the daily cron.

const TZ = 'America/Los_Angeles';
const FIRST_AFTER_DAYS = 2;
const SECOND_AFTER_DAYS = 7;
const SITE = 'https://recruitgrid.app';

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

// "Coaching Staff" is what the setup wizard names a school nobody is attached
// to yet, so it is a placeholder rather than a person — say "the staff".
const labelFor = (c) => {
  const name = String(c?.name || '').trim();
  if (!name || /^coach(ing)? staff$/i.test(name)) return 'the staff';
  return /^coach\b/i.test(name) ? name : `Coach ${name.split(/\s+/).slice(-1)[0]}`;
};

export async function GET(request) {
  if (!isAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  const admin = createAdminClient();
  const today = ymdIn(new Date(), TZ);

  const { data: rows, error } = await admin
    .from('profiles')
    .select('id, name, role, sport, published_at, email_product_updates, unsubscribe_token, first_email_nudge1_at, first_email_nudge2_at, challenge_started_at, challenge_day, email_challenge')
    .eq('public_published', true)
    .is('first_email_nudge2_at', null);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const candidates = (rows || []).filter((p) => {
    if (p.role === 'coach' || p.email_product_updates === false) return false;
    // Days 3 and 5 of the challenge are this email's job, done better and in
    // order, so nobody gets both (supabase/67).
    if (p.challenge_started_at && p.email_challenge !== false && (p.challenge_day || 0) < 7) return false;
    if (!p.published_at) return false;
    return p.first_email_nudge1_at
      ? today >= dayPlus(p.first_email_nudge1_at, SECOND_AFTER_DAYS)
      : today >= dayPlus(p.published_at, FIRST_AFTER_DAYS);
  });
  if (!candidates.length) return Response.json({ sent: 0, reason: 'nobody due' });

  const { data: coachRows } = await admin
    .from('coaches')
    .select('id, user_id, name, school, level, email, last_emailed_at, status, tier')
    .in('user_id', candidates.map((p) => p.id));

  const byUser = new Map();
  for (const c of coachRows || []) {
    if (!byUser.has(c.user_id)) byUser.set(c.user_id, []);
    byUser.get(c.user_id).push(c);
  }

  const emails = await authEmails(admin);
  let sent = 0;
  let skipped = 0;
  const failures = [];

  for (const p of candidates) {
    const mine = byUser.get(p.id) || [];
    // Anyone who has already written to a coach — through RecruitGrid or by
    // marking a school contacted themselves — is doing the thing. Leave them.
    if (hasContactedAnyone(mine)) {
      skipped++;
      continue;
    }

    // Selection lives in lib/first-email-target.js so it can be tested; see
    // the note there about the bug this shape replaced.
    const { mode: chosen, write: withEmail, stranded } = chooseFirstEmailTarget(mine);
    const noEmail = stranded[0];

    const staffUrlFor = (c) =>
      staffDirectoryFor(c.school || '', { level: c.level }) ||
      staffSearchFor(c.school || '', p.sport) ||
      `${SITE}/app`;

    let mode = chosen;
    let school = '';
    let staffUrl = '';
    let coachId = '';
    let coachLabel = '';
    // A roster is usually part sendable and part not, and until 2026-11-10 one
    // address anywhere on it hid the rest: `withEmail` matched, mode became
    // 'write', and the email never mentioned the schools that could not be
    // written to at all. The family who prompted this had 10 schools and 1
    // address, so the nudge pointed at their single reachable coach and said
    // nothing about the other nine, which the send screen silently disables.
    // Both facts now travel together.
    let strandedCount = 0;
    let strandedSchool = '';
    let strandedUrl = '';
    if (withEmail) {
      mode = 'write';
      school = withEmail.school || '';
      coachId = withEmail.id;
      coachLabel = labelFor(withEmail);
      strandedCount = stranded.length;
      if (noEmail) {
        strandedSchool = noEmail.school || '';
        strandedUrl = staffUrlFor(noEmail);
      }
    } else if (noEmail) {
      mode = 'find';
      school = noEmail.school || '';
      staffUrl = staffUrlFor(noEmail);
      // In 'find' mode the whole email is already about the missing address,
      // so the count is the only thing worth adding: "and 3 others" tells them
      // this is a pattern rather than one gap.
      strandedCount = stranded.length;
    }

    const to = emails.get(p.id);
    if (!to) {
      // Not a bare `continue`. A due email vanishing without a trace is how
      // this job could return sent:0 with an empty failures list and read as
      // complete success — the same shape as a run where nobody was due.
      // Recorded as a failure because that is what it is: we owed somebody an
      // email and did not send it.
      failures.push({ user: p.id, error: 'no address in auth.users: nothing sent' });
      continue;
    }

    const which = p.first_email_nudge1_at ? 2 : 1;
    const { subject, html } = firstEmailNudge({
      which,
      mode,
      firstName: String(p.name || '').trim().split(/\s+/)[0] || '',
      school,
      coachLabel,
      coachId,
      staffUrl,
      strandedCount,
      strandedSchool,
      strandedUrl,
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
      await admin
        .from('profiles')
        .update({ [which === 1 ? 'first_email_nudge1_at' : 'first_email_nudge2_at']: new Date().toISOString() })
        .eq('id', p.id);
      sent++;
    } catch (e) {
      failures.push({ user: p.id, error: String(e.message || e) });
    }
  }

  return Response.json({ sent, due: candidates.length, alreadyWriting: skipped, failures });
}
