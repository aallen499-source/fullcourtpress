import Link from 'next/link';
import { PLANS } from '@/lib/plans';
import styles from './pricing.module.css';

export const metadata = {
  title: 'Pricing — Full Court Press',
  description:
    'Public pricing for Full Court Press. Start free with no credit card. Paid plans add the verified camp list and unlimited roster and film.',
};

// Pricing lives on its own page, reachable without an account, on purpose —
// nobody should have to sign up to find out what something costs. Reads the
// same PLANS config the in-app Plans tab uses so the two can't drift.
export default function PricingPage() {
  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        <Link className={styles.back} href="/">
          ← Full Court Press
        </Link>

        <h1 className={styles.title}>Simple pricing</h1>
        <p className={styles.lede}>
          Start free, no credit card. Upgrade only if you want the verified camp list and unlimited roster and film.
        </p>

        <div className={styles.grid}>
          {PLANS.map((p) => (
            <div className={`${styles.card}${p.highlight ? ' ' + styles.featured : ''}`} key={p.id}>
              {p.highlight && <div className={styles.flag}>Most popular</div>}
              <div className={styles.name}>{p.name}</div>
              <div className={styles.price}>
                {p.price}
                <span> {p.cadence}</span>
              </div>
              <div className={styles.blurb}>{p.blurb}</div>
              <ul className={styles.feats}>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {/* Everyone starts the same way — an account first, then upgrade
                  from inside the app, so checkout can be matched to a real
                  user. Linking straight to Stripe from here would create a
                  payment with no account attached to it. */}
              <Link className={p.highlight ? styles.ctaGold : styles.ctaGhost} href="/signin?intent=new">
                {p.id === 'free' ? 'Start free' : 'Get started'}
              </Link>
            </div>
          ))}
        </div>

        <p className={styles.foot}>
          Paid plans are billed through Stripe — card details never touch this site. You can cancel or downgrade any
          time from My Info once you&apos;re signed in. Questions?{' '}
          <a href="mailto:info@fullcourtpress.app">info@fullcourtpress.app</a>
        </p>
      </div>
    </main>
  );
}
