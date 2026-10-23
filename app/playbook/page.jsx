import Link from 'next/link';
import { GUIDES } from '@/lib/guides';

// Sales page for the paid Playbook PDF.
//
// The honesty problem this page has to solve: every chapter is also free at
// /resources, and a buyer who works that out afterwards feels taken. So the
// page says it outright, high up, and sells what is actually different — one
// printable file, and worksheets that exist nowhere else. A customer who knows
// exactly what they are buying does not ask for a refund.

export const metadata = {
  title: 'The Recruiting Playbook — RecruitGrid',
  description:
    'A 69-page PDF for families figuring out college recruiting without a recruiting service: 15 chapters, worked email examples and printable worksheets. $19.',
  alternates: { canonical: 'https://recruitgrid.app/playbook' },
  openGraph: {
    title: 'The Recruiting Playbook — RecruitGrid',
    description: '69 pages, 15 chapters and printable worksheets. $19.',
    url: 'https://recruitgrid.app/playbook',
  },
};

const PRICE = '$19';
const BUY = process.env.NEXT_PUBLIC_PLAYBOOK_LINK || '';

const h2 = {
  fontFamily: 'var(--font-display)',
  textTransform: 'uppercase',
  fontSize: '1.125rem',
  marginBottom: '.5rem',
};

const SHEETS = [
  'Your target list — two dream schools, five targets, three safeties',
  'Camp budget — fee, travel and whether they have ever replied',
  'Questions to ask on a coach call, with room for their answers',
  'Coach contact log — what was said, next step, by when',
];

export default function PlaybookPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: 'The Recruiting Playbook',
    author: { '@type': 'Person', name: 'Angela Schmeckpeper' },
    publisher: { '@type': 'Organization', name: 'RecruitGrid' },
    numberOfPages: 69,
    bookFormat: 'https://schema.org/EBook',
    inLanguage: 'en',
    url: 'https://recruitgrid.app/playbook',
    offers: {
      '@type': 'Offer',
      price: '19.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://recruitgrid.app/playbook',
    },
  };

  return (
    <main className="app-shell" style={{ maxWidth: '42rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase',
                   fontSize: '2rem', lineHeight: 1.08, marginBottom: 10 }}>
        The Recruiting Playbook
      </h1>
      <p style={{ color: 'var(--sub)', lineHeight: 1.6, fontSize: 17, marginBottom: 20 }}>
        69 pages on what to do, when to do it and what to say — for families working out college
        recruiting without paying a service to do it for them.
      </p>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10,
                    padding: '20px 22px', marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{PRICE}</span>
          <span style={{ color: 'var(--sub)', fontSize: 14 }}>one payment · instant download · PDF</span>
        </div>
        {BUY ? (
          <a className="btn gold" href={BUY} style={{ textDecoration: 'none' }}>Buy the Playbook →</a>
        ) : (
          <p style={{ color: 'var(--sub)', fontSize: 14, margin: 0 }}>
            Checkout is being set up. Email <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a> and
            I&apos;ll send you a copy.
          </p>
        )}
      </div>

      {/* Said plainly and early, because they will find out anyway. */}
      <div style={{ border: '1px solid var(--line)', borderLeft: '3px solid var(--gold, #e8b23b)',
                    borderRadius: 8, padding: '14px 16px', marginBottom: 26 }}>
        <p style={{ margin: 0, lineHeight: 1.6, fontSize: 14.5 }}>
          <b>Worth knowing before you buy:</b> all {GUIDES.length} chapters are also free to read at{' '}
          <Link href="/resources">recruitgrid.app/resources</Link>. What you are paying for is the whole
          thing in one printable file, plus the worksheets — which are not on the site. If reading it
          on a screen suits you, read it free. Honestly.
        </p>
      </div>

      <h2 style={h2}>What&apos;s in it</h2>
      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 14 }}>
        Fifteen chapters in the order a season actually happens — how recruiting works, where you fit,
        getting on a coach&apos;s radar, your film, camps and visits, what to say when a coach calls,
        staying eligible and what a parent should and shouldn&apos;t do. With worked email examples you
        can adapt.
      </p>

      <h2 style={h2}>The worksheets</h2>
      <ul style={{ color: 'var(--sub)', lineHeight: 1.7, marginBottom: 22, paddingLeft: 20 }}>
        {SHEETS.map((s) => <li key={s}>{s}</li>)}
      </ul>

      <h2 style={h2}>What it isn&apos;t</h2>
      <p style={{ color: 'var(--sub)', lineHeight: 1.6, marginBottom: 22 }}>
        It will not contact coaches for you, and it does not promise anybody a scholarship. Rules about
        contact and eligibility differ by sport and division and they change, so where that matters the
        book tells you what is generally true and sends you to the NCAA&apos;s own pages.
      </p>

      <p style={{ color: 'var(--sub)', fontSize: 13.5, lineHeight: 1.6, marginTop: 30 }}>
        The download link is emailed straight after payment and works for 30 days. If it ever stops
        working, email <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a> and I&apos;ll send
        another. Questions before buying? Same address.
      </p>
    </main>
  );
}
