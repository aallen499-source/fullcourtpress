import { createAdminClient } from '@/lib/supabase-admin';
import { sendParentWeekly } from '@/lib/parent-weekly';

// The Sunday parent update. Called every day by /api/cron/daily, which runs
// at 14:00 UTC — 7am Pacific in summer, 6am in winter — and returns a no-op
// on every day but Sunday.
//
// parent_last_sent_at guards against a second run the same weekend sending
// twice. A failure for one family is recorded and the rest carry on.

const SEND_WEEKDAY = 0; // Sunday
const MIN_GAP_MS = 5 * 86400000;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  const now = new Date();
  const forced = new URL(request.url).searchParams.get('force') === '1';
  if (!forced && now.getUTCDay() !== SEND_WEEKDAY) {
    return Response.json({ sent: 0, reason: 'not send day' });
  }

  const admin = createAdminClient();
  const { data: families, error } = await admin
    .from('profiles')
    .select('id, parent_email, parent_confirmed_email, parent_last_sent_at')
    .not('parent_confirmed_email', 'is', null);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sent = 0;
  const skipped = { notConfirmed: 0, alreadySent: 0 };
  const failures = [];
  for (const f of families || []) {
    if (f.parent_confirmed_email !== f.parent_email) {
      skipped.notConfirmed++;
      continue;
    }
    if (f.parent_last_sent_at && now.getTime() - new Date(f.parent_last_sent_at).getTime() < MIN_GAP_MS) {
      skipped.alreadySent++;
      continue;
    }
    try {
      const result = await sendParentWeekly(admin, f.id, now);
      if (!result.sent) {
        skipped.notConfirmed++;
        continue;
      }
      await admin.from('profiles').update({ parent_last_sent_at: now.toISOString() }).eq('id', f.id);
      sent++;
    } catch (e) {
      failures.push({ user: f.id, error: String(e.message || e) });
    }
  }
  return Response.json({ sent, families: families?.length || 0, skipped, failures });
}
