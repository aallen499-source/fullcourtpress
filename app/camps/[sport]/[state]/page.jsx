import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  STATE_NAMES, SPORT_LABELS, slugify, stateSlugToCode,
  getCamps, campIndex, genderOf, teamLabel, formatDate, WINDOW_DAYS,
} from '@/lib/camp-directory';

// Dates roll forward daily, so a short revalidate keeps "next 45 days" honest
// without rebuilding.
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
  if (!code || !SPORT_LABELS[sportSlug]) return null;
  const supabase = publicClient();
  const { upcoming, laterCount } = await getCamps(supabase, sportSlug, code);
  if (!upcoming.length && !laterCount) return null;
  return { code, upcoming, laterCount, index: await campIndex(supabase) };
}

export async function generateMetadata({ params }) {
  const { sport: sportSlug, state: stateSlug } = await params;
  const data = await load(sportSlug, stateSlug);
  if (!data) return { title: 'Camps not found — RecruitGrid' };
  const stateName = STATE_NAMES[data.code];
  const sport = SPORT_LABELS[sportSlug];
  const title = `${stateName} College ${sport} Camps & Prospect Days`;
  return {
    title: `${title} — RecruitGrid`,
    description: `Verified college ${sport.toLowerCase()} camps and prospect days in ${stateName} — dates, cost, eligibility and registration links. Updated each season.`,
    alternates: { canonical: `https://recruitgrid.app/camps/${sportSlug}/${stateSlug}` },
    openGraph: { title: `${title} — RecruitGrid`, url: `https://recruitgrid.app/camps/${sportSlug}/${stateSlug}` },
  };
}

export default async function StateSportCamps({ params }) {
  const { sport: sportSlug, state: stateSlug } = await params;
  const data = await load(sportSlug, stateSlug);
  if (!data) notFound();
  const { code, upcoming, laterCount, index } = data;
  const stateName = STATE_NAMES[code];
  const sport = SPORT_LABELS[sportSlug];
  const others = (index[sportSlug] || []).filter((s) => s.state !== code);

  // schema.org SportsEvent for each camp shown. This is what lets Google
  // render dates/price/location as a rich result, and it's how ChatGPT,
  // Perplexity and AI Overviews read a page reliably rather than guessing at
  // the markup. Only the camps actually published on this page are described —
  // never the gated ones, or the structured data would contradict the page.
  const pageUrl = `https://recruitgrid.app/camps/${sportSlug}/${stateSlug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'College camps', item: 'https://recruitgrid.app/camps' },
          { '@type': 'ListItem', position: 2, name: `${stateName} ${sport}`, item: pageUrl },
        ],
      },
      ...upcoming.map((c) => {
        const ev = {
          '@type': 'SportsEvent',
          name: `${c.school} — ${c.camp_name}`,
          startDate: c.date,
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          sport,
          organizer: { '@type': 'Organization', name: c.school },
          location: {
            '@type': 'Place',
            name: c.school,
            address: {
              '@type': 'PostalAddress',
              addressLocality: c.city || undefined,
              addressRegion: code,
              addressCountry: 'US',
            },
          },
          url: c.source_url || pageUrl,
        };
        if (c.eligibility) ev.description = c.eligibility;
        // Only claim a price when there is one — an offer with a null price is
        // an invalid offer, and Google drops the whole item for it.
        if (c.cost != null) {
          ev.offers = {
            '@type': 'Offer',
            price: String(c.cost),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: c.source_url || pageUrl,
          };
        }
        return ev;
      }),
    ],
  };

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 18 }}>
        <Link href="/camps">College camps</Link> · {stateName}
      </nav>

      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.9rem', lineHeight: 1.1, marginBottom: 10 }}>
        {stateName} College {sport} Camps
      </h1>

      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 20 }}>
        College {sport.toLowerCase()} camps and prospect days in {stateName}, verified by hand — dates, cost,
        eligibility and a direct registration link for each. Showing the next {WINDOW_DAYS} days.
      </p>

      {upcoming.length === 0 ? (
        <div className="empty" style={{ marginBottom: 24 }}>
          <b>Nothing in the next {WINDOW_DAYS} days</b>
          {laterCount > 0 ? `${laterCount} more ${stateName} camps are on the calendar later this season.` : ''}
        </div>
      ) : (
        <div style={{ borderTop: '1px solid var(--line)', marginBottom: 24 }}>
          {upcoming.map((c) => {
            const team = teamLabel(genderOf(c.sport));
            const meta = [c.division, team, c.eligibility].filter(Boolean).join(' · ');
            return (
              <div key={`${c.school}-${c.camp_name}-${c.date}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono-fcp), monospace', fontSize: 11.5, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--gold-dim, var(--sub))' }}>
                    {formatDate(c.date)}{c.city ? ` · ${c.city}` : ''}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, margin: '2px 0 1px' }}>
                    {c.school} — {c.camp_name}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--sub)' }}>
                    {meta}{c.cost != null ? `${meta ? ' · ' : ''}$${c.cost}` : ''}
                  </div>
                </div>
                {c.source_url && (
                  <a className="btn ghost small" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
                     href={c.source_url} target="_blank" rel="noopener noreferrer nofollow">
                    Register ↗
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', marginBottom: 26 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 6 }}>
          {laterCount > 0
            ? `${laterCount} more ${stateName} ${sport.toLowerCase()} camp${laterCount === 1 ? '' : 's'} later this season`
            : 'See every camp, all season'}
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 12, fontSize: 14 }}>
          RecruitGrid tracks the full verified calendar across every sport and division, reminds you a week
          before a camp you registered for, and keeps your coach outreach in one place. Free to start.
        </p>
        <Link className="btn gold" href="/app" style={{ textDecoration: 'none' }}>Start free →</Link>
      </div>

      {/* Cross-link to the matching questionnaire page. Genuinely the next step
          for someone reading a camp list — and it connects the two directory
          clusters so authority flows between them instead of pooling. */}
      <p style={{ margin: '0 0 26px', lineHeight: 1.6 }}>
        Also for {stateName}:{' '}
        <Link href={`/questionnaires/${sportSlug}/${stateSlug}`}>
          {stateName} {sport.toLowerCase()} recruiting questionnaires →
        </Link>
      </p>

      {others.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            {sport} camps in other states
          </h2>
          <p style={{ lineHeight: 2 }}>
            {others.map((s, i) => (
              <span key={s.state}>
                {i > 0 && ' · '}
                <Link href={`/camps/${sportSlug}/${slugify(STATE_NAMES[s.state])}`}>{STATE_NAMES[s.state]}</Link>
              </span>
            ))}
          </p>
        </>
      )}

      <p style={{ marginTop: 30, fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.6 }}>
        Dates and prices are verified against each school&apos;s own page, but details change — always confirm
        on the registration page before you travel or pay. Found something wrong?{' '}
        <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a>.
      </p>
    </main>
  );
}
