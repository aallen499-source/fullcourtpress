import Link from 'next/link';
import ReadNext from '@/app/ReadNext';
import { STATE_NAMES, slugify, teamLabel } from '@/lib/questionnaire-directory';

// /questionnaires/<level>/<sport> — every D3 basketball questionnaire, every
// NAIA soccer one, and so on. Rendered from the same route as the sport/state
// pages; see the dispatch note in page.jsx.
//
// Grouped by state rather than listed flat, for two reasons. A parent reading
// a list of sixty-three colleges wants to know which are near them, and the
// state headings give every one of these pages a natural set of internal links
// down into the sport/state pages that already exist. The cluster links both
// ways instead of each page sitting on its own.

export default function LevelDirectory({ level, sport, sportSlug, rows, index }) {
  const pageUrl = `https://recruitgrid.app/questionnaires/${level.slug}/${sportSlug}`;
  const heading = `${level.code === 'JUCO' ? 'Junior College' : level.code} ${sport} Recruiting Questionnaires`;
  // "Division III college basketball" reads right; "Junior college college
  // basketball" does not, because this level's name already ends in college.
  const programs = `${level.code === 'JUCO' ? 'junior college' : `${level.name} college`} ${sport.toLowerCase()} programs`;

  const byState = new Map();
  for (const row of rows) {
    if (!byState.has(row[1])) byState.set(row[1], []);
    byState.get(row[1]).push(row);
  }
  const states = [...byState.keys()].sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));

  // Other sports at this level, and the same sport at other levels — the two
  // ways somebody lands here and wants something adjacent.
  const sameLevel = (index[level.code] || []).filter((s) => slugify(s.sport) !== sportSlug);
  const otherLevels = Object.keys(index)
    .filter((code) => code !== level.code && index[code].some((s) => slugify(s.sport) === sportSlug))
    .map((code) => ({ code, count: index[code].find((s) => slugify(s.sport) === sportSlug).count }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Recruiting questionnaires', item: 'https://recruitgrid.app/questionnaires' },
          { '@type': 'ListItem', position: 2, name: `${level.name} ${sport}`, item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${level.name} ${sport.toLowerCase()} recruiting questionnaires`,
        numberOfItems: rows.length,
        itemListElement: rows.map(([school, state, , , , url], i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${school}${STATE_NAMES[state] ? ` (${STATE_NAMES[state]})` : ''}`,
          url,
        })),
      },
    ],
  };

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 18 }}>
        <Link href="/questionnaires">Recruiting questionnaires</Link> · {level.name}
      </nav>

      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.9rem', lineHeight: 1.1, marginBottom: 10 }}>
        {heading}
      </h1>

      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 14 }}>
        Direct links to the official recruiting questionnaire for{' '}
        <b>{rows.length} {programs}</b> across {states.length}{' '}
        {states.length === 1 ? 'state' : 'states'}. Every link goes to the school&apos;s own form — filling one
        out is how a program adds an athlete to its recruiting database, and it is free.
      </p>

      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 22 }}>
        <b>What {level.code === 'JUCO' ? 'junior college' : level.name} means:</b> {level.blurb}
      </p>

      {states.map((code) => (
        <section key={code} style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 4 }}>
            <Link href={`/questionnaires/${sportSlug}/${slugify(STATE_NAMES[code])}`} style={{ color: 'inherit' }}>
              {STATE_NAMES[code]}
            </Link>
          </h2>
          <div style={{ display: 'grid', gap: 0, borderTop: '1px solid var(--line)' }}>
            {byState.get(code).map(([school, , , gender, , url]) => (
              <div
                key={`${school}-${url}-${gender}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--line)' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    <Link href={`/questionnaires/school/${slugify(school)}`} style={{ color: 'inherit' }}>
                      {school}
                    </Link>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--sub)' }}>{teamLabel(gender)}</div>
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
        </section>
      ))}

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', margin: '26px 0' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 6 }}>
          Keep track of which ones you&apos;ve sent
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 12, fontSize: 14 }}>
          Sending twenty of these is easy to lose track of. RecruitGrid remembers which schools you&apos;ve
          submitted to, stores your answers once so you can paste them into any form, and links each school to
          its coaching staff so you know who to email next. Free to start.
        </p>
        <Link className="btn gold" href="/app" style={{ textDecoration: 'none' }}>
          Start free →
        </Link>
      </div>

      {otherLevels.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            {sport} at other levels
          </h2>
          <p style={{ lineHeight: 2, marginBottom: 20 }}>
            {otherLevels.map(({ code, count }, i) => (
              <span key={code}>
                {i > 0 && ' · '}
                <Link href={`/questionnaires/${code.toLowerCase()}/${sportSlug}`}>
                  {code === 'JUCO' ? 'Junior college' : code} {sport.toLowerCase()} ({count})
                </Link>
              </span>
            ))}
          </p>
        </>
      )}

      {sameLevel.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            Other sports at {level.name}
          </h2>
          <p style={{ lineHeight: 2, marginBottom: 20 }}>
            {sameLevel.map((s, i) => (
              <span key={s.sport}>
                {i > 0 && ' · '}
                <Link href={`/questionnaires/${level.slug}/${slugify(s.sport)}`}>
                  {level.code === 'JUCO' ? 'Junior college' : level.code} {s.sport.toLowerCase()} ({s.count})
                </Link>
              </span>
            ))}
          </p>
        </>
      )}

      <ReadNext slugs={['d1-d2-d3-naia-juco-differences', 'recruiting-questionnaires', 'how-to-email-a-college-coach']} />

      <p style={{ marginTop: 30, fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.6 }}>
        Links are checked by hand and updated each season. Programs occasionally move or retire a form — if one
        is broken, email <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a> and it gets fixed.
        Submitting a questionnaire puts your information in a program&apos;s system; it is not an offer or a
        guarantee of contact.
      </p>
    </main>
  );
}
