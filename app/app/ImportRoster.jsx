'use client';

import { useMemo, useState } from 'react';
import { parseTable, buildImport, MAX_ROWS } from '@/lib/roster-import';

// Bring a list kept somewhere else onto the roster in one go: a paste from a
// spreadsheet, a CSV file or a plain list of schools. Parsing and every
// decision about a row live in lib/roster-import.js; this is the window.
// The insert itself is the page's (onImport), so this never touches the
// database and can be shown with sample data.

const LEVEL = { D1: 'D1', D2: 'D2', D3: 'D3', NAIA: 'NAIA', JUCO: 'JUCO', 'Club/Other': 'Club/Other' };
const TIER = { dream: 'Dream', target: 'Target', safety: 'Safety' };
const FIELD_LABEL = { school: 'School', name: 'Coach', email: 'Email', sport: 'Sport', level: 'Level', tier: 'Lane', status: 'Status', notes: 'Notes' };

/**
 * @param {object} props
 * @param {Array}  props.existing        current roster rows, to skip duplicates
 * @param {string} [props.defaultSport]  for rows whose sheet names no sport
 * @param {(rows: object[]) => Promise<{added: number, error?: string}>} props.onImport
 * @param {() => void} props.onClose
 */
export default function ImportRoster({ existing, defaultSport = '', onImport, onClose }) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const plan = useMemo(
    () => (text.trim() ? buildImport(parseTable(text), { existing, defaultSport }) : null),
    [text, existing, defaultSport]
  );
  const count = plan?.rows.length || 0;
  const already = plan?.skipped.filter((s) => s.reason === 'already on your roster').length || 0;
  const noSchool = plan?.skipped.filter((s) => s.reason === 'no school').length || 0;

  async function readFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (/\.(xlsx|xls|numbers)$/i.test(file.name)) {
      setResult({ error: 'That is a spreadsheet file. Open it, choose File, then Download or Save As, then CSV, and upload that.' });
      return;
    }
    setResult(null);
    setFileName(file.name);
    setText(await file.text());
  }

  async function go() {
    if (!count || busy) return;
    setBusy(true);
    const r = await onImport(plan.rows);
    setBusy(false);
    setResult(r);
  }

  if (result && !result.error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>Added {result.added} {result.added === 1 ? 'school' : 'schools'} to your roster</h3>
          <p className="hint" style={{ marginBottom: 0 }}>
            Rows without a coach are listed as Coaching Staff. Open one and the coach&apos;s address shows up under
            the email box when the school publishes one.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn gold" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <h3>Import your list</h3>
        <p className="hint" style={{ marginTop: 0 }}>
          Copy the rows from Google Sheets or Excel and paste them here, or upload a CSV. A header row helps
          (School, Coach, Email, Level, Lane, Status, Notes), but only the school is needed. A plain list of
          schools, one per line, works too.
        </p>

        <div className="field">
          <label htmlFor="import-paste">Paste your list</label>
          <textarea
            id="import-paste"
            rows={7}
            value={text}
            onChange={(e) => { setText(e.target.value); setFileName(''); setResult(null); }}
            placeholder={'School, Coach, Email\nExample University, Jordan Smith, jsmith@example.edu\nSample State University'}
            style={{ fontFamily: 'var(--font-mono-fcp, monospace)', fontSize: 13 }}
          />
        </div>
        <div className="field">
          <label htmlFor="import-file">Or upload a CSV</label>
          <input id="import-file" type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,.numbers,text/csv,text/plain" onChange={readFile} />
          {fileName && <div className="field-sub">Read {fileName}</div>}
        </div>

        {plan && (
          <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', marginTop: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {count ? `Ready to add ${count} ${count === 1 ? 'row' : 'rows'}` : 'Nothing new to add'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6, marginTop: 4 }}>
              {already > 0 && <div>{already} already on your roster, skipped.</div>}
              {noSchool > 0 && <div>{noSchool} with no school, skipped.</div>}
              {plan.truncated && <div>Only the first {MAX_ROWS} are read in one go. Import the rest after.</div>}
              {plan.headerless ? (
                <div>No header row found, so the first column is read as the school.</div>
              ) : (
                <div>
                  Read as:{' '}
                  {Object.entries(plan.columns).map(([f, h]) => `${FIELD_LABEL[f]} from "${h}"`).join(', ')}.
                </div>
              )}
              {!plan.headerless && !('sport' in plan.columns) && (
                <div>Sport: {defaultSport ? `${defaultSport} for every row, from your profile.` : 'left blank. Add it per school later.'}</div>
              )}
            </div>
            {count > 0 && (
              <div style={{ overflowX: 'auto', marginTop: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--sub)' }}>
                      <th style={{ padding: '4px 8px 4px 0' }}>School</th>
                      <th style={{ padding: '4px 8px' }}>Coach</th>
                      <th style={{ padding: '4px 8px' }}>Email</th>
                      <th style={{ padding: '4px 8px' }}>Level</th>
                      <th style={{ padding: '4px 0 4px 8px' }}>Lane</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.rows.slice(0, 6).map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '5px 8px 5px 0', fontWeight: 600 }}>{r.school}</td>
                        <td style={{ padding: '5px 8px' }}>{r.name}</td>
                        <td style={{ padding: '5px 8px', overflowWrap: 'anywhere' }}>{r.email || ''}</td>
                        <td style={{ padding: '5px 8px' }}>{LEVEL[r.level] || ''}</td>
                        <td style={{ padding: '5px 0 5px 8px' }}>{TIER[r.tier]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {count > 6 && <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 6 }}>and {count - 6} more</div>}
              </div>
            )}
          </div>
        )}

        {result?.error && <p role="alert" className="hint" style={{ color: 'var(--red)', marginBottom: 0 }}>{result.error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn gold" onClick={go} disabled={!count || busy}>
            {busy ? 'Adding…' : count ? `Add ${count} to my roster` : 'Add to my roster'}
          </button>
        </div>
      </div>
    </div>
  );
}
