'use client';

import { useState } from 'react';
import { staffDirectoryFor, staffSearchFor } from '@/lib/staff-directory';
import { STATE_NAMES } from '@/lib/questionnaire-directory';

// Three minutes from sign-in to coach-ready.
//
// As of 2026-09-09, 2 of 22 accounts had published a profile. Everything else
// in RecruitGrid — the profile link in every email, open alerts, "On your
// list", the parent update — depends on a published profile and a few schools,
// and the long My Info form was where people stopped. This asks only for what
// a coach needs to see, one short screen at a time, shows the profile the way
// a coach will, publishes it, and starts the list.
//
// Every step saves as it goes, so closing halfway loses nothing, and every
// step past the first can be skipped. The full My Info form is still there
// for everything else.

const SPORTS = ['Basketball', 'Baseball', 'Football', 'Soccer', 'Softball', 'Tennis', 'Track & Field', 'Volleyball'];
const LEVELS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];
const LANES = [['dream', 'Dream'], ['target', 'Target'], ['safety', 'Safety']];

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

export default function SetupWizard({ supabase, user, infoForm, film, alreadyPublished = false, publishedSlug = '', onProfileSaved, onFilmAdded, onCoachesAdded, onChooseCoach, onClose, onFinish }) {
  const thisYear = new Date().getFullYear();
  const gradYears = Array.from({ length: 7 }, (_, i) => String(thisYear + i));
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Anything the 60-second quiz already asked (app/quiz) is carried over, so a
  // family that came in that way types less. Their own saved profile always
  // wins; the quiz only fills blanks.
  const [quiz] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rg-quiz') || '{}') || {}; } catch { return {}; }
  });
  const quizProfile = quiz.profile || {};
  const quizLanes = Array.isArray(quiz.lanes) ? quiz.lanes : [];
  const [f, setF] = useState({
    name: infoForm.name || '',
    gradYear: infoForm.gradYear || quizProfile.gradYear || '',
    sport: infoForm.sport || quizProfile.sport || '',
    position: infoForm.position || '',
    height: infoForm.height || '',
    school: infoForm.school || '',
    schoolCity: infoForm.schoolCity || '',
    schoolState: infoForm.schoolState || quizProfile.schoolState || '',
    gpa: infoForm.gpa || quizProfile.gpa || '',
  });
  const [filmUrl, setFilmUrl] = useState('');
  const [filmSaved, setFilmSaved] = useState(false);
  const [publishedHere, setPublishedHere] = useState(false);
  const [slug, setSlug] = useState(slugify(infoForm.name));
  const [slugTouched, setSlugTouched] = useState(false);
  const [schools, setSchools] = useState([
    { school: '', level: 'D2', tier: 'target' },
    { school: '', level: 'D2', tier: 'target' },
    { school: '', level: 'NAIA', tier: 'safety' },
  ]);
  const set = (patch) => {
    setF((prev) => ({ ...prev, ...patch }));
    if (patch.name !== undefined && !slugTouched) setSlug(slugify(patch.name));
  };
  const hasFilm = film.length > 0 || filmSaved;
  const STEPS = 5;

  async function saveProfile(extra = {}) {
    const row = {
      id: user.id,
      role: 'athlete',
      name: f.name.trim(),
      grad_year: f.gradYear,
      sport: f.sport,
      position: f.position.trim(),
      height: f.height.trim(),
      school: f.school.trim(),
      school_city: f.schoolCity.trim(),
      school_state: f.schoolState,
      gpa: f.gpa.trim(),
      ...extra,
    };
    const { error: err } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
    if (err) return err;
    onProfileSaved(row);
    return null;
  }

  async function next(action) {
    setError('');
    setBusy(true);
    try {
      if (step === 1) {
        if (!f.name.trim() || !f.gradYear || !f.sport) {
          setError('Add your name, graduation year and sport to keep going.');
          return;
        }
        const err = await saveProfile();
        if (err) return setError("Couldn't save: " + err.message);
      }
      if (step === 2) {
        const err = await saveProfile();
        if (err) return setError("Couldn't save: " + err.message);
      }
      if (step === 3 && action !== 'skip' && filmUrl.trim()) {
        const url = filmUrl.trim();
        if (!/^https?:\/\/\S+\.\S+/.test(url)) return setError('Paste the full link, starting with https://');
        const { data, error: err } = await supabase
          .from('film')
          .insert({ user_id: user.id, title: 'Highlights', url, sport: f.sport, description: '' })
          .select()
          .single();
        if (err) return setError("Couldn't save the film link: " + err.message);
        onFilmAdded(data);
        setFilmSaved(true);
        setFilmUrl('');
      }
      if (step === 4 && action !== 'skip') {
        const s = slugify(slug);
        if (!s) return setError('Pick a web address for your profile (letters, numbers and dashes).');
        const err = await saveProfile({ public_slug: s, public_published: true });
        if (err) {
          if (err.code === '23505') {
            const suggestion = slugify(`${s}-${f.gradYear || thisYear}`);
            setSlug(suggestion);
            setSlugTouched(true);
            return setError(`recruitgrid.app/${s} is taken. How about recruitgrid.app/${suggestion}?`);
          }
          return setError("Couldn't publish: " + err.message);
        }
        setPublishedHere(true);
      }
      if (step === 5 && action !== 'skip') {
        const rows = schools
          .filter((r) => r.school.trim().length >= 2)
          .map((r) => ({
            user_id: user.id,
            name: 'Coaching Staff',
            school: r.school.trim(),
            level: r.level,
            tier: r.tier,
            sport: f.sport,
            status: 'not_contacted',
          }));
        if (rows.length) {
          const { data, error: err } = await supabase.from('coaches').insert(rows).select();
          if (err) return setError("Couldn't add those schools: " + err.message);
          onCoachesAdded(data || []);
        }
      }
      setStep((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }

  const back = () => {
    setError('');
    setStep((n) => Math.max(0, n - 1));
  };

  const progress = step >= 1 && step <= STEPS && (
    <div className="setup-progress" aria-label={`Step ${step} of ${STEPS}`}>
      {Array.from({ length: STEPS }, (_, i) => (
        <span key={i} className={i < step ? 'on' : ''} />
      ))}
    </div>
  );

  const actions = (primary, { skip = false, primaryDisabled = false } = {}) => (
    <>
      {error && <p className="setup-error">{error}</p>}
      <div className="modal-actions" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn ghost" onClick={back} disabled={busy}>Back</button>
        {skip && (
          <button type="button" className="btn ghost" onClick={() => next('skip')} disabled={busy}>
            Skip for now
          </button>
        )}
        <button type="button" className="btn gold" onClick={() => next()} disabled={busy || primaryDisabled}>
          {busy ? 'Saving…' : primary}
        </button>
      </div>
    </>
  );

  const vitals = [f.gradYear && `Class of ${f.gradYear}`, f.position, f.height].filter(Boolean).join(' · ');
  const schoolLine = [f.school, [f.schoolCity, f.schoolState].filter(Boolean).join(', ')].filter(Boolean).join(' · ');

  return (
    <div className="modal-overlay">
      <div className="modal setup-modal" onClick={(e) => e.stopPropagation()}>
        {progress}

        {step === 0 && (
          <>
            <h3>Get coach-ready in 3 minutes</h3>
            <p className="setup-lead">Five quick screens. When you finish you&apos;ll have:</p>
            <ul className="setup-list">
              <li><b>A recruiting profile page</b> with your film and details, ready to link in every email</li>
              <li><b>Your first three schools</b>, each linked to its coaching staff</li>
              <li><b>Alerts when a coach opens your profile</b>, so you know when to follow up</li>
            </ul>
            <p className="hint" style={{ marginTop: 10 }}>Everything saves as you go. After the first screen, you can skip any step.</p>
            <div className="modal-actions" style={{ flexWrap: 'wrap' }}>
              <button type="button" className="btn ghost" onClick={onClose}>Look around first</button>
              <button type="button" className="btn gold" onClick={() => setStep(1)}>Let&apos;s go →</button>
            </div>
            <button type="button" className="setup-link" onClick={onChooseCoach}>
              I&apos;m a club or team coach, not an athlete
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h3>Who you are</h3>
            <div className="field">
              <label>Your full name</label>
              <input autoFocus value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="First and last name" />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Graduation year</label>
                <select value={f.gradYear} onChange={(e) => set({ gradYear: e.target.value })}>
                  <option value="">Choose…</option>
                  {gradYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Sport</label>
                <select value={SPORTS.includes(f.sport) ? f.sport : f.sport ? '__other' : ''} onChange={(e) => set({ sport: e.target.value === '__other' ? f.sport : e.target.value })}>
                  <option value="">Choose…</option>
                  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  {f.sport && !SPORTS.includes(f.sport) && <option value="__other">{f.sport}</option>}
                </select>
              </div>
            </div>
            {actions('Next →')}
          </>
        )}

        {step === 2 && (
          <>
            <h3>What a coach looks for first</h3>
            <div className="field-row">
              <div className="field">
                <label>Position</label>
                <input autoFocus value={f.position} onChange={(e) => set({ position: e.target.value })} placeholder="e.g. PG, Shortstop, Setter" />
              </div>
              <div className="field">
                <label>Height</label>
                <input value={f.height} onChange={(e) => set({ height: e.target.value })} placeholder={`e.g. 6'2"`} />
              </div>
            </div>
            <div className="field">
              <label>High school</label>
              <input value={f.school} onChange={(e) => set({ school: e.target.value })} placeholder="e.g. Durango High School" />
            </div>
            <div className="field-row" style={{ gridTemplateColumns: 'minmax(0, 1fr) 96px 96px' }}>
              <div className="field">
                <label>City</label>
                <input value={f.schoolCity} onChange={(e) => set({ schoolCity: e.target.value })} placeholder="e.g. Las Vegas" />
              </div>
              <div className="field">
                <label>State</label>
                <select value={f.schoolState} onChange={(e) => set({ schoolState: e.target.value })}>
                  <option value="">—</option>
                  {Object.keys(STATE_NAMES).sort().map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="field">
                <label>GPA</label>
                <input value={f.gpa} onChange={(e) => set({ gpa: e.target.value })} placeholder="3.5" />
              </div>
            </div>
            {actions('Next →')}
          </>
        )}

        {step === 3 && (
          <>
            <h3>Your film</h3>
            {film.length > 0 ? (
              <p className="setup-lead">You already have film saved — nice. Add another link, or keep going.</p>
            ) : (
              <p className="setup-lead">One link is enough to start. Coaches open film before anything else.</p>
            )}
            <div className="field">
              <label>Hudl or YouTube link</label>
              <input autoFocus type="url" value={filmUrl} onChange={(e) => setFilmUrl(e.target.value)} placeholder="https://www.hudl.com/video/…" />
            </div>
            <p className="hint">No highlight video yet? A link to a full game works too — or skip this and add film later from the Film tab.</p>
            {actions(filmUrl.trim() ? 'Save & next →' : 'Next →', { skip: !film.length })}
          </>
        )}

        {step === 4 && (
          <>
            <h3>Your profile</h3>
            <p className="setup-lead">This is roughly what a coach sees when they open your link.</p>
            <div className="setup-preview">
              <div className="setup-preview-name">{f.name || 'Your name'}</div>
              <div className="setup-preview-vitals">{[f.sport, vitals].filter(Boolean).join(' · ') || 'Sport · Class · Position · Height'}</div>
              {schoolLine && <div className="setup-preview-line">{schoolLine}</div>}
              {f.gpa && <div className="setup-preview-line">{f.gpa} GPA</div>}
              <div className="setup-preview-line">{hasFilm ? '▶ Film' : 'No film yet — you can add it later'}</div>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Your profile&apos;s web address</label>
              <div className="setup-slug">
                <span>recruitgrid.app/</span>
                <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
              </div>
            </div>
            <p className="hint">It&apos;s hidden from Google — only people you send the link to will see it. You can take it down any time.</p>
            {actions('Publish my profile →', { skip: true })}
          </>
        )}

        {step === 5 && (
          <>
            <h3>Your first three schools</h3>
            <p className="setup-lead">Start with two schools that feel like a realistic fit and one that&apos;s a sure thing. You can change them any time.</p>
            {quizLanes.length > 0 && (
              <div className="setup-quiz-lanes">
                <b>From your quiz:</b>{' '}
                {quizLanes.map((l, i) => (
                  <span key={l.tier}>
                    {i > 0 && ' · '}
                    {LANES.find(([v]) => v === l.tier)?.[1]}: {l.text}
                  </span>
                ))}
              </div>
            )}
            {schools.map((r, i) => {
              const dir = r.school.trim().length >= 3 ? staffDirectoryFor(r.school, { level: r.level }) : '';
              return (
                <div key={i} className="setup-school">
                  <input
                    autoFocus={i === 0}
                    value={r.school}
                    onChange={(e) => setSchools((all) => all.map((x, j) => (j === i ? { ...x, school: e.target.value } : x)))}
                    placeholder={['e.g. Western Oregon University', 'Another school', 'A sure thing'][i]}
                  />
                  <select value={r.level} onChange={(e) => setSchools((all) => all.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))}>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select value={r.tier} onChange={(e) => setSchools((all) => all.map((x, j) => (j === i ? { ...x, tier: e.target.value } : x)))}>
                    {LANES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  {r.school.trim().length >= 3 && (
                    <a className="staff-link setup-school-link" href={dir || staffSearchFor(r.school, f.sport)} target="_blank" rel="noopener noreferrer">
                      {dir ? 'Coaching staff ↗' : 'Search for the coaching staff ↗'}
                    </a>
                  )}
                </div>
              );
            })}
            <p className="hint">Don&apos;t know the coach yet? That&apos;s fine — each school is added now, and the link opens its staff page so you can fill in the coach&apos;s name and email after.</p>
            {actions('Add schools & finish →', { skip: true })}
          </>
        )}

        {step === 6 && (
          <>
            <h3>You&apos;re coach-ready</h3>
            <ul className="setup-list">
              <li>
                {publishedHere || alreadyPublished ? <>Your profile is <b>live at recruitgrid.app/{publishedHere ? slugify(slug) : publishedSlug}</b></> : <>Your details are saved — publish your profile from <b>My Info</b> when you&apos;re ready</>}
              </li>
              <li>Your schools are on your <b>Roster</b></li>
              <li>When a coach opens the profile link you send, you&apos;ll get an email</li>
            </ul>
            <p className="setup-lead" style={{ marginTop: 12 }}>
              <b>Next:</b> open a school&apos;s staff page, add the coach&apos;s name and email, then use <b>✉ Write to coaches</b> to send your first emails.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn gold" onClick={onFinish}>Go to my roster →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
