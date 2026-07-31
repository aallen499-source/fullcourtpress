export const metadata = {
  title: 'Privacy Policy — Full Court Press',
};

export default function PrivacyPage() {
  return (
    <main className="app-shell" style={{ maxWidth: '42rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.75rem', color: 'var(--turf)', marginBottom: '0.25rem' }}>
        Privacy Policy
      </h1>
      <p className="muted small" style={{ marginBottom: '1.5rem' }}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
        <p>
          Full Court Press is a recruiting workspace for student-athletes. This page explains what information we
          collect, why, who else sees it, and how to get your data deleted. It&apos;s written in plain language on
          purpose — if anything here is unclear, email <a href="mailto:info@fullcourtpress.app">info@fullcourtpress.app</a>.
        </p>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            If you&apos;re under 18
          </h2>
          <p>
            Most people using this app are minors. If you&apos;re under 18, a parent or guardian should know you&apos;re
            using it, and should feel free to email us with any questions or to request that an account be deleted.
            We don&apos;t knowingly collect information from children under 13, and this service isn&apos;t directed at
            children under 13.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            What we collect
          </h2>
          <p>When you sign in and use the account-backed features (Coach Roster, Film Locker, Templates, Camps, and My Info on /app, plus published profile pages), we store:</p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <li>Your email address (used to sign you in — we use passwordless email links, so we never store a password)</li>
            <li>Profile details you choose to enter: name, sport, graduation year, school, position, height, GPA, NCAA Eligibility Center ID, and a bio</li>
            <li>A profile photo, if you upload one</li>
            <li>Video files or links you add to your Film Locker</li>
            <li>The coaches, camps, and email templates you add for your own outreach tracking</li>
            <li>If you join or create a Team, which team you&apos;re on (your coach can see your name and, if you&apos;ve published one, a link to your public profile — nothing else from your account)</li>
          </ul>
          <p style={{ marginTop: '0.5rem' }}>
            The single-file version of this app (the one you can use before signing in) saves everything in your
            browser&apos;s local storage instead — that data never reaches our servers unless you sign in and choose to
            bring it into your account.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Who can see it
          </h2>
          <p>
            Your Coach Roster, Film Locker, Templates, and Camps list are private to your account — nobody else can
            read them. If you choose to <b>publish a profile</b>, that specific page (your name, sport, grad year,
            school, bio, stats, photo, and film) becomes visible to anyone who has the link — it&apos;s not searchable
            or listed anywhere, but the link itself isn&apos;t password-protected. Only publish what you&apos;d be
            comfortable with a stranger who has the link seeing.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Who we share it with
          </h2>
          <p>We use a small number of service providers to run the app. None of them are allowed to use your data for their own purposes:</p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <li><b>Supabase</b> — hosts our database, file storage, and handles sign-in</li>
            <li><b>Vercel</b> — hosts the website itself</li>
            <li><b>Resend</b> — sends the sign-in link emails</li>
            <li><b>Stripe</b> — processes payments for paid plans; we never see or store your card details ourselves</li>
          </ul>
          <p style={{ marginTop: '0.5rem' }}>
            We don&apos;t sell your data, and we don&apos;t share it with recruiting agencies, advertisers, or anyone
            else beyond what&apos;s listed here.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Deleting your account
          </h2>
          <p>
            You can delete your account and all associated data at any time from <b>My Info → Delete my account</b> on
            /app. This permanently removes your profile, roster, film, templates, camps, and any uploaded photos or
            videos — it can&apos;t be undone. If you&apos;d rather email us to request deletion, use{' '}
            <a href="mailto:info@fullcourtpress.app">info@fullcourtpress.app</a>.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Questions
          </h2>
          <p>
            Email <a href="mailto:info@fullcourtpress.app">info@fullcourtpress.app</a> with anything — access requests,
            corrections, deletion, or general questions about how this works.
          </p>
        </section>
      </div>
    </main>
  );
}
