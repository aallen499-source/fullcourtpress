import Link from 'next/link';
import { GUIDES, UPCOMING_GUIDES } from '@/lib/guides';

export const metadata = {
  title: 'College Recruiting Guides for Athletes and Parents — RecruitGrid',
  description:
    'Plain-language guides to college recruiting: how to email a college coach, when coaches can contact you, and more. Written by a recruiting parent.',
  alternates: { canonical: 'https://recruitgrid.app/guides' },
};

const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function GuidesIndex() {
  return (
    <main className="app-shell guide-shell">
      <h1 className="guide-h1">Recruiting Guides</h1>
      <p className="guide-lead">
        Plain answers to the questions families ask most — what to send a coach, when, and what to do next. No
        sales pitch; where a rule matters, we link to the official source.
      </p>

      <div className="guide-cards">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card">
            <span className="guide-card-title">{g.title}</span>
            <span className="guide-card-desc">{g.description}</span>
            <span className="guide-card-meta">{g.readMinutes} min read · Updated {fmt(g.updated)}</span>
          </Link>
        ))}
      </div>

      {UPCOMING_GUIDES.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 className="guide-h2">Coming soon</h2>
          <ul className="guide-upcoming">
            {UPCOMING_GUIDES.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
