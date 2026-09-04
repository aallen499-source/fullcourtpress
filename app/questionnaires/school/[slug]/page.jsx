import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  STATE_NAMES, slugify, getAllQuestionnaires, schoolIndex, teamLabel,
} from '@/lib/questionnaire-directory';
import { formatDate } from '@/lib/camp-directory';

// One page per school.
//
// Built because Search Console said the directory was organised the wrong way
// round. Parents don't search "Iowa questionnaires by sport" — they search
// "iowa state football recruiting questionnaire". Those searches already reach
// page one (positions 8 and 9) by landing on a sport/state page that merely
// mentions the school; a page that is genuinely about the school should do
// better, and there are 242 of them in data we already hold.
//
// Rendered on demand rather than prerendered: 242 pages would slow every build
// for content that changes a few times a season, and the first crawler to ask
// for one generates it.
export const revalidate = 3600;

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
}

async function load(slug) {
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug)) return null;
  const supabase = publicClient();
  const rows = await getAllQuestionnaires(supabase);
  const index = schoolIndex(rows);
  const school = index[slug];
  if (!school) return null;

  // Camps are matched on the slug, not the raw name: the camps table and the
  // questionnaire list spell some schools differently, and an exact-string
  // join would silently drop a school's own camps from its own page.
  let camps = [];
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('camps')
      .select('school, camp_name, date, city, state, division, cost, source_url, sport')
      .gte('date', today)
      .order('date');
    camps = (data || []).filter((c) => slugify(c.school) === slug);
  } catch {
    camps = [];
  }

  // Same state, for the "other schools" links. Capped — a list of 40 links is
  // navigation nobody uses and dilutes the ones that matter.
  const siblings = Object.values(index)
    .filter((s) => s.state === school.state && s.slug !== slug)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 24);

  return { school, camps, siblings };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: 'School not found — RecruitGrid' };
  const { school } = data;
  const stateName = STATE_NAMES[school.state];
  const sports = [...new Set(school.rows.map((r) => r[4]))];
  const sportList = sports.slice(0, 3).join(', ').toLowerCase();

  return {
    title: `${school.name} Recruiting Questionnaires — RecruitGrid`,
    description:
      `Official ${school.name} recruiting questionnaire links for ${sportList}` +
      `${sports.length > 3 ? ' and more' : ''}. Direct to the athletics department's own form. ` +
      `${school.level ? school.level + ' · ' : ''}${stateName}.`,
    alternates: { canonical: `https://recruitgrid.app/questionnaires/school/${slug}` },
    openGraph: {
      title: `${school.name} Recruiting Questionnaires`,
      url: `https://recruitgrid.app/questionnaires/school/${slug}`,
    },
  };
}

export default async function SchoolQuestionnaires({ params }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { school, camps, siblings } = data;
  const stateName = STATE_NAMES[school.state];
  const pageUrl = `https://recruitgrid.app/questionnaires/school/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Recruiting questionnaires', item: 'https://recruitgrid.app/questionnaires' },
          { '@type': 'ListItem', position: 2, name: school.name, item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${school.name} recruiting questionnaires`,
        numberOfItems: school.rows.length,
        itemListElement: school.rows.map(([, , , gender, sport, url], i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${school.name} ${teamLabel(gender)} ${sport} recruiting questionnaire`.replace(/\s+/g, ' '),
          url,
        })),
      },
    ],
  };

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 18 }}>
        <Link href="/questionnaires">Recruiting questionnaires</Link> · {stateName}
      </nav>

      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.9rem', lineHeight: 1.1, marginBottom: 10 }}>
        {school.name} Recruiting Questionnaires
      </h1>

      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 22 }}>
        Direct links to {school.name}&apos;s own recruiting questionnaires
        {school.level ? ` — ${school.level}` : ''}, {stateName}. Each one goes to the athletics
        department&apos;s form, not to a third-party service.
      </p>

      <div style={{ borderTop: '1px solid var(--line)', marginBottom: 26 }}>
        {school.rows.map(([, , level, gender, sport, url]) => (
          <div key={url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{sport}</div>
              <div style={{ fontSize: 12.5, color: 'var(--sub)' }}>
                {[teamLabel(gender), level].filter(Boolean).join(' · ')}
              </div>
            </div>
            <a className="btn ghost small" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
               href={url} target="_blank" rel="noopener noreferrer nofollow">
              Open form ↗
            </a>
          </div>
        ))}
      </div>

      {camps.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            Upcoming camps at {school.name}
          </h2>
          <div style={{ borderTop: '1px solid var(--line)', marginBottom: 26 }}>
            {camps.map((c) => (
              <div key={`${c.camp_name}-${c.date}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono-fcp), monospace', fontSize: 11.5, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--gold-dim, var(--sub))' }}>
                    {formatDate(c.date)}{c.city ? ` · ${c.city}` : ''}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.camp_name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--sub)' }}>
                    {[c.division, c.cost != null ? `$${c.cost}` : null].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {c.source_url && (
                  <a className="btn ghost small" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
                     href={c.source_url} target="_blank" rel="noopener noreferrer nofollow">
                    Register ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Genuinely useful and true of every school, which is the point: a page
          carrying one questionnaire link and nothing else is thin, and thin
          pages generated 242 at a time are what search engines penalise. This
          is the answer to what the searcher actually wants to know. */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', marginBottom: 26 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
          What the questionnaire actually does
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.65, fontSize: 14, marginBottom: 10 }}>
          A recruiting questionnaire is how a program opens a file on an athlete. Most coaching
          staffs won&apos;t track someone who hasn&apos;t submitted one, so it comes before the
          email, before the film link, and before a camp — not after.
        </p>
        <p style={{ color: 'var(--sub)', lineHeight: 1.65, fontSize: 14, marginBottom: 10 }}>
          Filling one in is not contact from a coach and it isn&apos;t a scholarship offer. It puts
          your name, position, grad year and film in front of the staff in the format they already
          work from. Submit it, then email the assistant who recruits your position or your region —
          the staff page will say who that is.
        </p>
        <p style={{ color: 'var(--sub)', lineHeight: 1.65, fontSize: 14, margin: 0 }}>
          Eligibility rules and recruiting calendars differ by division and change from year to
          year. Confirm what applies to you with the NCAA, NAIA or NJCAA directly, and with the
          compliance office at any school you get serious about.
        </p>
      </div>

      <p style={{ margin: '0 0 26px', lineHeight: 1.6 }}>
        More for {stateName}:{' '}
        {[...new Set(school.rows.map((r) => r[4]))].map((sport, i) => (
          <span key={sport}>
            {i > 0 && ' · '}
            <Link href={`/questionnaires/${slugify(sport)}/${slugify(stateName)}`}>
              {stateName} {sport.toLowerCase()} questionnaires
            </Link>
          </span>
        ))}
      </p>

      {siblings.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            Other {stateName} schools
          </h2>
          <p style={{ lineHeight: 2 }}>
            {siblings.map((s, i) => (
              <span key={s.slug}>
                {i > 0 && ' · '}
                <Link href={`/questionnaires/school/${s.slug}`}>{s.name}</Link>
              </span>
            ))}
          </p>
        </>
      )}

      <p style={{ marginTop: 30, fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.6 }}>
        Links are checked by hand against each school&apos;s athletics site, but programs move their
        forms — if one is broken,{' '}
        <a href="mailto:info@recruitgrid.app">tell me</a> and I&apos;ll fix it.
      </p>
    </main>
  );
}
