import Link from 'next/link';
import { existsSync } from 'fs';
import path from 'path';

export const metadata = {
  title: 'About — Full Court Press',
  description:
    'Who built Full Court Press and why. A parent-built recruiting workspace for high school athletes, with a hand-verified camp list.',
};

const h2 = {
  fontFamily: 'var(--font-display)',
  textTransform: 'uppercase',
  fontSize: '1.125rem',
  marginBottom: '0.5rem',
};

// Written from Angela's own account of why she built this, developed with her
// rather than invented. The substance — organization for her own athlete, the
// cost of services that do the work *for* the kid, hand-verifying every camp —
// is hers. Don't add claims here she hasn't made; the whole value of this page
// is that a parent can read it and believe a real person is behind the site.
// Deliberately inside the component, not a module-level const. As a top-level
// const this is evaluated once when the module first loads, so a file added
// afterwards never appears until the server restarts — which is exactly what
// happened. Here it runs per render in dev and at build time in production.
function availablePhotos() {
  return ['about-1.jpg', 'about-2.jpg', 'about-3.jpg'].filter((f) =>
    existsSync(path.join(process.cwd(), 'public', f))
  );
}

export default function AboutPage() {
  const PHOTOS = availablePhotos();
  const hasPhotos = PHOTOS.length > 0;

  return (
    <main className="app-shell" style={{ maxWidth: hasPhotos ? '58rem' : '42rem' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          textTransform: 'uppercase',
          fontSize: '1.75rem',
          color: 'var(--turf)',
          marginBottom: '1.25rem',
        }}
      >
        About
      </h1>

      <div className={hasPhotos ? 'about-split' : undefined}>
        {hasPhotos && (
          // Angela's own kids, used with the photographer's permission.
          <div className="about-photos">
            {PHOTOS.map((f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={f} src={`/${f}`} alt="" loading="lazy" />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9375rem', lineHeight: 1.65 }}>

        <section>
          <h2 style={h2}>Why I built it</h2>
          <p>
            I built Full Court Press to get my own athlete organized. We were keeping camps in a notes app, digging
            through a personal inbox for coach emails, and guessing at what to send next.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            A lot of athletes have no idea where to start. That&apos;s the part I wanted to help with — not the
            highlight reel, the boring parts underneath it. Knowing which camps are worth the drive. Remembering who
            you emailed in March and never heard back from. Having your information in one place when a coach finally
            does ask for it.
          </p>
        </section>

        <section>
          <h2 style={h2}>What I think is wrong with the alternatives</h2>
          <p>
            Recruiting services charge a lot of money, and plenty of them don&apos;t do what they promise. But the
            bigger problem is what it looks like when they do.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            When a service writes the emails, coaches can tell. What lands in their inbox says the athlete
            didn&apos;t do the work — and that&apos;s the opposite of the impression you want to make. Coaches are
            recruiting someone who will show up early and handle their own business. Outsourcing the first
            impression works against you.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            So this tool doesn&apos;t contact anyone for you. It drafts the email and opens it in your own account,
            so it sends from your address, in your words. You do the reaching out. This just makes sure you know who
            to reach out to and when.
          </p>
        </section>

        <section>
          <h2 style={h2}>How the camp list works</h2>
          <p>
            I find and check each camp myself. Every listing gets confirmed against the school&apos;s own page — the
            date, the cost, who&apos;s eligible, and a registration link that actually goes to the school rather than
            some third party.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            It&apos;s slow, and it&apos;s why the list isn&apos;t enormous. I&apos;d rather it be short and right.
            Camps drop off the list on their own once the date passes, so you&apos;re not scrolling past things you
            can no longer register for. Even so — always open the school&apos;s page and confirm before you pay or
            book travel. Dates move.
          </p>
        </section>

        <section>
          <h2 style={h2}>Getting in touch</h2>
          <p>
            If something&apos;s broken, a camp looks wrong, or you want a school added, email{' '}
            <a href="mailto:info@fullcourtpress.app">info@fullcourtpress.app</a>. It comes to me.
          </p>
          <p style={{ marginTop: '0.75rem', color: 'var(--sub)' }}>— Angela, founder</p>
        </section>

          <p style={{ marginTop: '0.5rem' }}>
            <Link href="/">← Back to Full Court Press</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
