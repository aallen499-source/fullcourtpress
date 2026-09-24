import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import ReadNext from '@/app/ReadNext';
import { allStaffDirectories } from '@/lib/staff-directory';
import { STATE_NAMES, slugify, stateSlugToCode } from '@/lib/questionnaire-directory';

// The schools in one state: /coaches/state/nevada.
//
// This layer exists because the first version put all 1,225 schools on the
// hub — half a megabyte of HTML, 1,225 links sharing one page's authority, and
// an unusable page on a phone. A state at a time is how families narrow it
// anyway, and it gives the school pages a parent that is actually about them.

export const revalidate = 86400;

function load(stateSlug) {
  const code = stateSlugToCode(stateSlug);
  if (!code) return null;
  const rows = allStaffDirectories().filter((r) => r.state === code);
  return rows.length ? { code, rows } : null;
}

export async function generateMetadata({ params }) {
  const { state: stateSlug } = await params;
  const data = load(stateSlug);
  if (!data) return { title: 'Not found — RecruitGrid' };
  const name = STATE_NAMES[data.code];
  const title = `${name} College Coaching Staff Directories (${data.rows.length} Schools)`;
  return {
    title: `${title} — RecruitGrid`,
    description: `Coaching staff and recruiting contacts for ${data.rows.length} colleges in ${name} — a direct link to each school's official staff directory, plus its questionnaires and camps.`,
    alternates: { canonical: `https://recruitgrid.app/coaches/state/${stateSlug}` },
    openGraph: { title: `${title} — RecruitGrid`, url: `https://recruitgrid.app/coaches/state/${stateSlug}` },
  };
}

export default async function CoachesByState({ params }) {
  const { state: stateSlug } = await params;
  const data = load(stateSlug);
  if (!data) permanentRedirect('/coaches');
  const { code, rows } = data;
  const name = STATE_NAMES[code];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'College coaching staff directories', item: 'https://recruitgrid.app/coaches' },
          { '@type': 'ListItem', position: 2, name, item: `https://recruitgrid.app/coaches/state/${stateSlug}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${name} college coaching staff directories`,
        numberOfItems: rows.length,
        itemListElement: rows.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: r.school,
          url: `https://recruitgrid.app/coaches/${r.slug}`,
        })),
      },
    ],
  };

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 18 }}>
        <Link href="/coaches">Coaching staff directories</Link> · {name}
      </nav>

      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.9rem', lineHeight: 1.1, marginBottom: 10 }}>
        {name} College Coaching Staff
      </h1>
      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 22 }}>
        The official coaching staff page for <b>{rows.length} {name} colleges</b>, so you can find the right
        coach to write to. Each school also lists its recruiting questionnaires and any camp it is running.
      </p>

      <div style={{ borderTop: '1px solid var(--line)', marginBottom: 26 }}>
        {rows.map((r) => (
          <div key={r.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                <Link href={`/coaches/${r.slug}`} style={{ color: 'inherit' }}>{r.school}</Link>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sub)' }}>
                {r.level === 'JUCO' ? 'Junior college' : r.level || 'NCAA'}
              </div>
            </div>
            <Link className="btn ghost small" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }} href={`/coaches/${r.slug}`}>
              Coaching staff →
            </Link>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', marginBottom: 26 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 6 }}>
          Keep your schools and coaches in one place
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 12, fontSize: 14 }}>
          RecruitGrid puts your target schools in three lanes, links each one to its coaching staff, drafts the
          email and reminds you to follow up. Free to start.
        </p>
        <Link className="btn gold" href="/app" style={{ textDecoration: 'none' }}>Start free →</Link>
      </div>

      <p style={{ margin: '0 0 26px', lineHeight: 1.6 }}>
        Also for {name}:{' '}
        <Link href={`/questionnaires/basketball/${slugify(name)}`}>{name} questionnaires</Link>
        {' · '}
        <Link href={`/camps/basketball/${slugify(name)}`}>{name} camps</Link>
      </p>

      <ReadNext slugs={['how-to-email-a-college-coach', 'how-college-recruiting-works', 'recruiting-questionnaires']} />
    </main>
  );
}
