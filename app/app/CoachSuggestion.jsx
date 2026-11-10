'use client';

import { useEffect, useRef, useState } from 'react';

// The suggestion under the add-coach form's email field.
//
// Of 46 coaches real athletes had saved by 2026-11-10, 16 had an address,
// and the send screen silently disables the rest. Two families with a
// working staff-page link for every school still came back with nothing:
// the task was "find the right person in a sixty-row list", not "find the
// page". This does that task and shows its work.
//
// Rules, in order of how much they matter:
//   - Never auto-filled. The athlete taps "Use this".
//   - Always shows WHERE it came from and WHEN it was read. Coaches change
//     jobs every spring; a suggestion with no date is a guess.
//   - A staff contact is labelled as one. Big programs publish no address
//     for any coach and route recruiting mail through operations; the
//     operations director is the right person to write to, and must not be
//     presented as a coach.
//   - Says so when the page lists coaches and publishes no addresses. That
//     is information, not a failure to suggest.
//
// Slim on purpose. It is one line of context and one button, under the
// field it fills, not a panel.

const fmt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
};
const host = (url) => { try { return new URL(url).host.replace(/^www\./, ''); } catch { return ''; } };

export default function CoachSuggestion({ school, level, sport, gender, email, onUse }) {
  const [state, setState] = useState({ status: 'idle', data: null });
  const timer = useRef(null);
  const latest = useRef('');

  const key = `${(school || '').trim()}|${level || ''}|${sport || ''}|${gender || ''}`;
  const wanted = !(email || '').trim() && (school || '').trim().length >= 3 && !!(sport || '').trim();

  useEffect(() => {
    if (!wanted) { setState({ status: 'idle', data: null }); return; }
    latest.current = key;
    clearTimeout(timer.current);
    // Debounced: the school field is typed into, and a request per keystroke
    // would be a request per letter of "Massachusetts".
    timer.current = setTimeout(async () => {
      setState({ status: 'loading', data: null });
      try {
        const qs = new URLSearchParams({ school: school.trim(), level: level || '', sport: sport || '', gender: gender || '' });
        const res = await fetch(`/api/coach-suggest?${qs}`);
        const json = await res.json().catch(() => ({}));
        if (latest.current !== key) return; // a newer request superseded this one
        setState({ status: res.ok ? 'done' : 'error', data: json });
      } catch {
        if (latest.current === key) setState({ status: 'error', data: null });
      }
    }, 450);
    return () => clearTimeout(timer.current);
  }, [key, wanted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!wanted || state.status === 'idle' || state.status === 'error') return null;
  if (state.status === 'loading') return <div className="hint" style={{ marginTop: 6 }}>Looking up {school.trim()}&apos;s staff…</div>;

  const d = state.data || {};
  if (!d.url || d.reason === 'no-directory' || d.reason === 'no-sport') return null;

  const source = (
    <span style={{ opacity: 0.75 }}>
      from <a className="staff-link" href={d.url} target="_blank" rel="noopener noreferrer">{host(d.url)} ↗</a>
      {d.checkedAt ? `, checked ${fmt(d.checkedAt)}` : ''}
    </span>
  );

  if (!d.best) {
    const n = d.unlisted?.length || 0;
    return (
      <div className="hint" style={{ marginTop: 6 }}>
        {n
          ? <>{school.trim()} lists {n} {sport.toLowerCase()} {n === 1 ? 'coach' : 'coaches'} and publishes no email for {n === 1 ? 'them' : 'any of them'}. </>
          : <>No {sport.toLowerCase()} coach found on {school.trim()}&apos;s staff page. </>}
        {source}
      </div>
    );
  }

  const b = d.best;
  const more = (d.coaches?.length || 0) - (b.kind === 'coach' ? 1 : 0);
  return (
    <div style={{ marginTop: 8, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13.5, lineHeight: 1.55 }}>
      {b.kind === 'staff' && (
        <div style={{ color: 'var(--sub)', marginBottom: 4 }}>
          No coach address is published for {school.trim()} {sport.toLowerCase()}. Their program contact:
        </div>
      )}
      <div>
        <b>{b.name}</b>{b.title ? <span style={{ color: 'var(--sub)' }}> · {b.title}</span> : null}
      </div>
      <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 }}>{b.email}</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
        <button type="button" className="btn gold" style={{ padding: '5px 12px', fontSize: 13 }} onClick={() => onUse({ name: b.name, email: b.email })}>
          Use this
        </button>
        <span className="hint" style={{ margin: 0 }}>
          {source}
          {more > 0 ? <>{' · '}{more} more with {more === 1 ? 'an address' : 'addresses'} on that page</> : null}
        </span>
      </div>
    </div>
  );
}
