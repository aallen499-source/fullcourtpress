import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  STATE_NAMES,
  slugify,
  getAllQuestionnaires,
  directoryIndex,
} from '@/lib/questionnaire-directory';

export const revalidate = 3600;

export const metadata = {
  title: 'College Recruiting Questionnaires by State and Sport — RecruitGrid',
  description:
    'A free directory of official college recruiting questionnaires — basketball, football, soccer, volleyball, softball, tennis and track — organized by state and division. Direct links to each school\'s own form.',
  alternates: { canonical: 'https://recruitgrid.app/questionnaires' },
};

export default async function QuestionnaireIndex() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const all = await getAllQuestionnaires(supabase);
  const index = directoryIndex(all);
  const sports = Object.keys(index).sort();

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.9rem', lineHeight: 1.1, marginBottom: 10 }}>
        College Recruiting Questionnaires
      </h1>
      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 24 }}>
        {all.length} direct links to official college recruiting questionnaires, organized by sport and state.
        Filling one out is how most programs add an athlete to their recruiting database — it is free, and it is
        usually step one. Every link goes to the school&apos;s own form.
      </p>

      {sports.map((sport) => (
        <section key={sport} style={{ marginBottom: 26 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: 6 }}>
            {sport}
          </h2>
          <p style={{ lineHeight: 2 }}>
            {index[sport].map((s, i) => (
              <span key={s.state}>
                {i > 0 && ' · '}
                <Link href={`/questionnaires/${slugify(sport)}/${slugify(STATE_NAMES[s.state])}`}>
                  {STATE_NAMES[s.state]}
                </Link>{' '}
                <span style={{ color: 'var(--sub)', fontSize: 12.5 }}>({s.count})</span>
              </span>
            ))}
          </p>
        </section>
      ))}

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', marginTop: 10 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 6 }}>
          Track what you&apos;ve sent
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 12, fontSize: 14 }}>
          RecruitGrid keeps your answers in one place, remembers which schools you&apos;ve submitted to, and
          tracks every coach you contact — alongside a verified camp list. Free to start.
        </p>
        <Link className="btn gold" href="/app" style={{ textDecoration: 'none' }}>
          Start free →
        </Link>
      </div>
    </main>
  );
}
