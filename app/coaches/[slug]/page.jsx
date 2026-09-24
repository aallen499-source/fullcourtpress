import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ReadNext from '@/app/ReadNext';
import { staffDirectoryBySlug } from '@/lib/staff-directory';
import {
  STATE_NAMES,
  slugify,
  getAllQuestionnaires,
  schoolIndex,
  teamLabel,
} from '@/lib/questionnaire-directory';

// One school's coaching staff: /coaches/university-of-nevada-las-vegas.
//
// The page exists for a search families make constantly — "<school> basketball
// coaching staff email" — whose free answers are all a list of results. What
// it gives is the school's own staff page, then the two things that are
// actually needed next: that school's recruiting questionnaires, and any camp
// it is running. Those come from data the site already holds, which is what
// keeps 1,225 pages from being 1,225 copies of one link.
//
// No coach email addresses are published here. The school shows its own, and
// keeps them current; a copy of them here would be stale within a season and
// would be ours to defend.

export const revalidate = 3600;

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
}

const LEVEL_LABEL = { NAIA: 'NAIA', JUCO: 'Junior college', D1: 'NCAA Division I', D2: 'NCAA Division II', D3: 'NCAA Division III' };

async function load(slug) {
  const school = staffDirectoryBySlug()[slug];
  if (!school) return null;

  const supabase = publicClient();
  const all = await getAllQuestionnaires(supabase);
  const entry = schoolIndex(all)[slug] || null;

  // Camps this school is running, by name. Matching on the name is loose by
  // nature — the camp catalogue writes "Grand Canyon University" and the
  // directory may say the same thing or not — so this only ever ADDS a
  // section, and a miss costs a link rather than showing the wrong school's
  // camp.
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const { data: camps } = await supabase
    .from('camps')
    .select('school, camp_name, date, city, state, sport, cost, source_url')
    .eq('school', school.school)
    .gte('date', today)
    .order('date')
    .limit(6);

  return { school, questionnaires: entry, camps: camps || [] };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: 'School not found — RecruitGrid' };
  const { school } = data;
  const state = STATE_NAMES[school.state] || '';
  const title = `${school.school} Coaching Staff Directory & Recruiting Contacts`;
  return {
    title: `${title} — RecruitGrid`,
    description: `How to find the coaching staff at ${school.school}${state ? ` in ${state}` : ''} — the official staff directory, their recruiting questionnaires, and who to email first.`,
    alternates: { canonical: `https://recruitgrid.app/coaches/${slug}` },
    openGraph: { title: `${title} — RecruitGrid`, url: `https://recruitgrid.app/coaches/${slug}` },
  };
}

export default async function CoachFinderPage({ params }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { school, questionnaires, camps } = data;
  const stateName = STATE_NAMES[school.state] || '';
  const level = LEVEL_LABEL[school.level] || LEVEL_LABEL[questionnaires?.level] || 'NCAA';
  const host = school.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'College coaching staff directories', item: 'https://recruitgrid.app/coaches' },
      { '@type': 'ListItem', position: 2, name: school.school, item: `https://recruitgrid.app/coaches/${slug}` },
    ],
  };

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 18 }}>
        <Link href="/coaches">Coaching staff directories</Link>
        {stateName ? ` · ${stateName}` : ''}
      </nav>

      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.9rem', lineHeight: 1.1, marginBottom: 8 }}>
        {school.school} Coaching Staff
      </h1>
      <p style={{ color: 'var(--sub)', fontSize: 14, marginBottom: 16 }}>
        {[level, stateName].filter(Boolean).join(' · ')}
      </p>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 6 }}>
          The official staff directory
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 12, fontSize: 14 }}>
          {school.school} publishes its coaches, titles and contact details on {host}. That page is kept current
          by the athletics department, which is why we link to it rather than copying addresses that go stale.
        </p>
        <a className="btn gold" style={{ textDecoration: 'none' }} href={school.url} target="_blank" rel="noopener noreferrer nofollow">
          Open the staff directory ↗
        </a>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
        Who to email first
      </h2>
      <p style={{ lineHeight: 1.6, marginBottom: 10 }}>
        Not the head coach, usually. On the directory page, look for the <b>recruiting coordinator</b> for your
        sport, or the assistant coach who handles your position or your part of the country. Assistants read
        their own email and answer it; head coaches at larger programs often have it filtered.
      </p>
      <p style={{ lineHeight: 1.6, marginBottom: 24 }}>
        If no addresses are listed — some schools publish phone numbers only — call the athletics office and ask
        who handles recruiting for your sport and graduation year. That one question is a normal thing for them
        to be asked.
      </p>

      {questionnaires?.rows?.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            Recruiting questionnaires at {school.school}
          </h2>
          <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 10, fontSize: 14 }}>
            Fill one of these out before you email — it puts you in the program&apos;s database, so the coach
            opening your message can already find you in their system.
          </p>
          <div style={{ borderTop: '1px solid var(--line)', marginBottom: 12 }}>
            {questionnaires.rows.map(([, , , gender, sport, url]) => (
              <div
                key={`${sport}-${gender}-${url}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{sport}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--sub)' }}>{teamLabel(gender)}</div>
                </div>
                <a className="btn ghost small" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }} href={url} target="_blank" rel="noopener noreferrer nofollow">
                  Open form ↗
                </a>
              </div>
            ))}
          </div>
          <p style={{ marginBottom: 24 }}>
            <Link href={`/questionnaires/school/${slug}`}>All {school.school} questionnaires →</Link>
          </p>
        </>
      )}

      {camps.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            Camps at {school.school}
          </h2>
          <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 10, fontSize: 14 }}>
            A camp run by the program itself is the one place these coaches watch players in person by
            invitation of their own.
          </p>
          <div style={{ borderTop: '1px solid var(--line)', marginBottom: 24 }}>
            {camps.map((c) => (
              <div key={`${c.camp_name}-${c.date}`} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{c.camp_name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--sub)' }}>
                  {[new Date(`${c.date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), [c.city, c.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', marginBottom: 26 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 6 }}>
          Keep track of who you&apos;ve written to
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 12, fontSize: 14 }}>
          RecruitGrid keeps your schools in one list, each linked to its coaching staff like this one, with the
          email drafted for you and a reminder when it is time to follow up. It also tells you when a coach
          opens your profile. Free to start.
        </p>
        <Link className="btn gold" href="/app" style={{ textDecoration: 'none' }}>Start free →</Link>
      </div>

      {stateName && (
        <p style={{ margin: '0 0 26px', lineHeight: 1.6 }}>
          Also for {stateName}:{' '}
          <Link href={`/questionnaires/basketball/${slugify(stateName)}`}>{stateName} questionnaires</Link>
          {' · '}
          <Link href={`/camps/basketball/${slugify(stateName)}`}>{stateName} camps</Link>
        </p>
      )}

      <ReadNext slugs={['how-to-email-a-college-coach', 'recruiting-questionnaires', 'how-college-recruiting-works']} />

      <p style={{ marginTop: 30, fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.6 }}>
        Staff directory links are checked by hand and updated each season. RecruitGrid is not affiliated with{' '}
        {school.school}; the directory is published by the school. If a link is broken, email{' '}
        <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a> and it gets fixed.
      </p>
    </main>
  );
}
