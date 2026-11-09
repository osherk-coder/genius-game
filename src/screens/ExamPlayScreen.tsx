import { useEffect, useMemo, useRef, useState } from 'react';
import type { Question, TopicId } from '../types';
import type { Go } from './nav';
import { useGame } from '../store/GameContext';
import type { GameState } from '../store/state';
import { QuestionCard } from '../components/QuestionCard';
import { Confetti, Modal, TopBar } from '../components/ui';
import { Owl } from '../components/Owl';
import { buildExam } from '../engine/questions';
import { addPractice, grantMinutes, markActive, recordAnswer } from '../engine/rewards';
import { topicById } from '../data/topics';
import { sounds } from '../sound';

const EXAM_SECONDS = 25 * 60;

interface Summary {
  correct: number;
  total: number;
  pct: number;
  coins: number;
  minutes: number;
  byTopic: Partial<Record<TopicId, { c: number; t: number }>>;
  wrong: { q: Question; chosen: number | null }[];
  unanswered: number;
}

/**
 * Exam simulation: like the real test, no feedback until the end,
 * with skip-and-return, a question map and a pace indicator.
 */
export function ExamPlayScreen({ part, go }: { part: 'A' | 'B'; go: Go }) {
  const { state, update } = useGame();
  const questions = useMemo(() => buildExam(part, state.topicLevel), []); // eslint-disable-line react-hooks/exhaustive-deps
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<(number | null)[]>(() => Array(total).fill(null));
  const [flagged, setFlagged] = useState<boolean[]>(() => Array(total).fill(false));
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showMap, setShowMap] = useState(false);
  const started = useRef(Date.now());

  useEffect(() => {
    if (summary) return;
    if (timeLeft <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, summary]); // eslint-disable-line react-hooks/exhaustive-deps

  const answered = chosen.filter((c) => c !== null).length;
  const elapsed = EXAM_SECONDS - timeLeft;
  // expected answered by now if working at an even pace
  const expected = (elapsed / EXAM_SECONDS) * total;
  const pace = elapsed < 60 ? null : answered >= expected - 1 ? 'good' : answered >= expected - 3 ? 'ok' : 'slow';

  function choose(i: number) {
    sounds.tap();
    const next = [...chosen];
    next[index] = i;
    setChosen(next);
    // move to the next unanswered question automatically
    setTimeout(() => goNextUnanswered(next), 250);
  }

  function goNextUnanswered(ch = chosen) {
    for (let k = 1; k <= total; k++) {
      const j = (index + k) % total;
      if (ch[j] === null) {
        setIndex(j);
        return;
      }
    }
    setConfirmEnd(true); // everything answered
  }

  function skip() {
    const f = [...flagged];
    f[index] = true;
    setFlagged(f);
    goNextUnanswered();
  }

  function finish() {
    setConfirmEnd(false);
    let correct = 0;
    const byTopic: Summary['byTopic'] = {};
    const wrong: Summary['wrong'] = [];
    questions.forEach((q, i) => {
      const ok = chosen[i] === q.answer;
      if (ok) correct++;
      else wrong.push({ q, chosen: chosen[i] });
      const b = (byTopic[q.topic] ??= { c: 0, t: 0 });
      b.t++;
      if (ok) b.c++;
    });
    const pct = Math.round((correct / total) * 100);
    const seconds = (Date.now() - started.current) / 1000;
    const apply = (s0: GameState) => {
      let s = s0;
      questions.forEach((q, i) => {
        if (chosen[i] !== null) s = recordAnswer(s, q, chosen[i] === q.answer);
      });
      s = addPractice(markActive({ ...s, sessionCount: s.sessionCount + 1 }), seconds);
      s = { ...s, examsDone: s.examsDone + 1, bestExam: Math.max(s.bestExam, pct), coins: s.coins + correct * 10 };
      const [s2, granted] = grantMinutes(s, pct >= 70 ? s.settings.minutesPerBoss : 0);
      return { s: s2, granted };
    };
    const preview = apply(state);
    update((s0) => apply(s0).s);
    if (pct >= 70) sounds.win();
    setSummary({ correct, total, pct, coins: correct * 10, minutes: preview.granted, byTopic, wrong, unanswered: chosen.filter((c) => c === null).length });
  }

  const fmt = (n: number) => `${Math.floor(n / 60)}:${(n % 60).toString().padStart(2, '0')}`;
  const title = `📝 סימולציה · שלב ${part === 'A' ? "א'" : "ב'"}`;

  if (summary) {
    return (
      <div className="screen">
        {summary.pct >= 70 && <Confetti />}
        <div className="center-box wide result">
          <div style={{ alignSelf: 'center' }}>
            <Owl equipped={state.equipped} mood={summary.pct >= 50 ? 'wow' : 'happy'} size={130} />
          </div>
          <h2 style={{ textAlign: 'center' }}>{summary.pct >= 80 ? 'מצוין! 🤩' : summary.pct >= 60 ? 'כל הכבוד! 🎉' : 'סיימת מבחן שלם, וזה כבר הישג! 💪'}</h2>
          <p className="score" style={{ textAlign: 'center' }}>
            {summary.correct} מתוך {summary.total} ({summary.pct}%)
            {summary.unanswered > 0 && ` · ${summary.unanswered} בלי תשובה`}
          </p>
          <div className="by-topic" style={{ alignSelf: 'center' }}>
            {Object.entries(summary.byTopic).map(([t, v]) => (
              <div key={t} className="by-topic-row">
                <span>
                  {topicById(t as TopicId).emoji} {topicById(t as TopicId).name}
                </span>
                <span>
                  {v!.c}/{v!.t}
                </span>
              </div>
            ))}
          </div>
          <div className="rewards" style={{ alignSelf: 'center' }}>
            <span className="reward">💎 +{summary.coins}</span>
            {summary.minutes > 0 && <span className="reward">⏱️ +{summary.minutes} דקות</span>}
          </div>
          {summary.wrong.length > 0 && (
            <details className="review">
              <summary>🔍 בואי נראה את הטעויות ({summary.wrong.length})</summary>
              {summary.wrong.map(({ q, chosen: c }, i) => (
                <div key={i} className="review-item">
                  <p>
                    <strong>{q.prompt}</strong> {q.display && <span dir={q.displayLtr ? 'ltr' : undefined}>{q.display}</span>}
                  </p>
                  {c !== null && q.options[c].text && <p className="bad">❌ בחרת: {q.options[c].text}</p>}
                  {q.options[q.answer].text && <p className="good">✅ התשובה: {q.options[q.answer].text}</p>}
                  <p className="muted-text">{q.explanation}</p>
                </div>
              ))}
            </details>
          )}
          <div className="row">
            <button className="btn primary" onClick={() => go({ name: 'exam' })}>
              לסימולציות
            </button>
            <button className="btn" onClick={() => go({ name: 'home' })}>
              למפה
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[index];
  return (
    <div className="screen play">
      <TopBar onBack={() => go({ name: 'exam' })} title={title} />
      <div className="progress-row">
        <button className="btn small" onClick={() => setShowMap(!showMap)}>
          🗺️ {answered}/{total}
        </button>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
        <span className={timeLeft < 120 ? 'timer low' : 'timer'}>⏳ {fmt(timeLeft)}</span>
      </div>
      {pace && (
        <div className={`pace ${pace}`}>
          {pace === 'good' ? '👍 את בקצב טוב' : pace === 'ok' ? '🙂 קצב סביר, המשיכי' : '⏩ כדאי להאיץ קצת. שאלה קשה? דלגי עליה וחזרי אחר כך'}
        </div>
      )}
      {showMap && (
        <div className="qmap">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`qdot${i === index ? ' cur' : ''}${chosen[i] !== null ? ' done' : ''}${flagged[i] && chosen[i] === null ? ' flag' : ''}`}
              onClick={() => {
                setIndex(i);
                setShowMap(false);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <p className="muted-text exam-qnum">
        שאלה {index + 1} מתוך {total}
        {flagged[index] && chosen[index] === null && ' · 🚩 דילגת עליה קודם'}
      </p>
      <QuestionCard key={q.id + index} q={q} selected={chosen[index]} revealed={false} hintShown={false} onSelect={choose} readAloud={state.settings.readAloud} />
      <div className="play-actions">
        <button className="btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ➜ הקודמת
        </button>
        {chosen[index] === null && (
          <button className="btn" onClick={skip}>
            🚩 לדלג ולחזור אחר כך
          </button>
        )}
        <button className="btn" disabled={index === total - 1} onClick={() => setIndex(index + 1)}>
          הבאה ⬅
        </button>
        <button className="btn primary" onClick={() => setConfirmEnd(true)}>
          🏁 סיום
        </button>
      </div>
      {confirmEnd && (
        <Modal onClose={() => setConfirmEnd(false)}>
          <h3>לסיים את המבחן?</h3>
          {total - answered > 0 ? (
            <p>
              נשארו עוד <strong>{total - answered}</strong> שאלות בלי תשובה. במבחן האמיתי כדאי לנחש ולא להשאיר ריק!
            </p>
          ) : (
            <p>עניתי על הכול. אפשר לעבור שוב על התשובות, או לסיים.</p>
          )}
          <div className="row">
            <button className="btn primary" onClick={finish}>
              כן, לסיים
            </button>
            <button
              className="btn"
              onClick={() => {
                setConfirmEnd(false);
                const first = chosen.findIndex((c) => c === null);
                if (first >= 0) setIndex(first);
              }}
            >
              {total - answered > 0 ? 'לחזור לשאלות' : 'לבדוק שוב'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
