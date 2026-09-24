import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES, guideBySlug } from '@/lib/guides';

// A single guide. Unlike athlete profiles, these are meant to be found, so they
// are indexed and listed in the sitemap.

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return { title: 'Guide not found — RecruitGrid' };
  return {
    title: `${g.title} — RecruitGrid`,
    description: g.description,
    alternates: { canonical: `https://recruitgrid.app/resources/${g.slug}` },
    openGraph: { title: g.title, description: g.description, url: `https://recruitgrid.app/resources/${g.slug}`, type: 'article' },
  };
}

const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

function Block({ b }) {
  if (b.type === 'p') return <p className="guide-p">{b.text}</p>;
  if (b.type === 'list') return <ul className="guide-list">{b.items.map((it) => <li key={it}>{it}</li>)}</ul>;
  if (b.type === 'note') return <div className="guide-note">{b.text}</div>;
  if (b.type === 'example') {
    return (
      <figure className="guide-example">
        <figcaption>{b.title}</figcaption>
        <pre>{b.text}</pre>
      </figure>
    );
  }
  return null;
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.slug !== g.slug);
  // Article plus FAQPage, in one graph.
  //
  // A caveat worth recording rather than rediscovering: since 2023 Google has
  // shown FAQ rich results only for government and health sites, so this will
  // not put a dropdown under the blue link. It still earns its place — the
  // Q&A pairs are what AI answers and other crawlers read when they want a
  // direct answer, and the questions themselves are drawn from what parents
  // actually ask. The visible "Common questions" section below matters more
  // than the markup: People Also Ask is picked from page content, not schema.
  const faqs = g.faqs || [];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: g.title,
        description: g.description,
        dateModified: g.updated,
        author: { '@type': 'Organization', name: 'RecruitGrid' },
        publisher: { '@type': 'Organization', name: 'RecruitGrid', url: 'https://recruitgrid.app' },
        mainEntityOfPage: `https://recruitgrid.app/resources/${g.slug}`,
      },
      ...(faqs.length
        ? [{
            '@type': 'FAQPage',
            mainEntity: faqs.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          }]
        : []),
    ],
  };

  return (
    <main className="app-shell guide-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="guide-crumbs"><Link href="/resources">Resources</Link></nav>
      <h1 className="guide-h1">{g.title}</h1>
      <div className="guide-meta">{g.readMinutes} min read · Updated {fmt(g.updated)}</div>

      <div className="guide-short">
        <span>The short answer</span>
        <p>{g.shortAnswer}</p>
      </div>

      {g.sections.map((s) => (
        <section key={s.heading} className="guide-section">
          <h2 className="guide-h2">{s.heading}</h2>
          {s.blocks.map((b, i) => <Block key={i} b={b} />)}
        </section>
      ))}

      {faqs.length > 0 && (
        <section className="guide-section">
          <h2 className="guide-h2">Common questions</h2>
          {faqs.map(({ q, a }) => (
            <div key={q} className="guide-faq">
              <h3 className="guide-faq-q">{q}</h3>
              <p className="guide-faq-a">{a}</p>
            </div>
          ))}
        </section>
      )}

      {g.sources?.length > 0 && (
        <p className="guide-sources">
          Official source{g.sources.length > 1 ? 's' : ''}:{' '}
          {g.sources.map((src, i) => (
            <span key={src.url}>
              {i > 0 && ' · '}
              <a href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a>
            </span>
          ))}
        </p>
      )}

      {g.cta && (
        <div className="guide-cta">
          <div>
            <div className="guide-cta-title">{g.cta.title}</div>
            <p>{g.cta.text}</p>
          </div>
          <Link className="btn gold" href={g.cta.href}>{g.cta.button} →</Link>
        </div>
      )}

      {others.length > 0 && (
        <section className="guide-section">
          <h2 className="guide-h2">More resources</h2>
          <ul className="guide-list">
            {others.map((o) => <li key={o.slug}><Link href={`/resources/${o.slug}`}>{o.title}</Link></li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
