import Link from 'next/link';
import ReadNext from '@/app/ReadNext';
import { permanentRedirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import LevelDirectory from './LevelDirectory';
import {
  STATE_NAMES,
  slugify,
  stateSlugToCode,
  getAllQuestionnaires,
  directoryIndex,
  rowsFor,
  teamLabel,
  levelFromSlug,
  rowsForLevel,
  levelIndex,
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

// This route serves two page types, told apart by their first segment:
//
//   /questionnaires/basketball/arizona  — sport, then state
//   /questionnaires/d3/basketball       — level, then sport
//
// One route rather than two because Next cannot hold two dynamic routes at the
// same depth, and a literal segment (/questionnaires/level/d3/basketball) buys
// nothing but a longer URL. The two shapes cannot collide: no sport is called
// d1 or juco, and no state slug is the name of a sport.
async function loadLevel(levelSlug, sportSlug) {
  const level = levelFromSlug(levelSlug);
  if (!level) return null;
  const all = await getAllQuestionnaires(publicClient());
  const index = levelIndex(all);
  // levelIndex applies the minimum-rows rule, so asking it whether this
  // combination is listed keeps the page, the sitemap and the cross-links
  // agreeing about which pages exist.
  const listed = (index[level.code] || []).find((s) => slugify(s.sport) === sportSlug);
  if (!listed) return null;
  const rows = rowsForLevel(all, level.code, sportSlug);
  if (!rows.length) return null;
  return { level, rows, sport: rows[0][4], index };
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

  const lvl = await loadLevel(sportSlug, stateSlug);
  if (lvl) {
    const name = lvl.level.code === 'JUCO' ? 'Junior College' : lvl.level.code;
    const title = `${name} ${lvl.sport} Recruiting Questionnaires (${lvl.rows.length} Programs)`;
    const url = `https://recruitgrid.app/questionnaires/${lvl.level.slug}/${stateSlug}`;
    return {
      title: `${title} — RecruitGrid`,
      description: `Direct links to the official recruiting questionnaire for ${lvl.rows.length} ${lvl.level.name} college ${lvl.sport.toLowerCase()} programs, listed by state. Free, verified, and updated each season.`,
      alternates: { canonical: url },
      openGraph: { title: `${title} — RecruitGrid`, url },
    };
  }

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

  const lvl = await loadLevel(sportSlug, stateSlug);
  if (lvl) {
    return (
      <LevelDirectory
        level={lvl.level}
        sport={lvl.sport}
        sportSlug={stateSlug}
        rows={lvl.rows}
        index={lvl.index}
      />
    );
  }

  const data = await load(sportSlug, stateSlug);
  // A state can empty out when rows are removed or dates pass. That is not an
  // error for the visitor, and a 404 on a page Google already knows about is a
  // dead end — send them up to the questionnaire directory instead.
  if (!data) permanentRedirect('/questionnaires');
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
        Every link below goes to the school&apos;s own form, not a third-party service — and most go straight into
        the recruiting system the coaching staff uses to keep its list.
      </p>

      <div style={{ display: 'grid', gap: 0, borderTop: '1px solid var(--line)', marginBottom: 26 }}>
        {rows.map(([school, , level, gender, , url]) => (
          <div
            key={url}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}
          >
            <div>
              {/* The school name links to its own page. This is the only path
                  a crawler has into the 242 per-school pages besides the
                  sitemap, and internal links are what make them worth
                  indexing — a page reachable only from a sitemap reads as
                  something nobody thought was worth linking to. */}
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                <Link href={`/questionnaires/school/${slugify(school)}`} style={{ color: 'inherit' }}>
                  {school}
                </Link>
              </div>
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

      {/* Reciprocal of the link on the camps page — the two directory clusters
          feed each other rather than each pooling authority on its own. */}
      <p style={{ margin: '0 0 26px', lineHeight: 1.6 }}>
        Also for {stateName}:{' '}
        <Link href={`/camps/${sportSlug}/${stateSlug}`}>
          {stateName} college {sport.toLowerCase()} camps →
        </Link>
      </p>

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

      <ReadNext slugs={['recruiting-questionnaires', 'how-to-email-a-college-coach', 'ncaa-core-courses']} />

      <p style={{ marginTop: 30, fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.6 }}>
        Links are checked by hand and updated each season. Programs occasionally move or retire a form —
        if one is broken, email <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a> and it gets fixed.
        Submitting a questionnaire puts your information in a program&apos;s system; it is not an offer or a
        guarantee of contact.
      </p>
    </main>
  );
}
