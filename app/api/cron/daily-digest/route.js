import { createAdminClient } from '@/lib/supabase-admin';

// One daily email covering how the product is doing and anything waiting on
// Angela. This replaces the standalone pending-submissions job — two separate
// cron emails a day is how they start getting ignored.
//
// Vercel Cron calls this with an Authorization header matching CRON_SECRET.
function isAuthorized(request) {
  // Fail closed. Interpolating an unset CRON_SECRET produced the literal
  // string "Bearer undefined", which anyone could send to authenticate — so a
  // missing env var silently opened the endpoint instead of closing it.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
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

// head:true asks Postgres for the count without shipping the rows back.
async function countWhere(admin, table, apply = (q) => q) {
  const { count, error } = await apply(admin.from(table).select('*', { count: 'exact', head: true }));
  if (error) throw new Error(`${table}: ${error.message}`);
  return count ?? 0;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const admin = createAdminClient();
  const since = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString();

  try {
    const [total, week, day, published, filmPublished] = await Promise.all([
      countWhere(admin, 'profiles'),
      countWhere(admin, 'profiles', (q) => q.gte('created_at', since(24 * 7))),
      countWhere(admin, 'profiles', (q) => q.gte('created_at', since(24))),
      countWhere(admin, 'profiles', (q) => q.eq('public_published', true)),
      countWhere(admin, 'profiles', (q) => q.eq('film_published', true)),
    ]);

    // Plan mix. Anyone without an active subscription row is on Free.
    const { data: subs, error: subErr } = await admin
      .from('subscriptions')
      .select('plan, status')
      .eq('status', 'active');
    if (subErr) throw new Error(`subscriptions: ${subErr.message}`);
    const planMix = {};
    for (const s of subs || []) planMix[s.plan || 'unknown'] = (planMix[s.plan || 'unknown'] || 0) + 1;
    const paid = (subs || []).length;

    const { data: pending, error: pendErr } = await admin
      .from('school_submissions')
      .select('name, division, state, conference, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (pendErr) throw new Error(`school_submissions: ${pendErr.message}`);

    const stat = (label, value, note = '') =>
      `<tr><td style="padding:5px 14px 5px 0;color:#555">${label}</td>
        <td style="padding:5px 0;font-weight:700;font-size:16px">${value}</td>
        <td style="padding:5px 0 5px 10px;color:#888;font-size:12px">${note}</td></tr>`;

    const planRows =
      Object.keys(planMix).length === 0
        ? '<p style="color:#888">No active paid plans yet.</p>'
        : `<ul>${Object.entries(planMix)
            .map(([p, n]) => `<li>${escapeHtml(p)}: <b>${n}</b></li>`)
            .join('')}</ul>`;

    const pendingBlock =
      !pending || pending.length === 0
        ? ''
        : `<h3 style="margin:22px 0 6px">${pending.length} school suggestion${
            pending.length === 1 ? '' : 's'
          } waiting</h3>
           <ul>${pending
             .map((s) => {
               const where = [s.state, s.conference].filter(Boolean).map(escapeHtml).join(' · ');
               const age = Math.floor((Date.now() - new Date(s.created_at).getTime()) / 86400000);
               return `<li><b>${escapeHtml(s.name)}</b> — ${escapeHtml(s.division)}${
                 where ? ` (${where})` : ''
               } <span style="color:#888">· ${age === 0 ? 'today' : `${age}d ago`}</span></li>`;
             })
             .join('')}</ul>
           <p style="color:#555;font-size:13px">Approve in Supabase → Table Editor →
           <code>school_submissions</code> → set <code>status</code> to <code>approved</code>.</p>`;

    await sendEmail(
      ADMIN_EMAIL,
      `Full Court Press — ${day} new ${day === 1 ? 'signup' : 'signups'}, ${total} total`,
      `
        <h2 style="margin:0 0 10px">Daily digest</h2>
        <table style="border-collapse:collapse;font-size:14px">
          ${stat('Signups today', day)}
          ${stat('Signups this week', week)}
          ${stat('Total signups', total)}
          ${stat('Published profiles', published, 'filled in details and hit publish')}
          ${stat('Published film lockers', filmPublished)}
          ${stat('Paying', paid)}
        </table>
        <h3 style="margin:22px 0 6px">Plans</h3>
        ${planRows}
        ${pendingBlock}
        <p style="color:#888;font-size:12px;margin-top:24px">
          Signups count people who completed sign-in. Someone who requested a magic
          link but never clicked it appears in Supabase Auth but not here.
        </p>
      `
    );

    return new Response(
      JSON.stringify({ total, week, day, published, paid, pending: pending?.length || 0, emailed: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(`Digest failed: ${err.message}`, { status: 500 });
  }
}
