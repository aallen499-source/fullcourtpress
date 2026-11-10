'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { STATE_NAMES } from '@/lib/questionnaire-directory';
import styles from './finder.module.css';

// The Coach Finder's screen. Filters on the left of each row of thought,
// results as one line per school: who to write to, their address, where it
// was read and when. "Add to roster" drops the coach straight into the
// athlete's roster with the address filled, which is the whole point.
//
// The data arrives already chosen: one best contact per school, coach
// before staff, recruiting coordinator before head coach (lib/coach-finder,
// lib/coach-suggest). A staff contact is labelled as one.

const SPORTS = [
  ['basketball', 'Basketball'], ['football', 'Football'], ['volleyball', 'Volleyball'],
  ['softball', 'Softball'], ['baseball', 'Baseball'], ['soccer', 'Soccer'],
  ['track', 'Track & Field / Cross Country'], ['lacrosse', 'Lacrosse'], ['wrestling', 'Wrestling'],
  ['golf', 'Golf'], ['tennis', 'Tennis'], ['swimming', 'Swimming & Diving'],
  ['hockey', 'Ice Hockey'], ['field hockey', 'Field Hockey'], ['rowing', 'Rowing'], ['gymnastics', 'Gymnastics'],
];
const DIVISIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO', 'NCAA'];
const DIVISION_LABEL = { NCAA: 'NCAA, division not listed' };
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : '');
const host = (u) => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return ''; } };

// The app's sport names map onto the finder's keys loosely on purpose:
// "Track & Field" -> track, "Girls Volleyball" -> volleyball.
const keyFor = (name) => SPORTS.find(([k]) => new RegExp(`\\b${k.split(' ')[0]}`, 'i').test(name || ''))?.[0] || '';

export default function FinderClient({ defaultSport = '', defaultGender = '' }) {
  const [sport, setSport] = useState(keyFor(defaultSport) || 'basketball');
  const [gender, setGender] = useState(defaultGender);
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [state, setState] = useState({ status: 'idle', data: null });
  const [added, setAdded] = useState({}); // school -> 'ok' | message
  const timer = useRef(null);

  const query = `${sport}|${gender}|${states.join(',')}|${divisions.join(',')}`;
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setState({ status: 'loading', data: null });
      const qs = new URLSearchParams({ sport, gender, states: states.join(','), divisions: divisions.join(',') });
      try {
        const res = await fetch(`/api/coach-finder?${qs}`);
        const json = await res.json().catch(() => ({}));
        setState({ status: res.ok ? 'done' : 'error', data: json, code: res.status });
      } catch {
        setState({ status: 'error', data: null });
      }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(r) {
    setAdded((a) => ({ ...a, [r.school]: 'adding' }));
    const level = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'].includes(r.division) ? r.division : 'D1';
    const res = await fetch('/api/coach-finder/add', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ school: r.school, level, sport: SPORTS.find(([k]) => k === sport)?.[1] || sport, name: r.best.name, email: r.best.email }),
    });
    const json = await res.json().catch(() => ({}));
    setAdded((a) => ({ ...a, [r.school]: res.ok ? 'ok' : json.error || 'Could not add.' }));
  }

  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const d = state.data || {};
  const results = d.results || [];

  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        <Link className={styles.back} href="/app">← Back to RecruitGrid</Link>
        <h1 className={styles.title}>Coach Finder</h1>
        <p className={styles.lede}>
          One coach per school, with the address the school publishes. Read from each staff page, dated.
          Narrow by state or it&apos;s a long list.
        </p>

        <div className={styles.filters}>
          <label className={styles.lab}>Sport
            <select className={styles.sel} value={sport} onChange={(e) => setSport(e.target.value)}>
              {SPORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label className={styles.lab}>Team
            <select className={styles.sel} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Any</option><option value="women">Women&apos;s</option><option value="men">Men&apos;s</option>
            </select>
          </label>
          <div className={styles.lab}>Division
            <div className={styles.chips}>
              {DIVISIONS.map((v) => (
                <button key={v} type="button" className={divisions.includes(v) ? styles.chipOn : styles.chip} onClick={() => toggle(divisions, setDivisions, v)} title={DIVISION_LABEL[v] || v}>{v}</button>
              ))}
            </div>
          </div>
          <div className={styles.lab}>States
            <div className={styles.chips}>
              {Object.keys(STATE_NAMES).sort().map((s) => (
                <button key={s} type="button" className={states.includes(s) ? styles.chipOn : styles.chip} onClick={() => toggle(states, setStates, s)} title={STATE_NAMES[s]}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          {state.status === 'loading' && 'Looking…'}
          {state.status === 'error' && (d.upgrade ? 'Coach Finder is part of the Athlete plans.' : d.error || 'Something went wrong.')}
          {state.status === 'done' && (
            <>
              {d.count} {d.count === 1 ? 'school' : 'schools'} with a published address
              {states.length ? ` in ${states.join(', ')}` : ''}
              {d.truncated ? ' (showing the first part; add a state to see all of it)' : ''}
            </>
          )}
        </div>

        {state.status === 'done' && results.length > 0 && (
          <div className={styles.list}>
            {results.map((r) => (
              <div className={styles.row} key={r.sourceUrl || r.school}>
                <div className={styles.school}>
                  <div className={styles.schoolName}>{r.school}</div>
                  <div className={styles.meta}>
                    {r.state} · {DIVISION_LABEL[r.division] || r.division}
                    {' · '}<a className={styles.src} href={r.sourceUrl} target="_blank" rel="noopener noreferrer">{host(r.sourceUrl)} ↗</a>
                    {r.checkedAt ? ` · checked ${fmt(r.checkedAt)}` : ''}
                  </div>
                </div>
                <div className={styles.who}>
                  {r.best.kind === 'staff' && <div className={styles.staffNote}>No coach address published. Program contact:</div>}
                  <div><b>{r.best.name}</b>{r.best.title ? <span className={styles.titleTxt}> · {r.best.title}</span> : null}</div>
                  <div className={styles.email}>{r.best.email}</div>
                  {r.coachesWithAddress > 1 && <div className={styles.meta}>{r.coachesWithAddress - 1} more with {r.coachesWithAddress - 1 === 1 ? 'an address' : 'addresses'} on that page</div>}
                </div>
                <div className={styles.act}>
                  {added[r.school] === 'ok' ? (
                    <span className={styles.done}>Added to roster</span>
                  ) : added[r.school] && added[r.school] !== 'adding' ? (
                    <span className={styles.note}>{added[r.school]}</span>
                  ) : (
                    <button type="button" className={styles.gold} disabled={added[r.school] === 'adding'} onClick={() => add(r)}>
                      {added[r.school] === 'adding' ? 'Adding…' : 'Add to roster'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
