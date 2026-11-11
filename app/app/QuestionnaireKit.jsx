'use client';

import { useEffect, useState } from 'react';

// The questionnaire kit: every answer a school's prospect form asks for, as a
// row of tap-to-copy chips, in roughly the order the forms ask.
//
// Why chips and not one block of text: the forms are field by field, so a
// single copied block means switching back here for every field anyway. One
// tap copies one value, the next chip lights up, and the family works down
// the form without retyping a thing. "Copy all" keeps the block for forms
// with a free-text box.
//
// The values are the athlete's own My Info, nothing fetched. If a chip is
// missing, the field is empty in My Info; the kit says so rather than
// showing a blank chip.

const CHIP = {
  display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1,
  padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--paper)',
  cursor: 'pointer', font: 'inherit', color: 'inherit', textAlign: 'left', maxWidth: '100%',
};
const LABEL = { fontSize: 10.5, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 700 };
const VALUE = { fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 };

/**
 * @param {object} props
 * @param {Array<{key: string, label: string, value: string}>} props.fields  non-empty values only
 * @param {() => void} [props.onCopyAll]
 * @param {boolean} [props.copiedAll]
 * @param {string} [props.title]
 */
export default function QuestionnaireKit({ fields, onCopyAll, copiedAll = false, title = 'Questionnaire kit' }) {
  const [copied, setCopied] = useState('');
  const [nextKey, setNextKey] = useState('');
  const [fallback, setFallback] = useState('');

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(''), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy(field, index) {
    try {
      await navigator.clipboard.writeText(field.value);
      setCopied(field.key);
      setNextKey(fields[index + 1]?.key || '');
      setFallback('');
    } catch {
      // Clipboard blocked (some in-app browsers). Show the value so it can be
      // selected by hand, which is still faster than finding it in My Info.
      setFallback(field.value);
    }
  }

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, background: 'var(--bg, transparent)', padding: '12px 14px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <b style={{ fontSize: 13.5 }}>{title}</b>
        <span className="hint" style={{ margin: 0, fontSize: 12.5 }}>
          Tap a value to copy it, paste it in the form, come back for the next one.
        </span>
        {onCopyAll && fields.length > 0 && (
          <button type="button" className="btn ghost small" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }} onClick={onCopyAll}>
            {copiedAll ? 'Copied ✓' : 'Copy all'}
          </button>
        )}
      </div>
      {fields.length === 0 ? (
        <div className="hint" style={{ margin: 0 }}>
          Nothing to copy yet. Fill in My Info and each answer shows up here as a chip.
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {fields.map((f, i) => {
            const isCopied = copied === f.key;
            const isNext = !isCopied && nextKey === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => copy(f, i)}
                title={`Copy ${f.label.toLowerCase()}`}
                aria-label={`Copy ${f.label}: ${f.value}`}
                style={{
                  ...CHIP,
                  borderColor: isCopied ? 'var(--green, #3f7a4e)' : isNext ? 'var(--gold, #c9a227)' : 'var(--line)',
                  boxShadow: isNext ? '0 0 0 1px var(--gold, #c9a227)' : 'none',
                }}
              >
                <span style={LABEL}>{isCopied ? 'Copied ✓' : isNext ? `Next · ${f.label}` : f.label}</span>
                <span style={VALUE}>{f.value}</span>
              </button>
            );
          })}
        </div>
      )}
      {fallback && (
        <div className="hint" style={{ marginTop: 8, marginBottom: 0 }}>
          Copy blocked by the browser. Select this instead: <code style={{ userSelect: 'all' }}>{fallback}</code>
        </div>
      )}
    </div>
  );
}
