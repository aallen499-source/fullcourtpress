import Link from 'next/link';
import ReadNext from '@/app/ReadNext';
import { allStaffDirectories } from '@/lib/staff-directory';
import { STATE_NAMES, slugify } from '@/lib/questionnaire-directory';

// The index for /coaches. Grouped by state, because that is both how families
// narrow a list and the only grouping the source data supports for every row —
// NCAA divisions are not recorded per school in the directory file.

export const metadata = {
  title: 'College Coaching Staff Directories by School — RecruitGrid',
  description:
    'Find the coaching staff at 1,200+ colleges: a direct link to each school’s official staff directory, plus its recruiting questionnaires and camps. Free.',
  alternates: { canonical: 'https://recruitgrid.app/coaches' },
};

export default function CoachesIndex() {
  const all = allStaffDirectories();
  const byState = new Map();
  for (const row of all) {
    if (!STATE_NAMES[row.state]) continue;
    if (!byState.has(row.state)) byState.set(row.state, []);
    byState.get(row.state).push(row);
  }
  const states = [...byState.keys()].sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));

  return (
    <main className="app-shell" style={{ maxWidth: '48rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.9rem', lineHeight: 1.1, marginBottom: 10 }}>
        College Coaching Staff Directories
      </h1>
      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 10 }}>
        A direct link to the official coaching staff page at <b>{all.length} colleges</b> — NCAA, NAIA and
        junior college — so you can find the right coach to write to instead of guessing at an address.
      </p>
      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 24 }}>
        Each school&apos;s page also carries its recruiting questionnaires and any camp it is running. We link to
        the school&apos;s own directory rather than republishing coaches&apos; email addresses: the athletics
        department keeps that page current, and an address copied here would be out of date within a season.
      </p>

      <div className="coach-states">
        {states.map((code) => (
          <Link key={code} href={`/coaches/state/${slugify(STATE_NAMES[code])}`} className="coach-state">
            <span className="coach-state-name">{STATE_NAMES[code]}</span>
            <span className="coach-state-count">{byState.get(code).length} schools</span>
          </Link>
        ))}
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px', margin: '10px 0 26px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.05rem', marginBottom: 6 }}>
          Keep your schools and coaches in one place
        </h2>
        <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 12, fontSize: 14 }}>
          RecruitGrid puts your target schools in three lanes, links each one to its coaching staff, drafts the
          email, and reminds you when it is time to follow up. Free to start.
        </p>
        <Link className="btn gold" href="/app" style={{ textDecoration: 'none' }}>Start free →</Link>
      </div>

      <ReadNext slugs={['how-to-email-a-college-coach', 'how-college-recruiting-works', 'recruiting-questionnaires']} />
    </main>
  );
}
