import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ReadNext from '@/app/ReadNext';
import { createAdminClient } from '@/lib/supabase-admin';
import { staffDirectoryBySlug } from '@/lib/staff-directory';
import { sectionsFor, hostOf } from '@/lib/coach-suggest';
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
// Coach email addresses ARE published here, since 2026-11-10. They are read
// off the school's own staff directory (supabase/75, coach_contacts), one
// contact per sport section, and every line says which page it came from and
// the date it was read. That date is what makes a copied address honest: a
// coach who changed jobs in April is wrong on this page until the next read,
// and the page says so rather than pretending. The paid Coach Finder is the
// search across schools; this is one school's page, with what that school
// itself publishes.

export const revalidate = 3600;

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
}

const LEVEL_LABEL = { NAIA: 'NAIA', JUCO: 'Junior college', D1: 'NCAA Division I', D2: 'NCAA Division II', D3: 'NCAA Division III' };

async function loadUncached(slug) {
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

  // The directory's rows, read through the service role: coach_contacts is
  // gated to paid accounts for direct reads (supabase/77) so the Finder cannot
  // be bulk-copied from a browser, but one school's own contacts are public
  // information on that school's site, and this page is one school.
  const { data: contacts } = await createAdminClient()
    .from('coach_contacts')
    .select('name, title, email, kind, rank, gender, heading, sport, checked_at')
    .eq('source_url', school.url)
    .limit(500);
  const sections = sectionsFor(contacts || []);
  const checkedAt = sections.map((x) => x.checkedAt).filter(Boolean).sort().at(-1) || null;

  return { school, questionnaires: entry, camps: camps || [], sections, checkedAt };
}

// Wrapped in React's cache() so generateMetadata and the page share ONE load
// per request. Without it both called this, and every render did the
// catalogue query and the 2,300-row dedupe twice — half of this page's CPU
// for nothing. Found 2026-11-10 while working out why Vercel paused the
// account for Fluid Active CPU.
const load = cache(loadUncached);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: 'School not found | RecruitGrid' };
  const { school, sections } = data;
  const state = STATE_NAMES[school.state] || '';
  const title = `${school.school} Coaching Staff Directory & Recruiting Contacts`;
  const withAddress = sections.filter((x) => x.best?.email).length;
  const description = withAddress
    ? `The coach to email at ${school.school}${state ? ` in ${state}` : ''} for ${withAddress === 1 ? 'one program' : `${withAddress} programs`}, with their email address read from the school's own staff directory, plus the recruiting questionnaires and camps.`
    : `How to find the coaching staff at ${school.school}${state ? ` in ${state}` : ''}, the official staff directory, their recruiting questionnaires, and who to email first.`;
  return {
    title: `${title} | RecruitGrid`,
    description,
    alternates: { canonical: `https://recruitgrid.app/coaches/${slug}` },
    openGraph: { title: `${title} | RecruitGrid`, url: `https://recruitgrid.app/coaches/${slug}` },
  };
}

export default async function CoachFinderPage({ params }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { school, questionnaires, camps, sections, checkedAt } = data;
  const stateName = STATE_NAMES[school.state] || '';
  const readOn = checkedAt ? new Date(checkedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
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
          {school.school} publishes its coaches, titles and contact details on {host}.{' '}
          {sections.length > 0
            ? `The contacts below were read from that page on ${readOn}. That page stays the source. When a coach moves on, it changes there first.`
            : 'That page is kept current by the athletics department.'}
        </p>
        <a className="btn gold" style={{ textDecoration: 'none' }} href={school.url} target="_blank" rel="noopener noreferrer nofollow">
          Open the staff directory ↗
        </a>
      </div>

      {sections.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            Who to email, by sport
          </h2>
          <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 10, fontSize: 14 }}>
            One contact per program: the recruiting coordinator where the directory names one, otherwise the
            assistant or head coach with a published address. Read from {host} on {readOn}.
          </p>
          <div style={{ borderTop: '1px solid var(--line)', marginBottom: 12 }}>
            {sections.map((x) => (
              <div key={x.key} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ fontSize: 12.5, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{x.label}</div>
                {x.best ? (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {x.best.name}
                      {x.best.title ? <span style={{ fontWeight: 400, color: 'var(--sub)' }}> · {x.best.title}</span> : null}
                    </div>
                    <div style={{ fontSize: 14, overflowWrap: 'anywhere' }}>
                      <a href={`mailto:${x.best.email}`}>{x.best.email}</a>
                    </div>
                    {x.best.kind === 'staff' && (
                      <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 2 }}>
                        {x.unlisted.length > 0
                          ? `The directory lists ${x.unlisted.length === 1 ? 'a coach' : `${x.unlisted.length} coaches`} for this program and publishes no address for ${x.unlisted.length === 1 ? 'them' : 'any of them'}. This is the program's staff contact; ask who handles recruiting for your graduation year.`
                          : 'A staff contact, not a coach. Ask who handles recruiting for your graduation year.'}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: 'var(--sub)' }}>
                    The directory lists {x.unlisted.length === 1 ? 'one coach' : `${x.unlisted.length} coaches`} and publishes no email address. Call the athletics office and ask who handles recruiting for your sport and graduation year.
                  </div>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.6, marginBottom: 24 }}>
            Coaches change jobs every spring. If an address here no longer matches the directory, the directory
            is right; email <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a> and it gets re-read.
          </p>
        </>
      )}

      <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
        {sections.length > 0 ? 'Why not the head coach' : 'Who to email first'}
      </h2>
      <p style={{ lineHeight: 1.6, marginBottom: 10 }}>
        Not the head coach, usually. {sections.length > 0 ? 'On the directory page' : 'On the directory page'}, look for the <b>recruiting coordinator</b> for your
        sport, or the assistant coach who handles your position or your part of the country. Assistants read
        their own email and answer it; head coaches at larger programs often have it filtered.
      </p>
      <p style={{ lineHeight: 1.6, marginBottom: 24 }}>
        If no addresses are listed (some schools publish phone numbers only), call the athletics office and ask
        who handles recruiting for your sport and graduation year. That one question is a normal thing for them
        to be asked.
      </p>

      {questionnaires?.rows?.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 8 }}>
            Recruiting questionnaires at {school.school}
          </h2>
          <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 10, fontSize: 14 }}>
            Fill one of these out before you email. It puts you in the program&apos;s database, so the coach
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
          coach&apos;s address filled in, the email drafted for you and a reminder when it is time to follow up. It
          also tells you when a coach opens your profile. Free to start. The Coach Finder on the Athlete plan
          searches every coach in your sport by state and division.
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
        Staff directory links are checked by hand and updated each season, and the contacts above are read
        from the school&apos;s own directory on the date shown. RecruitGrid is not affiliated with{' '}
        {school.school}; the directory is published by the school. If a link is broken or an address is out of
        date, email <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a> and it gets fixed.
      </p>
    </main>
  );
}
