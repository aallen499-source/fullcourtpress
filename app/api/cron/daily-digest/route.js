import Stripe from 'stripe';
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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@recruitgrid.app';

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'RecruitGrid <notifications@recruitgrid.app>',
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

// How many athletes have reached a stage, counted as people rather than rows.
//
// countWhere answers "how many coaches have been emailed"; this answers "how
// many athletes have emailed one", which is the question that matters. One
// athlete with 28 sent emails is one person, not 28.
//
// Added 2026-10-26 after a hand-run funnel showed 34 accounts, 10 published
// profiles and exactly 1 athlete who had ever emailed a coach. That gap had
// been invisible for two months because nothing reported it, and a reminder to
// go and run the SQL is a worse answer than the number arriving on its own.
async function athletesWhoHave(admin, table, apply = (q) => q) {
  const { data, error } = await apply(admin.from(table).select('user_id'));
  if (error) throw new Error(`${table}: ${error.message}`);
  return new Set((data || []).map((r) => r.user_id)).size;
}

// Payments Stripe took, against subscription rows we actually wrote.
//
// These two numbers have to match. For a month they didn't: the Stripe webhook
// destination still pointed at fullcourtpress.app after the rename, that domain
// 308-redirects, and Stripe does not follow redirects on webhook deliveries. So
// every payment returned 308 ERR and never reached the handler. Nobody was
// provisioned, and nothing anywhere said so — it surfaced only when the first
// paying customer emailed to ask whether her account had been activated.
//
// A payment with no row behind it is the single most expensive failure this
// product has, so it is checked every day and shouted about in the subject line.
//
// Never throws: a Stripe outage must not take the whole digest down with it.
// An error here is reported as unknown rather than as a clean bill of health.
async function paymentReconciliation(admin, sinceIso) {
  if (!process.env.STRIPE_SECRET_KEY) return { error: 'STRIPE_SECRET_KEY unset' };
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sinceUnix = Math.floor(new Date(sinceIso).getTime() / 1000);
    const sessions = await stripe.checkout.sessions.list({
      created: { gte: sinceUnix },
      limit: 100,
      expand: ['data.line_items'],
    });

    // Playbook sales are NOT provisioning failures.
    //
    // The book is a one-off purchase that deliberately writes no subscription
    // row: the buyer usually has no account at all, and the webhook delivers
    // it by email instead. Counting those as checkouts meant the very first
    // book sale raised "someone paid and got nothing", and every future one
    // would have too. An alarm that cries wolf on a normal, healthy sale is
    // worse than no alarm, because the one time it is real it gets ignored.
    //
    // Matched on the product name, the same signal the webhook branches on,
    // so the two cannot drift apart.
    const isPlaybook = (x) =>
      (x.line_items?.data || []).some((li) =>
        /playbook/i.test(li.price?.product?.name || li.description || '')
      );

    const complete = sessions.data.filter((x) => x.status === 'complete');
    const paid = complete.filter((x) => !isPlaybook(x));
    const books = complete.length - paid.length;

    // updated_at is touched by upsertSubscription on every webhook write, so
    // this counts provisioning that actually landed — new purchases and
    // renewals alike. It can legitimately exceed the checkout count (a renewal
    // has no new checkout session); what must never happen is the reverse.
    const rowsWritten = await countWhere(admin, 'subscriptions', (q) =>
      q.gte('updated_at', sinceIso)
    );

    return { checkouts: paid.length, rowsWritten, books, missing: Math.max(0, paid.length - rowsWritten) };
  } catch (err) {
    return { error: String(err?.message || err) };
  }
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

    // The funnel, as people rather than rows.
    //
    // Every stage above these already appears in this email; the ones that
    // matter did not, which is how "one athlete has ever emailed a coach"
    // stayed invisible from September to late October.
    const [withCoach, whoEmailed, whoWereOpened] = await Promise.all([
      athletesWhoHave(admin, 'coaches'),
      athletesWhoHave(admin, 'coaches', (q) => q.not('last_emailed_at', 'is', null)),
      athletesWhoHave(admin, 'coaches', (q) => q.not('link_first_opened_at', 'is', null)),
    ]);

    // Coaches saved with no address cannot be written to at all: the send
    // screen disables them. This is the number that explained the whole gap.
    const [coachRows, coachRowsSendable] = await Promise.all([
      countWhere(admin, 'coaches'),
      countWhere(admin, 'coaches', (q) => q.not('email', 'is', null).neq('email', '')),
    ]);
    const unsendable = coachRows - coachRowsSendable;

    const recon = await paymentReconciliation(admin, since(24));

    // Emails the system actually sent, counted from the columns each job stamps
    // only after Resend accepts the send — so these are deliveries, not attempts.
    // Zero is normal on a day with no camps due and no subscriptions expiring;
    // this is a weaker signal than the payment check above, and it covers only
    // the two reminder jobs. See the footnote in the email.
    // The install -> notifications funnel. Two numbers rather than one because
    // a zero at the end is ambiguous on its own: nobody installing and everyone
    // installing but declining notifications need opposite fixes, and push on
    // iOS is impossible without the install, so the first gates the second.
    const [installed, pushSubs] = await Promise.all([
      countWhere(admin, 'profiles', (q) => q.not('installed_at', 'is', null)),
      countWhere(admin, 'push_subscriptions'),
    ]);

    const [campSends, subSends] = await Promise.all([
      countWhere(admin, 'user_camps', (q) => q.gte('reminder_sent_at', since(24))),
      countWhere(admin, 'subscriptions', (q) => q.gte('reminder_sent_at', since(24))),
    ]);

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

    // The subject is the only part read on a phone at a glance, so an
    // unprovisioned payment goes there rather than being buried in a table.
    const alarm = recon.missing > 0
      ? `PAYMENT NOT PROVISIONED (${recon.missing}) — `
      : '';

    const reconRow = recon.error
      ? stat('Payments vs provisioned', 'unknown', escapeHtml(recon.error))
      : stat(
          'Payments vs provisioned',
          `${recon.checkouts} / ${recon.rowsWritten}`,
          recon.missing > 0
            ? 'MISMATCH — someone paid and got nothing; check Stripe webhook deliveries'
            : 'Stripe checkouts / subscription rows written, last 24h'
        );

    await sendEmail(
      ADMIN_EMAIL,
      `${alarm}RecruitGrid — ${day} new ${day === 1 ? 'signup' : 'signups'}, ${total} total`,
      `
        <h2 style="margin:0 0 10px">Daily digest</h2>
        <table style="border-collapse:collapse;font-size:14px">
          ${stat('Signups today', day)}
          ${stat('Signups this week', week)}
          ${stat('Total signups', total)}
          ${stat('Published profiles', published, 'filled in details and hit publish')}
          ${stat('Published film lockers', filmPublished)}
          ${stat('Paying', paid)}
          ${stat('Added a coach', withCoach, 'athletes with at least one school on their roster')}
          ${stat('Emailed a coach', whoEmailed, whoEmailed <= 1
            ? 'THE WALL — everything upstream works and stops here'
            : 'athletes who have sent at least one')}
          ${stat('A coach opened it', whoWereOpened, 'profile link opened by a coach they wrote to')}
          ${stat('Coaches with no address', `${unsendable} of ${coachRows}`,
            unsendable > 0 ? 'cannot be emailed — the send screen disables them' : 'all sendable')}
          ${reconRow}
          ${recon.error ? '' : stat('Playbook sold', recon.books ?? 0, 'one-off book sales, last 24h')}
          ${stat('Reminder emails sent', campSends + subSends, 'camp + subscription reminders, last 24h')}
          ${stat('Opened as installed app', installed, 'added to a home screen and opened from it')}
          ${stat('Push subscriptions', pushSubs, 'browsers signed up for camp notifications')}
        </table>
        <h3 style="margin:22px 0 6px">Plans</h3>
        ${planRows}
        ${pendingBlock}
        <p style="color:#888;font-size:12px;margin-top:24px">
          Signups count people who completed sign-in. Someone who requested a magic
          link but never clicked it appears in Supabase Auth but not here.
          <br><br>
          "Payments vs provisioned" compares completed Stripe checkouts against
          subscription rows written in the same window. Playbook sales are left
          out of both sides: the book writes no subscription row by design, and
          counting it flagged the first sale as a failed payment. The right
          number may be higher (renewals write a row without a new checkout);
          it must never be lower. If it is, a payment did not reach the webhook
          — check Stripe → Developers → Webhooks → Event deliveries.
          <br><br>
          "Emailed a coach" counts athletes, not emails — one athlete with 28 sent
          is one person. It is the stage everything else feeds, and on
          2026-10-26 it was 1 out of 34 accounts while 10 had published a
          profile. "Coaches with no address" is why: the send screen disables
          any coach without an email, so a roster built without addresses
          cannot be written to at all.
          <br><br>
          "Reminder emails sent" counts only the camp and subscription reminder
          jobs, which stamp a column after Resend accepts each send. Zero is
          normal on a day with nothing due. The newsletter, this digest, and
          payment confirmations are not counted.
          <br><br>
          "Opened as installed app" counts people, "Push subscriptions" counts
          browsers, so the second can exceed the first when someone installs on
          a phone and a laptop. Read them together: installs near zero means the
          prompt is not landing, while installs without subscriptions means the
          notification toggle is being seen and declined.
        </p>
      `
    );

    return new Response(
      JSON.stringify({
        total,
        week,
        day,
        published,
        paid,
        recon,
        emailsSent: campSends + subSends,
        installed,
        pushSubs,
        pending: pending?.length || 0,
        emailed: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(`Digest failed: ${err.message}`, { status: 500 });
  }
}
