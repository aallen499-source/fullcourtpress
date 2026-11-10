import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { canUseFinder } from '@/lib/coach-finder';
import { genderOfText } from '@/lib/list-matches';
import FinderClient from './FinderClient';
import styles from './finder.module.css';

export const metadata = { title: 'Coach Finder — RecruitGrid', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

// The Coach Finder: every coach in a sport, by state and division, with the
// address each school publishes. Paid, with every account from before
// 2026-11-11 grandfathered in (lib/coach-finder.js, supabase/77).
//
// The gate is decided here on the server, and again in /api/coach-finder,
// and again by the table's policy. A page that only hid a button would be
// a page with a free Coach Finder behind the console.
export default async function FinderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin?next=/app/finder');

  const admin = createAdminClient();
  const [{ data: me }, { data: sub }] = await Promise.all([
    admin.from('profiles').select('id, sport, created_at, is_owner').eq('id', user.id).maybeSingle(),
    admin.from('subscriptions').select('status, current_period_end').eq('user_id', user.id).maybeSingle(),
  ]);
  const isPaid = !!sub && sub.status === 'active' && (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
  const allowed = canUseFinder({ isPaid, isOwner: !!me?.is_owner, createdAt: me?.created_at });

  if (!allowed) {
    return (
      <main className={styles.wrap}>
        <div className={styles.inner}>
          <Link className={styles.back} href="/app">← Back to RecruitGrid</Link>
          <h1 className={styles.title}>Coach Finder</h1>
          <p className={styles.lede}>
            Every coach in your sport, by state and division, with the address each school publishes.
            Over 40,000 coaches at 1,200 colleges, each one read from the school&apos;s own staff page
            with the date it was checked.
          </p>
          <div className={styles.gate}>
            <div className={styles.gateTitle}>Part of the Athlete plans</div>
            <p className={styles.gateText}>
              $79 for the year, or $12 a month, cancel any time. The address for any school you add to
              your roster stays free, always.
            </p>
            <div className={styles.gateActions}>
              <Link className={styles.gold} href="/app#plans">See plans</Link>
              <Link className={styles.ghost} href="/pricing">What&apos;s included</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const sport = me?.sport || '';
  return (
    <FinderClient
      defaultSport={sport}
      defaultGender={genderOfText(sport) || ''}
    />
  );
}
