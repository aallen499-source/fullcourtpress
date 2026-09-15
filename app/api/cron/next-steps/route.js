import { createAdminClient } from '@/lib/supabase-admin';
import { nextStepEmail } from '@/lib/emails/next-step';
import { sendEmail, PARENT_TZ } from '@/lib/parent-weekly';
import { ymdIn } from '@/lib/monthly-checklist';
import { sendPushToUser } from '@/lib/push';
import { coachLastName } from '@/lib/default-templates';

// Emails the athlete on the morning a coach's next step comes due (see
// supabase/59). Run by the daily cron at 14:00 UTC — 7am Pacific.
//
// Sweeps everything due today or earlier that hasn't been reminded, rather
// than exactly today, so a missed run still sends. next_step_reminded_at is
// what stops repeats; changing the date clears it. Uses the reminder switch
// (email_reminders): camp reminders and next steps are both reminders the
// athlete set up themselves.

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  const admin = createAdminClient();
  const today = ymdIn(new Date(), PARENT_TZ);
  const { data: due, error } = await admin
    .from('coaches')
    .select('id, user_id, name, school, next_step_on, next_step_note')
    .lte('next_step_on', today)
    .is('next_step_reminded_at', null);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!due?.length) return Response.json({ sent: 0, reason: 'nothing due' });

  const byUser = new Map();
  for (const c of due) {
    if (!byUser.has(c.user_id)) byUser.set(c.user_id, []);
    byUser.get(c.user_id).push(c);
  }

  let sent = 0;
  const skipped = { remindersOff: 0, noEmail: 0 };
  const failures = [];
  for (const [userId, steps] of byUser) {
    const { data: profile } = await admin
      .from('profiles')
      .select('name, email_reminders, unsubscribe_token')
      .eq('id', userId)
      .maybeSingle();
    const stamp = () =>
      admin.from('coaches').update({ next_step_reminded_at: new Date().toISOString() }).in('id', steps.map((s) => s.id));
    if (profile?.email_reminders === false) {
      skipped.remindersOff++;
      await stamp();
      continue;
    }
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    const to = authUser?.user?.email;
    if (!to) {
      skipped.noEmail++;
      continue;
    }
    const items = steps.map((c) => {
      const surname = coachLastName(c.name);
      return {
        coachId: c.id,
        coachLabel: surname && c.name !== 'Coaching Staff' ? `Coach ${surname}` : 'the coaching staff',
        school: c.school || '',
        note: c.next_step_note || '',
        late: c.next_step_on < today,
      };
    });
    const { subject, html } = nextStepEmail({
      firstName: String(profile?.name || '').trim().split(/\s+/)[0] || '',
      steps: items,
      unsubscribeUrl: `https://recruitgrid.app/unsubscribe?t=${profile?.unsubscribe_token}`,
    });
    try {
      await sendEmail({
        to,
        subject,
        html,
        headers: {
          'List-Unsubscribe': `<https://recruitgrid.app/api/unsubscribe?t=${profile?.unsubscribe_token}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });
      await stamp();
      sent++;
      try {
        await sendPushToUser(admin, userId, {
          title: items.length === 1 ? `Today: ${items[0].note || 'recruiting next step'}` : `${items.length} next steps due today`,
          body: items.map((i) => i.school).filter(Boolean).join(', '),
          url: '/app',
          tag: `next-steps-${today}`,
        });
      } catch {
        // The email went; a failed notification is not worth a retry.
      }
    } catch (e) {
      failures.push({ user: userId, error: String(e.message || e) });
    }
  }
  return Response.json({ sent, athletes: byUser.size, skipped, failures });
}
