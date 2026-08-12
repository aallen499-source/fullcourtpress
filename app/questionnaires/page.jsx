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

  // FAQPage schema. These are the questions families actually type, and the
  // answers are the ones a knowledgeable parent would give — including the
  // unflattering parts. An answer box only helps if it's true.
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      [
        'What is a college recruiting questionnaire?',
        'A short form on a college athletic program’s own website where a prospective athlete submits their name, graduation year, position, school, academics and highlight film. Completing one is how most programs create a file on an athlete, so it is usually the first real step in getting recruited.',
      ],
      [
        'Does filling out a recruiting questionnaire mean a coach will contact me?',
        'No. It puts your information in the program’s recruiting system; it is not an offer and not a guarantee of contact. Most families follow up with a short personal email to the coaching staff that includes a highlight link and an upcoming schedule.',
      ],
      [
        'When should an athlete start filling out questionnaires?',
        'Freshman and sophomore year is not too early. NCAA rules limit when coaches may respond, but there is no rule against an athlete submitting information, and being in a program’s system early means you are already there when contact opens.',
      ],
      [
        'Are recruiting questionnaires free?',
        'Yes. Every questionnaire linked here is a free form hosted by the college itself. RecruitGrid does not charge to view or use them, and does not sit between an athlete and a program.',
      ],
      [
        'Do I have to be a Division I athlete for this to be worth doing?',
        'No, and most college athletes are not D1. The majority of programs in this directory are D2, D3, NAIA and JUCO, which is where the large majority of roster spots and a great deal of athletic and academic aid actually are.',
      ],
    ].map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
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

      {/* Rendered, not just structured data. Google requires FAQ schema to
          describe content a visitor can actually read — marking up invisible
          text is a violation, not a shortcut. */}
      <section style={{ marginTop: 34 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 14 }}>
          Common questions
        </h2>
        {faq.mainEntity.map((q) => (
          <div key={q.name} style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>{q.name}</h3>
            <p style={{ color: 'var(--sub)', lineHeight: 1.6, fontSize: 14, margin: 0 }}>
              {q.acceptedAnswer.text}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
