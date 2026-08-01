export const metadata = {
  title: 'Terms of Service — Full Court Press',
};

export default function TermsPage() {
  return (
    <main className="app-shell" style={{ maxWidth: '42rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.75rem', color: 'var(--turf)', marginBottom: '0.25rem' }}>
        Terms of Service
      </h1>
      {/* Hardcoded on purpose. This was previously new Date(), which re-rendered
          to the current date on every page load — so the policy always claimed
          to have been updated today and there was no way to show when the terms
          actually changed. Bump this by hand when the text below changes. */}
      <p className="muted small" style={{ marginBottom: '1.5rem' }}>Last updated: August 1, 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            What this is
          </h2>
          <p>
            Full Court Press is a self-managed recruiting workspace for student-athletes — a place to track coach
            outreach, camps, and film, and optionally publish a profile page. It is <b>not</b> a recruiting agency, a
            scouting service, or a database that coaches browse. Nobody here contacts coaches on your behalf, and
            nobody can promise you exposure, offers, or results. What you get out of this tool depends entirely on
            the outreach you do yourself.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Your account
          </h2>
          <p>
            You sign in with an emailed link rather than a password. Keep access to your email secure, since anyone
            with access to it can sign into your account. If you&apos;re under 18, a parent or guardian should know
            you&apos;re signing up.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Published profiles
          </h2>
          <p>
            If you publish a profile page, anyone with the link can view it — it isn&apos;t protected by a password.
            You&apos;re responsible for what you choose to include. You can unpublish or delete it at any time.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Acceptable use
          </h2>
          <p>Don&apos;t use this app to:</p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <li>Upload content you don&apos;t have the right to share, or that impersonates someone else</li>
            <li>Upload anything illegal, harassing, or that violates someone else&apos;s privacy</li>
            <li>Attempt to access another account or team you weren&apos;t invited to</li>
            <li>Use the service to send unsolicited bulk email</li>
          </ul>
          <p style={{ marginTop: '0.5rem' }}>We can suspend or remove accounts that violate these terms.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Paid plans
          </h2>
          <p>
            Paid plans are billed through Stripe. You can cancel at any time from the link in your Stripe receipt, or
            by emailing <a href="mailto:info@fullcourtpress.app">info@fullcourtpress.app</a>. Refund requests are
            handled case by case — just ask.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            No warranty
          </h2>
          <p>
            This app is provided as-is. Camp and school data comes from public sources and is not guaranteed to be
            current — always confirm details (dates, cost, eligibility, coaching staff) directly with the program
            before relying on them. We&apos;re not responsible for outcomes related to your recruiting process,
            including whether coaches respond, camps run as listed, or eligibility information stays accurate.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Changes
          </h2>
          <p>
            We may update these terms as the app changes. Continuing to use the app after a change means you accept
            the updated terms.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Contact
          </h2>
          <p>
            Questions about these terms: <a href="mailto:info@fullcourtpress.app">info@fullcourtpress.app</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
