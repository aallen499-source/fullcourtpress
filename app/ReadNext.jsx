import Link from 'next/link';
import { GUIDES } from '@/lib/guides';

// "Read next" on the directory pages.
//
// The guides were only reachable from /resources and the account menu, so
// Search Console had them as crawled and not indexed — pages with nothing
// pointing at them look like offcuts. The camp and questionnaire pages are the
// ones Google already knows, and a parent reading a list of camps is exactly
// who the camps guide is for, so the link earns its place twice.

export default function ReadNext({ slugs = [] }) {
  const guides = slugs.map((s) => GUIDES.find((g) => g.slug === s)).filter(Boolean);
  if (!guides.length) return null;
  return (
    <section className="read-next">
      <h2 className="read-next-title">Read next</h2>
      <ul className="read-next-list">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={`/resources/${g.slug}`}>{g.title}</Link>
            <span className="read-next-blurb">{g.shortAnswer.split('. ')[0]}.</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
