'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { hasLegacyData, legacySummary, migrateLocalData } from '@/lib/migrate-local-data';
import { DEFAULT_TEMPLATES, fillMergeTags } from '@/lib/default-templates';

const STATUS_OPTIONS = ['not_contacted', 'contacted', 'followup', 'responded', 'committed'];
const STATUS_LABELS = {
  not_contacted: 'Not contacted',
  contacted: 'Contacted',
  followup: 'Follow-up',
  responded: 'Responded',
  committed: 'Committed',
};
const LEVEL_OPTIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO', 'Club/Other'];

const emptyCoachForm = { name: '', school: '', sport: '', level: 'D1', email: '', status: 'not_contacted', notes: '' };

function initials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AppHome() {
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);

  const [showMigrate, setShowMigrate] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState('');

  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [editingCoachId, setEditingCoachId] = useState(null);
  const [coachForm, setCoachForm] = useState(emptyCoachForm);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeCoach, setComposeCoach] = useState(null);
  const [composeTemplateId, setComposeTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (!data.user) return;
      if (hasLegacyData()) setShowMigrate(true);

      const [{ data: profileRow }, { data: coachRows }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).single(),
        supabase.from('coaches').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }),
      ]);
      setProfile(profileRow || null);
      setCoaches(coachRows || []);
      setLoadingCoaches(false);
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
      const { data: coachRows } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setCoaches(coachRows || []);
    } catch (e) {
      setMigrateMsg(`Couldn't move your data: ${e.message}. Nothing was deleted — try again.`);
    }
    setMigrating(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  function openAddCoach() {
    setEditingCoachId(null);
    setCoachForm(emptyCoachForm);
    setCoachModalOpen(true);
  }

  function openEditCoach(c) {
    setEditingCoachId(c.id);
    setCoachForm({
      name: c.name || '',
      school: c.school || '',
      sport: c.sport || '',
      level: c.level || 'D1',
      email: c.email || '',
      status: c.status || 'not_contacted',
      notes: c.notes || '',
    });
    setCoachModalOpen(true);
  }

  async function saveCoach(e) {
    e.preventDefault();
    if (!coachForm.name.trim()) {
      alert('Coach name is required.');
      return;
    }
    if (editingCoachId) {
      const { data: updated, error } = await supabase
        .from('coaches')
        .update({ ...coachForm, updated_at: new Date().toISOString() })
        .eq('id', editingCoachId)
        .select()
        .single();
      if (!error) setCoaches((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const { data: inserted, error } = await supabase
        .from('coaches')
        .insert({ ...coachForm, user_id: user.id })
        .select()
        .single();
      if (!error) setCoaches((cs) => [inserted, ...cs]);
    }
    setCoachModalOpen(false);
  }

  async function deleteCoach(id) {
    if (!confirm('Remove this coach from your roster?')) return;
    await supabase.from('coaches').delete().eq('id', id);
    setCoaches((cs) => cs.filter((c) => c.id !== id));
  }

  async function updateStatus(id, status) {
    setCoaches((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    await supabase.from('coaches').update({ status }).eq('id', id);
  }

  function openCompose(c) {
    setComposeCoach(c);
    const t = DEFAULT_TEMPLATES[0];
    setComposeTemplateId(t.id);
    setComposeSubject(fillMergeTags(t.subject, c, profile));
    setComposeBody(fillMergeTags(t.body, c, profile));
    setComposeOpen(true);
  }

  function onComposeTemplateChange(id) {
    setComposeTemplateId(id);
    const t = DEFAULT_TEMPLATES.find((x) => x.id === id);
    setComposeSubject(fillMergeTags(t.subject, composeCoach, profile));
    setComposeBody(fillMergeTags(t.body, composeCoach, profile));
  }

  function sendCompose() {
    const to = composeCoach?.email;
    if (!to) {
      alert("This coach doesn't have an email on file yet — add one from the roster, or use Copy Text to paste it in manually.");
      return;
    }
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(composeSubject)}&body=${encodeURIComponent(composeBody)}`;
    setComposeOpen(false);
  }

  function copyCompose() {
    const text = `Subject: ${composeSubject}\n\n${composeBody}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Copied — paste it into your email app.');
        setComposeOpen(false);
      })
      .catch(() => alert('Could not copy automatically — select the text manually.'));
  }

  if (!user) return <main className="auth-wrap"><p>Loading…</p></main>;

  const stats = {
    total: coaches.length,
    contacted: coaches.filter((c) => ['contacted', 'followup', 'responded', 'committed'].includes(c.status)).length,
    followup: coaches.filter((c) => c.status === 'followup').length,
    responded: coaches.filter((c) => ['responded', 'committed'].includes(c.status)).length,
  };

  return (
    <main className="app-shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Full Court Press</strong>
          <div className="muted small">{user.email}</div>
        </div>
        <button onClick={signOut}>Sign out</button>
      </header>

      {showMigrate &&
        (() => {
          const s = legacySummary();
          return (
            <section className="migrate-prompt">
              <h2>Bring your existing data over?</h2>
              <p>
                We found {s.coaches} coaches, {s.camps} camps, {s.film} film links and {s.templates} templates saved in
                this browser from before you had an account.
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

      <div className="roster-stats">
        <div className="roster-stat">
          <div className="roster-stat-num">{stats.total}</div>
          <div className="roster-stat-label">Coaches</div>
        </div>
        <div className="roster-stat">
          <div className="roster-stat-num">{stats.contacted}</div>
          <div className="roster-stat-label">Contacted</div>
        </div>
        <div className="roster-stat">
          <div className="roster-stat-num">{stats.followup}</div>
          <div className="roster-stat-label">Needs follow-up</div>
        </div>
        <div className="roster-stat">
          <div className="roster-stat-num">{stats.responded}</div>
          <div className="roster-stat-label">Responded</div>
        </div>
      </div>

      <div className="panel-head">
        <h2>Coach Roster</h2>
        <button className="btn gold" onClick={openAddCoach}>
          + Add Coach
        </button>
      </div>

      {loadingCoaches ? (
        <p className="muted">Loading roster…</p>
      ) : coaches.length === 0 ? (
        <div className="empty">
          <b>No coaches yet</b>
          Add the first program on your list to start tracking outreach.
        </div>
      ) : (
        <table className="roster-table">
          <thead>
            <tr>
              <th>Coach</th>
              <th>School</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coaches.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="name-cell">
                    <div className="jersey">{initials(c.name || '?')}</div>
                    <div>
                      <div className="name-main">{c.name}</div>
                      <div className="name-sub">{c.email || ''}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {c.school}
                  <div className="name-sub">
                    {c.sport || ''} {c.sport && c.level ? '·' : ''} {c.level || ''}
                  </div>
                </td>
                <td>
                  <select
                    className={`status-select status-${c.status}`}
                    value={c.status}
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" title="Compose email" onClick={() => openCompose(c)}>
                      ✉
                    </button>
                    <button className="icon-btn" title="Edit" onClick={() => openEditCoach(c)}>
                      ✎
                    </button>
                    <button className="icon-btn" title="Delete" onClick={() => deleteCoach(c.id)}>
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {coachModalOpen && (
        <div className="modal-overlay" onClick={() => setCoachModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCoachId ? 'Edit Coach' : 'Add Coach'}</h3>
            <form onSubmit={saveCoach}>
              <div className="field-row">
                <div className="field">
                  <label>Coach name</label>
                  <input value={coachForm.name} onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })} />
                </div>
                <div className="field">
                  <label>School</label>
                  <input value={coachForm.school} onChange={(e) => setCoachForm({ ...coachForm, school: e.target.value })} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Sport / program</label>
                  <input value={coachForm.sport} onChange={(e) => setCoachForm({ ...coachForm, sport: e.target.value })} />
                </div>
                <div className="field">
                  <label>Level</label>
                  <select value={coachForm.level} onChange={(e) => setCoachForm({ ...coachForm, level: e.target.value })}>
                    {LEVEL_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={coachForm.email}
                    onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={coachForm.status} onChange={(e) => setCoachForm({ ...coachForm, status: e.target.value })}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea
                  value={coachForm.notes}
                  onChange={(e) => setCoachForm({ ...coachForm, notes: e.target.value })}
                  placeholder="Camp attended, mutual contacts, roster needs..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setCoachModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn gold">
                  Save Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {composeOpen && (
        <div className="modal-overlay" onClick={() => setComposeOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Compose Email</h3>
            <div className="field">
              <label>To</label>
              <input value={composeCoach?.email || '(no email on file)'} readOnly />
            </div>
            <div className="field">
              <label>Template</label>
              <select value={composeTemplateId} onChange={(e) => onComposeTemplateChange(e.target.value)}>
                {DEFAULT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Subject</label>
              <input value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} />
            </div>
            <div className="field">
              <label>Body</label>
              <textarea style={{ minHeight: 160 }} value={composeBody} onChange={(e) => setComposeBody(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setComposeOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn ghost" onClick={copyCompose}>
                Copy Text
              </button>
              <button type="button" className="btn gold" onClick={sendCompose}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
