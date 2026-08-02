import { createAdminClient } from '@/lib/supabase-admin';

// Athletes can suggest schools missing from College Finder, but approval is
// manual (Supabase Table Editor, flip status to 'approved'). Without this, a
// submission sits as 'pending' until someone happens to open that table — so
// from the athlete's side, suggesting a school looks like it vanished.
//
// Vercel Cron calls this daily with an Authorization header matching
// CRON_SECRET. Same guard as subscription-reminders.
function isAuthorized(request) {
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@fullcourtpress.app';

async function sendEmail(to, subject, html) {
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

function escapeHtml(s) {
  return String(s ?? '').replace(
    /[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]
  );
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const admin = createAdminClient();
  const { data: pending, error } = await admin
    .from('school_submissions')
    .select('name, division, state, conference, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return new Response(`Query failed: ${error.message}`, { status: 500 });
  }

  // Silence is the point — only mail when there's something to act on,
  // otherwise a daily "nothing to do" email trains you to ignore it.
  if (!pending || pending.length === 0) {
    return new Response(JSON.stringify({ pending: 0, emailed: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rows = pending
    .map((s) => {
      const where = [s.state, s.conference].filter(Boolean).map(escapeHtml).join(' · ');
      const age = Math.floor((Date.now() - new Date(s.created_at).getTime()) / 86400000);
      return `<li><b>${escapeHtml(s.name)}</b> — ${escapeHtml(s.division)}${
        where ? ` (${where})` : ''
      } <span style="color:#777">· ${age === 0 ? 'today' : `${age}d ago`}</span></li>`;
    })
    .join('');

  const count = pending.length;
  await sendEmail(
    ADMIN_EMAIL,
    `${count} school suggestion${count === 1 ? '' : 's'} waiting`,
    `
      <p>${count} school suggestion${count === 1 ? ' is' : 's are'} waiting for review.</p>
      <ul>${rows}</ul>
      <p>Approve in Supabase → Table Editor → <code>school_submissions</code> → set
      <code>status</code> to <code>approved</code>. Approved schools appear in every
      athlete's College Finder on their next load — no deploy needed.</p>
    `
  );

  return new Response(JSON.stringify({ pending: count, emailed: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
