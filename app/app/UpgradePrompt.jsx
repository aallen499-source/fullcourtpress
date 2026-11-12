'use client';

// The prompt a free account sees at a limit: the ten-coach roster, the two
// film uploads, or the spreadsheet import.
//
// Rewritten 2026-11-11 after a family wrote back with 130 schools and over
// 2,000 emails kept in another tool and 10 here. The old prompt sold the plan
// with import listed last, "if you already track this somewhere", which was
// the whole reason for a family like that to pay, and it did not exist yet.
// Now it leads with bringing the list over, and the month-to-month price
// comes first because this is the family the monthly plan was made for.
//
// Only what the plan genuinely gates goes in the list. Templates, camp
// reminders and follow-up nudges are free for everyone, and the footnote
// says so, because selling someone what they already have is the fastest
// way to earn a refund and lose trust.

const BOX = { border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 };

/**
 * @param {object} props
 * @param {'coaches'|'film'|'import'} props.reason
 * @param {number} props.freeLimit          free coach slots
 * @param {number} [props.campWindowDays]   how far ahead the free camp list reaches
 * @param {() => void} props.onClose
 * @param {() => void} props.onComparePlans
 * @param {(planId: 'monthly'|'annual') => void} props.onCheckout
 */
export default function UpgradePrompt({ reason, freeLimit, campWindowDays = 45, onClose, onComparePlans, onCheckout }) {
  const roster = reason === 'coaches' || reason === 'import';
  const title =
    reason === 'coaches' ? `You've filled all ${freeLimit} free coach slots`
    : reason === 'import' ? 'Importing a list is on the Athlete plan'
    : "You've used both free film uploads";
  const lead =
    reason === 'coaches' ? 'That means you’re actually working this. Most families never get past three.'
    : reason === 'import' ? 'Paste it from a spreadsheet or upload a CSV, and every school lands on your roster in one go.'
    : 'YouTube and Hudl links stay unlimited on Free, so you can paste one of those instead. The Athlete plan lifts the upload cap if you’d rather host the file here.';

  const checkout = (plan) => { onCheckout(plan); onClose(); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--sub)', margin: '0 0 16px' }}>{lead}</p>

        {reason === 'coaches' && (
          <div style={{ ...BOX, borderColor: 'var(--gold, #c9a227)', background: 'rgba(232,179,60,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Bring your whole list over</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--sub)' }}>
              Keeping schools in a spreadsheet or another app already? Paste the list or upload a CSV and every
              school lands on your roster at once. Nothing to retype.
            </div>
          </div>
        )}

        <div style={BOX}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>The Athlete plan {roster ? 'also ' : ''}adds</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.8, color: 'var(--sub)' }}>
            <li>Unlimited coaches and film uploads</li>
            <li><b>Coach Finder:</b> every coach in your sport, by state and division, with addresses</li>
            <li><b>The full verified camp list:</b> every camp all season, not just the next {campWindowDays} days</li>
            {!roster && <li>Spreadsheet import for your roster</li>}
            <li>Shareable single-clip film links</li>
          </ul>
          <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 10 }}>
            Your email templates, camp reminders and follow-up nudges stay free on every plan.
          </div>
        </div>

        <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: '0 0 6px' }}>
          <b>$12 a month</b>, cancel any time. Or <b>$79 for the year</b>, which saves $65 and costs less than a
          single camp registration.{' '}
          <button
            type="button"
            onClick={() => { onClose(); onComparePlans(); }}
            style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Compare plans
          </button>
        </p>

        <div className="modal-actions" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn ghost" onClick={onClose}>Not now</button>
          <button type="button" className="btn ghost" onClick={() => checkout('annual')}>$79 a year</button>
          <button type="button" className="btn gold" onClick={() => checkout('monthly')}>Start for $12 a month</button>
        </div>
      </div>
    </div>
  );
}
