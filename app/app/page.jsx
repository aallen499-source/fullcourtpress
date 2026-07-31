'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { hasLegacyData, legacySummary, migrateLocalData } from '@/lib/migrate-local-data';

// Protected landing page. middleware.js already guarantees a signed-in user here.
// Port the tabs from index.html into this shell, one at a time, starting with the roster.
export default function AppHome() {
  const [user, setUser] = useState(null);
  const [showMigrate, setShowMigrate] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user && hasLegacyData()) setShowMigrate(true);
    });
  }, []);

  async function runMigration() {
    setMigrating(true);
    setMigrateMsg('');
    try {
      const r = await migrateLocalData(user.id);
      const parts = [];
      if (r.coaches) parts.push(`${r.coaches} coaches`);
      if (r.camps) parts.push(`${r.camps} camps`);
      if (r.film) parts.push(`${r.film} film links`);
      if (r.templates) parts.push(`${r.templates} templates`);
      setMigrateMsg(`Moved over ${parts.join(', ') || 'your settings'}.`);
      setShowMigrate(false);
    } catch (e) {
      setMigrateMsg(`Couldn't move your data: ${e.message}. Nothing was deleted — try again.`);
    }
    setMigrating(false);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (!user) return <main className="auth-wrap"><p>Loading…</p></main>;

  return (
    <main>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Full Court Press</strong>
          <div className="muted small">{user.email}</div>
        </div>
        {/* Team iPads and family laptops are common here — keep sign out visible. */}
        <button onClick={signOut}>Sign out</button>
      </header>

      {showMigrate && (() => {
        const s = legacySummary();
        return (
          <section className="migrate-prompt">
            <h2>Bring your existing data over?</h2>
            <p>
              We found {s.coaches} coaches, {s.camps} camps, {s.film} film links and{' '}
              {s.templates} templates saved in this browser from before you had an account.
            </p>
            <button onClick={runMigration} disabled={migrating}>
              {migrating ? 'Moving…' : 'Move it into my account'}
            </button>
            <button onClick={() => setShowMigrate(false)} disabled={migrating}>
              Not now
            </button>
          </section>
        );
      })()}

      {migrateMsg && <p role="status">{migrateMsg}</p>}

      {/* Port Roster → Camps → Film → Templates → College Finder → My Info here. */}
      <p className="muted">Your app goes here.</p>
    </main>
  );
}
