import type { Question, TopicId } from '../types';
import type { GameState } from '../store/state';

export const COINS_PER_CORRECT = 10;
export const COINS_HINT_CORRECT = 5;
export const STREAK_BONUS = 5;
export const BOSS_COINS = 100;

export function today(d = new Date()): string {
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return today(d);
}

/** Add minutes respecting the parent's daily cap. Returns new state and how many were actually granted. */
export function grantMinutes(s: GameState, amount: number): [GameState, number] {
  const t = today();
  const used = s.minutesToday.date === t ? s.minutesToday.amount : 0;
  const granted = Math.max(0, Math.min(amount, s.settings.dailyCap - used));
  return [
    {
      ...s,
      minutes: s.minutes + granted,
      minutesToday: { date: t, amount: used + granted },
      minutesByDate: { ...s.minutesByDate, [t]: (s.minutesByDate[t] ?? 0) + granted },
    },
    granted,
  ];
}

export function minutesLeftToday(s: GameState): number {
  const used = s.minutesToday.date === today() ? s.minutesToday.amount : 0;
  return Math.max(0, s.settings.dailyCap - used);
}

/** Count today as an active day for the streak. */
export function markActive(s: GameState): GameState {
  const t = today();
  if (s.streak.lastDate === t) return s;
  const count = s.streak.lastDate === yesterday() ? s.streak.count + 1 : 1;
  return { ...s, streak: { count, lastDate: t } };
}

/** Effective streak shown to the child (0 if a day was missed). */
export function currentStreak(s: GameState): number {
  return s.streak.lastDate === today() || s.streak.lastDate === yesterday() ? s.streak.count : 0;
}

export function coinsForAnswer(correct: boolean, usedHint: boolean, run: number): number {
  if (!correct) return 0;
  return (usedHint ? COINS_HINT_CORRECT : COINS_PER_CORRECT) + (run >= 3 ? STREAK_BONUS : 0);
}

/** Record one answer: stats and the mistakes queue (spaced repetition). */
export function recordAnswer(s: GameState, q: Question, correct: boolean): GameState {
  const st = s.stats[q.topic];
  const stats = { ...s.stats, [q.topic]: { attempts: st.attempts + 1, correct: st.correct + (correct ? 1 : 0) } };
  let mistakes = s.mistakes.filter((m) => m.q.id !== q.id);
  if (!correct) mistakes = [...mistakes, { q, due: s.sessionCount + 2 }].slice(-60);
  const t = today();
  const day = { ...(s.daily[t] ?? {}) };
  const d = day[q.topic] ?? { a: 0, c: 0 };
  day[q.topic] = { a: d.a + 1, c: d.c + (correct ? 1 : 0) };
  // keep ~2 months of daily history
  const daily = Object.fromEntries(Object.entries({ ...s.daily, [t]: day }).sort().slice(-60));
  return { ...s, stats, mistakes, daily, totalCorrect: s.totalCorrect + (correct ? 1 : 0) };
}

export function dueMistakes(s: GameState, topic: TopicId | null, max: number): Question[] {
  return s.mistakes
    .filter((m) => m.due <= s.sessionCount && (topic === null || m.q.topic === topic))
    .slice(0, max)
    .map((m) => m.q);
}

export function starsFor(correct: number, total: number): number {
  const r = total ? correct / total : 0;
  if (r >= 0.9) return 3;
  if (r >= 0.75) return 2;
  if (r >= 0.6) return 1;
  return 0;
}

export function addPractice(s: GameState, seconds: number): GameState {
  const t = today();
  return { ...s, practiceByDate: { ...s.practiceByDate, [t]: (s.practiceByDate[t] ?? 0) + Math.round(seconds) } };
}
