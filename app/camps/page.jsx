import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { STATE_NAMES, SPORT_LABELS, slugify, campIndex, WINDOW_DAYS } from '@/lib/camp-directory';

export const revalidate = 3600;

export const metadata = {
  title: 'College Camps & Prospect Days by State and Sport — RecruitGrid',
  description:
    'Verified college camps and prospect days by sport and state — basketball, softball, baseball, volleyball, tennis and more. Dates, cost, eligibility and registration links.',
  alternates: { canonical: 'https://recruitgrid.app/camps' },
};

export default async function CampIndexPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const index = await campIndex(supabase);
  const sports = Object.keys(index).sort((a, b) =>
    (SPORT_LABELS[a] || a).localeCompare(SPORT_LABELS[b] || b)
  );

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.9rem', lineHeight: 1.1, marginBottom: 10 }}>
        College Camps &amp; Prospect Days
      </h1>
      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 24 }}>
        Verified college camps by sport and state — dates, cost, eligibility and a direct registration link for
        each. Every camp is checked by hand against the school&apos;s own page. Each state page shows the next{' '}
        {WINDOW_DAYS} days; the full season calendar lives in the app.
      </p>

      {sports.map((sport) => (
        <section key={sport} style={{ marginBottom: 26 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: 6 }}>
            {SPORT_LABELS[sport] || sport}
          </h2>
          <p style={{ lineHeight: 2 }}>
            {index[sport].map((s, i) => (
              <span key={s.state}>
                {i > 0 && ' · '}
                <Link href={`/camps/${sport}/${slugify(STATE_NAMES[s.state])}`}>{STATE_NAMES[s.state]}</Link>{' '}
                <span style={{ color: 'var(--sub)', fontSize: 12.5 }}>({s.count})</span>
              </span>
            ))}
          </p>
        </section>
      ))}

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', marginTop: 10 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 6 }}>
          Track the camps you&apos;re going to
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 12, fontSize: 14 }}>
          RecruitGrid keeps the full verified calendar, reminds you a week before a camp you registered for, and
          tracks every coach you contact alongside it. Free to start.
        </p>
        <Link className="btn gold" href="/app" style={{ textDecoration: 'none' }}>Start free →</Link>
      </div>
    </main>
  );
}
