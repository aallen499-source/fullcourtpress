'use client';

import { useState } from 'react';
import styles from './outreach.module.css';

// UTC, deliberately. Postgres hands these back as UTC timestamps and the SQL
// editor prints ::date in UTC too, so formatting in local time would make this
// page show "Oct 29" for the row Supabase calls Oct 30. Cross-checking a date
// between the two should never need a timezone conversion in her head.
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '';

function Card({ person, limit }) {
  const [subject, setSubject] = useState(person.subject);
  const [body, setBody] = useState(person.body);
  // Two-step send. The first click arms it and shows the address, the second
  // actually sends. Nothing outgoing should ever be one stray click away.
  const [armed, setArmed] = useState(false);
  const [state, setState] = useState(person.sentAt ? 'sent' : 'idle');
  const [note, setNote] = useState(person.sentAt ? `Sent ${fmt(person.sentAt)}` : '');
  const [resend, setResend] = useState(false);

  const mailto =
    `mailto:${encodeURIComponent(person.email)}` +
    `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  async function send(again) {
    setState('sending');
    setNote('');
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: person.id, kind: person.kind, subject, body, again }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setState('idle');
        setResend(true);
        setNote(`Already sent on ${fmt(json.sentAt)}. Send it again anyway?`);
        return;
      }
      if (!res.ok) {
        setState('idle');
        setNote(json.error || `Failed (${res.status}).`);
        return;
      }
      setState('sent');
      setResend(false);
      setNote(json.warning ? `${json.warning}` : `Sent to ${json.to}`);
    } catch (e) {
      setState('idle');
      setNote(e.message || 'Could not reach the server.');
    } finally {
      setArmed(false);
    }
  }

  return (
    <div className={`${styles.card}${person.blocked ? ' ' + styles.urgent : ''}`}>
      <div className={styles.head}>
        <div>
          <div className={styles.who}>{person.name || person.email}</div>
          <div className={styles.meta}>
            {person.email}
            {person.name ? ` · signed up ${fmt(person.signedUp)}` : ''}
          </div>
        </div>
        <div className={styles.stats}>
          <span className={person.blocked ? styles.pillHot : styles.pill}>
            {person.coaches} {person.coaches === 1 ? 'coach' : 'coaches'}
            {person.blocked ? ` · at the ${limit} cap` : ''}
          </span>
          {person.published && <span className={styles.pill}>published</span>}
          {person.plan && <span className={styles.pill}>{person.plan}</span>}
          {person.renews && <span className={styles.pill}>renews {fmt(person.renews)}</span>}
        </div>
      </div>

      <label className={styles.label}>Subject</label>
      <input className={styles.input} value={subject} onChange={(e) => setSubject(e.target.value)} />

      <label className={styles.label}>Message</label>
      <textarea
        className={styles.textarea}
        rows={18}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className={styles.hint}>
        Sent as plain text, exactly as written here, from info@recruitgrid.app. Replies come
        straight back to you.
      </div>

      <div className={styles.actions}>
        {state === 'sent' && !resend ? (
          <span className={styles.done}>{note || 'Sent'}</span>
        ) : armed ? (
          <>
            <button className={styles.send} onClick={() => send(resend)} disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending...' : `Yes, send to ${person.email}`}
            </button>
            <button className={styles.ghost} onClick={() => setArmed(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className={styles.send} onClick={() => setArmed(true)}>
              {resend ? 'Send again' : 'Send'}
            </button>
            <a className={styles.ghost} href={mailto}>Open in my mail app</a>
            <button
              className={styles.ghost}
              onClick={() => navigator.clipboard?.writeText(`${subject}\n\n${body}`)}
            >
              Copy
            </button>
          </>
        )}
        {note && state !== 'sent' && <span className={styles.note}>{note}</span>}
      </div>
    </div>
  );
}

function Section({ title, blurb, people, limit, empty }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>
        {title} <span className={styles.count}>{people.length}</span>
      </h2>
      <p className={styles.blurb}>{blurb}</p>
      {people.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        people.map((p) => <Card key={p.id} person={p} limit={limit} />)
      )}
    </section>
  );
}

export default function OutreachClient({ wall, stalled, limit }) {
  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        <a className={styles.back} href="/app">← Back to RecruitGrid</a>
        <h1 className={styles.title}>Outreach</h1>
        <p className={styles.lede}>
          Two lists the database can find on its own: families who have done the work and hit a
          wall, and people who paid and never started. Both drafts are editable. Nothing goes
          out until you press send twice.
        </p>

        <Section
          title="At the wall"
          blurb={`Free accounts with ${8}+ coaches. Anyone at ${limit} is blocked from adding another right now, which makes them the warmest conversation in the product.`}
          people={wall}
          limit={limit}
          empty="Nobody is near the cap at the moment."
        />

        <Section
          title="Paid, never started"
          blurb="Active subscriptions with no coaches on the roster. They are paying and getting nothing, so these are worth more than any new signup."
          people={stalled}
          limit={limit}
          empty="Everyone who has paid has started. Good."
        />
      </div>
    </main>
  );
}
