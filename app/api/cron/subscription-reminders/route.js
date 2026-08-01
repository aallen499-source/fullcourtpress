import { createAdminClient } from '@/lib/supabase-admin';

// Vercel Cron calls this on a schedule (see vercel.json) with an
// Authorization header matching CRON_SECRET, so nobody else can trigger it.
function isAuthorized(request) {
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

async function sendReminderEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Full Court Press <notifications@fullcourtpress.app>',
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend API error (${res.status}): ${await res.text()}`);
  }
}

function emailFor(plan, endDate) {
  const formatted = new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isFixedTerm = (plan || '').toLowerCase().includes('season') || (plan || '').toLowerCase().includes('team');

  if (isFixedTerm) {
    return {
      subject: `Your ${plan} access ends ${formatted}`,
      html: `
        <p>Hey — quick heads up that your <b>${plan}</b> access on Full Court Press ends on <b>${formatted}</b>.</p>
        <p>This plan doesn't auto-renew, so once that date passes you'll drop back to the Free plan's limits
        (10 coaches, 2 film links, 32 camps). If you want to keep full access, head to
        <a href="https://fullcourtpress.app/app">fullcourtpress.app/app</a> → Plans to renew.</p>
      `,
    };
  }
  return {
    subject: `Your ${plan || 'Athlete'} plan renews ${formatted}`,
    html: `
      <p>Just a heads up — your <b>${plan || 'Athlete'}</b> plan on Full Court Press will automatically renew on
      <b>${formatted}</b>.</p>
      <p>Nothing to do if that's what you want. If you'd rather cancel or make changes first, head to
      <a href="https://fullcourtpress.app/app">fullcourtpress.app/app</a> → My Info → Manage Billing.</p>
    `,
  };
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: subs, error } = await admin
    .from('subscriptions')
    .select('user_id, plan, status, current_period_end')
    .eq('status', 'active')
    .is('reminder_sent_at', null)
    .not('current_period_end', 'is', null)
    .lte('current_period_end', soon.toISOString())
    .gte('current_period_end', now.toISOString());

  if (error) {
    return new Response(`Query failed: ${error.message}`, { status: 500 });
  }

  const results = [];
  for (const sub of subs || []) {
    try {
      const { data: profile } = await admin.from('profiles').select('login_email').eq('id', sub.user_id).maybeSingle();
      if (!profile?.login_email) {
        results.push({ user_id: sub.user_id, skipped: 'no login_email on file' });
        continue;
      }
      const { subject, html } = emailFor(sub.plan, sub.current_period_end);
      await sendReminderEmail(profile.login_email, subject, html);
      await admin.from('subscriptions').update({ reminder_sent_at: new Date().toISOString() }).eq('user_id', sub.user_id);
      results.push({ user_id: sub.user_id, sent: true });
    } catch (err) {
      results.push({ user_id: sub.user_id, error: err.message });
    }
  }

  return new Response(JSON.stringify({ checked: subs?.length || 0, results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
