import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { wallDraft, stalledDraft, FREE_COACH_LIMIT } from '@/lib/outreach';
import OutreachClient from './OutreachClient';

export const metadata = { title: 'Outreach', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

// Who counts as "worth writing to by hand".
//
// 8 rather than 10 on purpose: catching somebody two coaches short means the
// email is a heads-up instead of an apology for a wall they already hit.
const WALL_MIN = 8;

export default async function OutreachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const admin = createAdminClient();
  const { data: me } = await admin
    .from('profiles').select('id, is_owner').eq('id', user.id).maybeSingle();

  // Signed out is still a flat 404 above: no reason to confirm this page
  // exists to the open internet.
  //
  // Signed in but not the owner is different. The only person who will ever
  // see this is somebody with a working account, and the first time it fired
  // it was the owner herself staring at an unexplained 404 with no way to
  // tell whether the flag was unset, the update had matched no rows or her
  // profile id differed from her auth id. A blank 404 hid all three. It now
  // prints the ids and the exact statement that fixes it.
  if (!me?.is_owner) {
    return (
      <main style={{ minHeight: '100vh', padding: '48px 16px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', lineHeight: 1.65 }}>
          <h1 style={{ fontSize: 22, marginBottom: 12 }}>Not the owner</h1>
          <p style={{ fontSize: 14.5, opacity: 0.8 }}>
            You&apos;re signed in as <b>{user.email}</b>, but this account isn&apos;t flagged as
            the owner, so the outreach lists stay hidden.
          </p>
          <p style={{ fontSize: 14.5, opacity: 0.8 }}>
            Auth id <code>{user.id}</code>
            <br />
            Profile row {me ? <>found, <code>is_owner = {String(me.is_owner)}</code></> : <b>not found for that id</b>}
          </p>
          <p style={{ fontSize: 14.5, opacity: 0.8 }}>Run this in the SQL editor, then reload:</p>
          <pre style={{ fontSize: 13, padding: 14, borderRadius: 8, overflowX: 'auto', background: 'rgba(127,127,127,0.12)' }}>
{`update profiles set is_owner = true
where id = '${user.id}';`}
          </pre>
        </div>
      </main>
    );
  }

  const [{ data: profiles }, { data: coaches }, { data: subs }, { data: sent }] =
    await Promise.all([
      admin.from('profiles').select('id, name, login_email, public_published, created_at, is_owner'),
      admin.from('coaches').select('user_id'),
      admin.from('subscriptions').select('user_id, plan, status, current_period_end, updated_at'),
      admin.from('outreach_sends').select('user_id, kind, sent_at, to_email'),
    ]);

  const coachCount = new Map();
  for (const c of coaches || []) {
    coachCount.set(c.user_id, (coachCount.get(c.user_id) || 0) + 1);
  }
  const activeSub = new Map();
  for (const s of subs || []) if (s.status === 'active') activeSub.set(s.user_id, s);

  const lastSent = new Map();
  for (const s of sent || []) {
    const key = `${s.user_id}|${s.kind}`;
    const prev = lastSent.get(key);
    if (!prev || new Date(s.sent_at) > new Date(prev)) lastSent.set(key, s.sent_at);
  }

  const base = (p, kind) => ({
    id: p.id,
    name: p.name || '',
    email: p.login_email || '',
    coaches: coachCount.get(p.id) || 0,
    published: !!p.public_published,
    signedUp: p.created_at,
    sentAt: lastSent.get(`${p.id}|${kind}`) || null,
  });

  // Free, and has done real work. These are the only people in the product
  // who are actively blocked by the thing they'd be paying to remove.
  const wall = (profiles || [])
    .filter((p) => !p.is_owner)
    .filter((p) => (coachCount.get(p.id) || 0) >= WALL_MIN)
    .filter((p) => !activeSub.has(p.id))
    .map((p) => {
      const row = base(p, 'wall');
      const { subject, body } = wallDraft({ firstName: p.name, coaches: row.coaches });
      return { ...row, kind: 'wall', subject, body, blocked: row.coaches >= FREE_COACH_LIMIT };
    })
    .sort((a, b) => b.coaches - a.coaches);

  // Paid, and never started. Every one of these is a refund waiting to happen.
  const stalled = (profiles || [])
    .filter((p) => !p.is_owner)
    .filter((p) => activeSub.has(p.id))
    .filter((p) => (coachCount.get(p.id) || 0) === 0)
    .map((p) => {
      const sub = activeSub.get(p.id);
      const row = base(p, 'stalled');
      const { subject, body } = stalledDraft({
        firstName: p.name,
        plan: sub?.plan,
        boughtOn: p.created_at,
      });
      return { ...row, kind: 'stalled', subject, body, plan: sub?.plan || '', renews: sub?.current_period_end || null };
    })
    .sort((a, b) => new Date(a.renews || 0) - new Date(b.renews || 0));

  return <OutreachClient wall={wall} stalled={stalled} limit={FREE_COACH_LIMIT} />;
}
