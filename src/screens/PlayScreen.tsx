import { useEffect, useMemo, useRef, useState } from 'react';
import type { Question, TopicId } from '../types';
import type { Go, PlayMode } from './nav';
import { useGame } from '../store/GameContext';
import type { GameState } from '../store/state';
import { QuestionCard } from '../components/QuestionCard';
import { Confetti, TopBar } from '../components/ui';
import { Owl } from '../components/Owl';
import { newTracker, step, type Tracker } from '../engine/adaptive';
import { buildExam, makeQuestion } from '../engine/questions';
import {
  BOSS_COINS,
  addPractice,
  coinsForAnswer,
  dueMistakes,
  grantMinutes,
  markActive,
  recordAnswer,
  starsFor,
  today,
} from '../engine/rewards';
import {
  BOSS_SECONDS,
  QUESTIONS_PER_BOSS,
  QUESTIONS_PER_STAGE,
  STAGES_PER_ISLAND,
  TOPICS,
  isBoss,
  stageLevelRange,
  topicById,
} from '../data/topics';
import { sounds } from '../sound';

const ALL: TopicId[] = TOPICS.map((t) => t.id);
const EXAM_SECONDS = { A: 25 * 60, B: 25 * 60 };

interface Plan {
  total: number;
  seconds: number | null;
  feedback: boolean;
  title: string;
  fixed: Question[] | null;
  /** Topic for question i (for generated modes). */
  topicAt: (i: number) => TopicId;
  range: (t: TopicId) => [number, number];
  /** Mistakes to slot in at fixed positions. */
  inserts: Map<number, Question>;
}

function makePlan(mode: PlayMode, s: GameState): Plan {
  const full: (t: TopicId) => [number, number] = () => [1, 5];
  switch (mode.kind) {
    case 'stage': {
      const boss = isBoss(mode.stageIdx);
      const inserts = new Map<number, Question>();
      if (!boss) dueMistakes(s, mode.topic, 2).forEach((q, i) => inserts.set(i === 0 ? 2 : 5, q));
      return {
        total: boss ? QUESTIONS_PER_BOSS : QUESTIONS_PER_STAGE,
        seconds: boss ? BOSS_SECONDS : null,
        feedback: true,
        title: boss ? `🐉 בוס ${topicById(mode.topic).island}` : `${topicById(mode.topic).island} · שלב ${mode.stageIdx + 1}`,
        fixed: null,
        topicAt: () => mode.topic,
        range: () => stageLevelRange(mode.stageIdx),
        inserts,
      };
    }
    case 'daily': {
      const order = [...ALL].sort(() => Math.random() - 0.5);
      return {
        total: 6,
        seconds: null,
        feedback: true,
        title: '☀️ האתגר היומי',
        fixed: null,
        topicAt: (i) => order[i % order.length],
        range: full,
        inserts: new Map(),
      };
    }
    case 'review': {
      const qs = s.mistakes.slice(-10).map((m) => m.q);
      return { total: qs.length, seconds: null, feedback: true, title: '🔁 תיקון טעויות', fixed: qs, topicAt: () => 'math', range: full, inserts: new Map() };
    }
    case 'exam': {
      const qs = buildExam(mode.part, s.topicLevel);
      return {
        total: qs.length,
        seconds: EXAM_SECONDS[mode.part],
        feedback: false,
        title: `📝 סימולציה · שלב ${mode.part === 'A' ? "א'" : "ב'"}`,
        fixed: qs,
        topicAt: () => 'math',
        range: full,
        inserts: new Map(),
      };
    }
  }
}

interface Result {
  correct: number;
  total: number;
  coins: number;
  minutes: number;
  minutesCapped: boolean;
  stars: number;
  passed: boolean;
  byTopic: Partial<Record<TopicId, { c: number; t: number }>>;
}

export function PlayScreen({ mode, go }: { mode: PlayMode; go: Go }) {
  const { state, update } = useGame();
  const plan = useMemo(() => makePlan(mode, state), []); // eslint-disable-line react-hooks/exhaustive-deps
  const trackers = useRef<Partial<Record<TopicId, Tracker>>>({});
  const used = useRef(new Set<string>());
  const startedAt = useRef(Date.now());

  const nextQuestion = (i: number): Question => {
    if (plan.fixed) return plan.fixed[i];
    const ins = plan.inserts.get(i);
    if (ins) return ins;
    const topic = plan.topicAt(i);
    const [min, max] = plan.range(topic);
    trackers.current[topic] ??= newTracker(state.topicLevel[topic], min, max);
    const q = makeQuestion(topic, trackers.current[topic]!.level, used.current);
    used.current.add(q.id);
    return q;
  };

  const [index, setIndex] = useState(0);
  const [q, setQ] = useState<Question>(() => nextQuestion(0));
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [run, setRun] = useState(0);
  const [coins, setCoins] = useState(0);
  const [answers, setAnswers] = useState<{ topic: TopicId; ok: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(plan.seconds);
  const [result, setResult] = useState<Result | null>(null);
  const [floater, setFloater] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      finish(correctCount, coins, answers);
      return;
    }
    const t = setTimeout(() => setTimeLeft((x) => (x === null ? null : x - 1)), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result]); // eslint-disable-line react-hooks/exhaustive-deps

  if (plan.total === 0) {
    return (
      <div className="screen">
        <TopBar onBack={() => go({ name: 'home' })} title={plan.title} />
        <div className="center-box">
          <Owl equipped={state.equipped} />
          <h2>אין טעויות לתקן! 🎉</h2>
          <button className="btn primary" onClick={() => go({ name: 'home' })}>
            חזרה למפה
          </button>
        </div>
      </div>
    );
  }

  function answer(i: number) {
    if (revealed) return;
    setSelected(i);
    const ok = i === q.answer;
    const nextAnswers = [...answers, { topic: q.topic, ok }];
    setAnswers(nextAnswers);

    // adaptive difficulty
    if (!plan.fixed) {
      const [min, max] = plan.range(q.topic);
      const tr = trackers.current[q.topic] ?? newTracker(state.topicLevel[q.topic], min, max);
      trackers.current[q.topic] = step(tr, ok, min, max);
    }

    const newRun = ok ? run + 1 : 0;
    const earned = plan.feedback ? coinsForAnswer(ok, hintShown, newRun) : 0;
    setRun(newRun);
    setCoins((c) => c + earned);
    const nextCorrect = correctCount + (ok ? 1 : 0);
    setCorrectCount(nextCorrect);

    const topicLevels = Object.fromEntries(Object.entries(trackers.current).map(([k, v]) => [k, v!.level]));
    update((s) => ({
      ...recordAnswer(s, q, ok),
      coins: s.coins + earned,
      topicLevel: { ...s.topicLevel, ...topicLevels },
    }));

    if (plan.feedback) {
      setRevealed(true);
      if (ok) {
        sounds.correct();
        setFloater(`+${earned} 💎${newRun >= 3 ? ' 🔥' : ''}`);
        setTimeout(() => setFloater(null), 1100);
      } else sounds.wrong();
    } else {
      sounds.tap();
      setTimeout(() => advance(nextCorrect, coins + earned, nextAnswers), 250);
    }
  }

  function advance(nc = correctCount, nCoins = coins, nAnswers = answers) {
    const ni = index + 1;
    if (ni >= plan.total) {
      finish(nc, nCoins, nAnswers);
      return;
    }
    setIndex(ni);
    setQ(nextQuestion(ni));
    setSelected(null);
    setRevealed(false);
    setHintShown(false);
  }

  function finish(nc: number, earnedCoins: number, nAnswers: { topic: TopicId; ok: boolean }[]) {
    const total = plan.total;
    const stars = starsFor(nc, total);
    const passed = stars > 0;
    const byTopic: Result['byTopic'] = {};
    for (const a of nAnswers) {
      const b = (byTopic[a.topic] ??= { c: 0, t: 0 });
      b.t++;
      if (a.ok) b.c++;
    }
    const seconds = (Date.now() - startedAt.current) / 1000;

    const apply = (s0: GameState) => {
      let extraCoins = 0;
      let minutesWanted = 0;
      let s = { ...s0, sessionCount: s0.sessionCount + 1 };
      s = addPractice(markActive(s), seconds);
      if (mode.kind === 'stage') {
        const arr = [...s.stars[mode.topic]];
        const prev = arr[mode.stageIdx] ?? 0;
        if (stars > prev) {
          arr[mode.stageIdx] = stars;
          if (passed) minutesWanted = isBoss(mode.stageIdx) ? s.settings.minutesPerBoss : s.settings.minutesPerStage;
        }
        s = { ...s, stars: { ...s.stars, [mode.topic]: arr } };
        if (passed) extraCoins = stars * 10;
        if (passed && isBoss(mode.stageIdx)) {
          extraCoins += prev === 0 ? BOSS_COINS : 20;
          if (prev === 0) s = { ...s, bossesBeaten: s.bossesBeaten + 1 };
        }
        if (stars === 3 && prev < 3) s = { ...s, perfectStages: s.perfectStages + 1 };
      } else if (mode.kind === 'daily') {
        if (s.dailyDone !== today()) {
          s = { ...s, dailyDone: today() };
          extraCoins = 50;
          minutesWanted = s.settings.dailyBonusMinutes;
        }
      } else if (mode.kind === 'exam') {
        const pct = Math.round((nc / total) * 100);
        s = { ...s, examsDone: s.examsDone + 1, bestExam: Math.max(s.bestExam, pct) };
        extraCoins = nc * 10;
        if (pct >= 70) minutesWanted = s.settings.minutesPerBoss;
      }
      s = { ...s, coins: s.coins + extraCoins };
      const [s2, granted] = grantMinutes(s, minutesWanted);
      return { s: s2, extraCoins, minutesWanted, granted };
    };

    // Rewards shown are computed from the current snapshot; the store applies the same update.
    const preview = apply(state);
    update((s0) => apply(s0).s);
    if (passed || mode.kind === 'daily') sounds.win();
    setResult({
      correct: nc,
      total,
      coins: earnedCoins + preview.extraCoins,
      minutes: preview.granted,
      minutesCapped: preview.granted < preview.minutesWanted,
      stars,
      passed: mode.kind === 'stage' ? passed : true,
      byTopic,
    });
  }

  if (result) {
    const nextStage = mode.kind === 'stage' && result.passed && mode.stageIdx + 1 < STAGES_PER_ISLAND ? mode.stageIdx + 1 : null;
    return (
      <div className="screen">
        {result.passed && <Confetti />}
        <div className="center-box result">
          <Owl equipped={state.equipped} mood={result.passed ? 'wow' : 'sad'} size={150} />
          <h2>{result.passed ? (result.stars === 3 ? 'מושלם! 🤩' : 'כל הכבוד! 🎉') : 'כמעט! נסי שוב 💪'}</h2>
          {mode.kind === 'stage' && (
            <div className="stars-big">
              {[1, 2, 3].map((i) => (
                <span key={i} className={i <= result.stars ? 'star on' : 'star'} style={{ animationDelay: `${i * 0.25}s` }}>
                  ★
                </span>
              ))}
            </div>
          )}
          <p className="score">
            {result.correct} מתוך {result.total} נכונות ({Math.round((result.correct / result.total) * 100)}%)
          </p>
          {mode.kind === 'exam' && (
            <div className="by-topic">
              {Object.entries(result.byTopic).map(([t, v]) => (
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
          )}
          <div className="rewards">
            <span className="reward">💎 +{result.coins}</span>
            {result.minutes > 0 && <span className="reward">⏱️ +{result.minutes} דקות</span>}
          </div>
          {result.minutesCapped && <p className="muted-text">הגעת למכסת הדקות של היום. מחר אפשר לצבור עוד!</p>}
          {!result.passed && <p className="muted-text">צריך לפחות 60% כדי לעבור את השלב.</p>}
          <div className="row">
            {nextStage !== null && mode.kind === 'stage' && (
              <button className="btn primary" onClick={() => go({ name: 'play', mode: { ...mode, stageIdx: nextStage } })}>
                לשלב הבא ⬅
              </button>
            )}
            <button className="btn" onClick={() => go({ name: 'play', mode: { ...mode } })}>
              🔄 שוב
            </button>
            <button
              className="btn"
              onClick={() => go(mode.kind === 'stage' ? { name: 'island', topic: mode.topic } : { name: 'home' })}
            >
              {mode.kind === 'stage' ? 'לאי' : 'למפה'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => `${Math.floor(n / 60)}:${(n % 60).toString().padStart(2, '0')}`;
  return (
    <div className="screen play">
      <TopBar
        onBack={() => go(mode.kind === 'stage' ? { name: 'island', topic: mode.topic } : { name: 'home' })}
        title={plan.title}
      />
      <div className="progress-row">
        <div className="progress">
          <div className="progress-fill" style={{ width: `${(index / plan.total) * 100}%` }} />
        </div>
        <span className="progress-text">
          {index + 1}/{plan.total}
        </span>
        {timeLeft !== null && <span className={timeLeft < 60 ? 'timer low' : 'timer'}>⏳ {fmt(timeLeft)}</span>}
        {run >= 3 && plan.feedback && <span className="combo">🔥×{run}</span>}
      </div>
      <QuestionCard key={q.id + index} q={q} selected={selected} revealed={revealed} hintShown={hintShown} onSelect={answer} />
      {floater && <div className="floater">{floater}</div>}
      <div className="play-actions">
        {plan.feedback && !revealed && !hintShown && (
          <button className="btn" onClick={() => setHintShown(true)}>
            💡 רמז
          </button>
        )}
        {revealed && (
          <button className="btn primary big" onClick={() => advance()}>
            {index + 1 >= plan.total ? 'לסיכום 🏁' : 'הבא ⬅'}
          </button>
        )}
      </div>
    </div>
  );
}
