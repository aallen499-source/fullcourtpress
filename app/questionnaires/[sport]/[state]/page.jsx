import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  STATE_NAMES,
  slugify,
  stateSlugToCode,
  getAllQuestionnaires,
  directoryIndex,
  rowsFor,
  teamLabel,
} from '@/lib/questionnaire-directory';

// Public, indexable, and revalidated rather than static: approving a
// submission should show up here without a redeploy.
export const revalidate = 3600;

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
}

async function load(sportSlug, stateSlug) {
  const code = stateSlugToCode(stateSlug);
  if (!code) return null;
  const all = await getAllQuestionnaires(publicClient());
  const rows = rowsFor(all, sportSlug, code);
  if (!rows.length) return null;
  const sport = rows[0][4];
  return { code, rows, sport, index: directoryIndex(all) };
}

export async function generateMetadata({ params }) {
  const { sport: sportSlug, state: stateSlug } = await params;
  const data = await load(sportSlug, stateSlug);
  if (!data) return { title: 'Questionnaires not found — RecruitGrid' };
  const stateName = STATE_NAMES[data.code];
  const title = `${stateName} ${data.sport} Recruiting Questionnaires (${data.rows.length} Colleges)`;
  return {
    title: `${title} — RecruitGrid`,
    description: `Direct links to the recruiting questionnaire for ${data.rows.length} ${stateName} college ${data.sport.toLowerCase()} programs — D1, D2, D3, NAIA and JUCO. Free, verified, and updated each season.`,
    alternates: { canonical: `https://recruitgrid.app/questionnaires/${sportSlug}/${stateSlug}` },
    openGraph: {
      title: `${title} — RecruitGrid`,
      url: `https://recruitgrid.app/questionnaires/${sportSlug}/${stateSlug}`,
    },
  };
}

export default async function StateSportQuestionnaires({ params }) {
  const { sport: sportSlug, state: stateSlug } = await params;
  const data = await load(sportSlug, stateSlug);
  if (!data) notFound();
  const { code, rows, sport, index } = data;
  const stateName = STATE_NAMES[code];
  const others = (index[sport] || []).filter((s) => s.state !== code);

  // ItemList rather than Event — these are links to forms, not dated things.
  // It gives AI answers and crawlers an unambiguous read of "which schools,
  // in what order, pointing where" instead of inferring it from the markup.
  const pageUrl = `https://recruitgrid.app/questionnaires/${sportSlug}/${stateSlug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Recruiting questionnaires', item: 'https://recruitgrid.app/questionnaires' },
          { '@type': 'ListItem', position: 2, name: `${stateName} ${sport}`, item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${stateName} ${sport} recruiting questionnaires`,
        numberOfItems: rows.length,
        itemListElement: rows.map(([school, , level, , , url], i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${school}${level ? ` (${level})` : ''}`,
          url,
        })),
      },
    ],
  };

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 18 }}>
        <Link href="/questionnaires">Recruiting questionnaires</Link> · {stateName}
      </nav>

      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.9rem', lineHeight: 1.1, marginBottom: 10 }}>
        {stateName} {sport} Recruiting Questionnaires
      </h1>

      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 18 }}>
        Direct links to the official recruiting questionnaire for{' '}
        <b>{rows.length} {stateName} college {sport.toLowerCase()} programs</b>. Filling one out is how most
        programs add you to their recruiting database — it is usually the first step, and it is free.
        Every link below goes to the school&apos;s own form, not a third-party service.
      </p>

      <div style={{ display: 'grid', gap: 0, borderTop: '1px solid var(--line)', marginBottom: 26 }}>
        {rows.map(([school, , level, gender, , url]) => (
          <div
            key={url}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{school}</div>
              <div style={{ fontSize: 12.5, color: 'var(--sub)' }}>
                {[level, teamLabel(gender)].filter(Boolean).join(' · ')}
              </div>
            </div>
            <a
              className="btn ghost small"
              style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
              href={url}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Open form ↗
            </a>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', marginBottom: 26 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 6 }}>
          Keep track of which ones you&apos;ve sent
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 12, fontSize: 14 }}>
          Filling out twenty questionnaires is easy to lose track of. RecruitGrid remembers which schools
          you&apos;ve submitted to, stores your answers once so you can paste them into any form, and tracks
          every coach you contact. Free to start.
        </p>
        <Link className="btn gold" href="/app" style={{ textDecoration: 'none' }}>
          Start free →
        </Link>
      </div>

      {others.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            {sport} questionnaires in other states
          </h2>
          <p style={{ lineHeight: 2 }}>
            {others.map((s, i) => (
              <span key={s.state}>
                {i > 0 && ' · '}
                <Link href={`/questionnaires/${sportSlug}/${slugify(STATE_NAMES[s.state])}`}>
                  {STATE_NAMES[s.state]}
                </Link>
              </span>
            ))}
          </p>
        </>
      )}

      <p style={{ marginTop: 30, fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.6 }}>
        Links are checked by hand and updated each season. Programs occasionally move or retire a form —
        if one is broken, email <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a> and it gets fixed.
        Submitting a questionnaire puts your information in a program&apos;s system; it is not an offer or a
        guarantee of contact.
      </p>
    </main>
  );
}
