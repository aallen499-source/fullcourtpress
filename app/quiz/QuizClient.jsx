'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QUESTIONS, quizResult, quizToProfile } from '@/lib/quiz';
import { STATE_NAMES } from '@/lib/questionnaire-directory';

// Nine taps, then a result. Nothing is sent anywhere: the answers live in this
// browser only (localStorage), which is also what lets the setup screens
// prefill from them after someone signs up. No account, no email, no server —
// a family can use it and leave, and that is fine.

const KEY = 'rg-quiz';

function optionsFor(q, thisYear) {
  if (q.options === 'gradYears') {
    const y = thisYear;
    return Array.from({ length: 7 }, (_, i) => [String(y + i), String(y + i)]);
  }
  if (q.options === 'states') {
    return Object.entries(STATE_NAMES).sort((a, b) => a[1].localeCompare(b[1])).map(([abbr, name]) => [abbr, name]);
  }
  return q.options;
}

export default function QuizClient() {
  // Read once: the clock is not something to call while rendering.
  const [thisYear] = useState(() => new Date().getFullYear());
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[step];

  function choose(value) {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step + 1 >= QUESTIONS.length) {
      try {
        localStorage.setItem(KEY, JSON.stringify({ answers: next, profile: quizToProfile(next) }));
      } catch { /* private mode: the result still shows, it just won't prefill */ }
    }
    setStep(step + 1);
  }

  if (!done) {
    const opts = optionsFor(q, thisYear);
    return (
      <main className="quiz-page"><div className="quiz">
        <div className="quiz-head">
          <Link href="/" className="quiz-brand">Recruit<span>Grid</span></Link>
          <span className="quiz-count">{String(step + 1).padStart(2, '0')} / {QUESTIONS.length}</span>
        </div>
        <div className="quiz-bar"><span style={{ width: `${(step / QUESTIONS.length) * 100}%` }} /></div>
        {step === 0 && (
          <>
            <p className="quiz-kicker">9 questions · 60 seconds · no account</p>
            <h1 className="quiz-title">Where do you start?</h1>
            <p className="quiz-lead">
              An honest read of which college levels to look at first, and the next three things to do. We can&apos;t
              tell you whether you can play in college — only coaches watching you can do that.
            </p>
          </>
        )}
        <h2 className="quiz-q">{q.title}</h2>
        <div className={q.options === 'states' || q.options === 'gradYears' ? 'quiz-options grid' : 'quiz-options'}>
          {opts.map(([value, label], i) => (
            <button key={value} type="button" className="quiz-option" onClick={() => choose(value)}>
              {q.options === 'states' || q.options === 'gradYears' ? null : <span className="quiz-num">{i + 1}</span>}
              {label}
            </button>
          ))}
        </div>
        {step > 0 && (
          <button type="button" className="quiz-back" onClick={() => setStep(step - 1)}>← Back</button>
        )}
        </div>
      </main>
    );
  }

  const r = quizResult(answers);
  return (
    <main className="quiz-page"><div className="quiz">
      <div className="quiz-head">
        <Link href="/" className="quiz-brand">Recruit<span>Grid</span></Link>
        <span className="quiz-count">Your result</span>
      </div>
      <h1 className="quiz-title">{r.headline}</h1>
      <p className="quiz-lead">{r.lead}</p>

      <h2 className="quiz-h2">Where to start your list</h2>
      <div className="quiz-lanes">
        {r.lanes.map((l) => (
          <div key={l.tier} className={`quiz-lane tier-${l.tier}`}>
            <div className="quiz-lane-label">{l.label}</div>
            <div className="quiz-lane-text">{l.text}</div>
          </div>
        ))}
      </div>
      <p className="quiz-note">
        Keep all three. A list of only dream schools is a wish, not a plan — and most college athletes play outside
        Division I.
      </p>

      <h2 className="quiz-h2">Do these next</h2>
      <ol className="quiz-steps">
        {r.steps.map((s) => <li key={s}>{s}</li>)}
      </ol>

      {r.notes.length > 0 && (
        <ul className="quiz-notes">
          {r.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}

      <div className="quiz-cta">
        <div>
          <div className="quiz-cta-title">Start the list for free</div>
          <p>
            RecruitGrid keeps your schools in these three lanes, links you to each one&apos;s coaching staff, gives you
            the emails to send, and tells you when a coach opens your profile. Your answers carry over, so setup takes
            about three minutes.
          </p>
        </div>
        <Link className="btn gold" href="/app">Create my free profile →</Link>
      </div>

      <p className="quiz-note">
        Want to read first? <Link href="/resources">The guides</Link> cover emailing coaches, contact rules, camps and
        NCAA core courses. Nothing you entered here left this device.
      </p>
      <button type="button" className="quiz-back" onClick={() => { setAnswers({}); setStep(0); }}>← Start over</button>
      </div>
    </main>
  );
}
