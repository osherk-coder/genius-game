import type { Question, TopicId } from '../types';
import type { Slot } from '../data/shop';
import { TOPICS } from '../data/topics';

export interface Settings {
  pin: string;
  minutesPerStage: number;
  minutesPerBoss: number;
  dailyBonusMinutes: number;
  dailyCap: number;
  sound: boolean;
}

export interface Redemption {
  at: string;
  minutes: number;
}

export interface GameState {
  version: 1;
  childName: string;
  coins: number;
  minutes: number;
  minutesToday: { date: string; amount: number };
  topicLevel: Record<TopicId, number>;
  stars: Record<TopicId, number[]>;
  stats: Record<TopicId, { attempts: number; correct: number }>;
  totalCorrect: number;
  mistakes: { q: Question; due: number }[];
  sessionCount: number;
  streak: { count: number; lastDate: string };
  dailyDone: string;
  practiceByDate: Record<string, number>;
  owned: string[];
  equipped: Record<Slot, string | null>;
  badges: string[];
  bossesBeaten: number;
  perfectStages: number;
  examsDone: number;
  bestExam: number;
  redemptions: Redemption[];
  settings: Settings;
}

const perTopic = <T,>(make: () => T) =>
  Object.fromEntries(TOPICS.map((t) => [t.id, make()])) as Record<TopicId, T>;

export function defaultState(): GameState {
  return {
    version: 1,
    childName: '',
    coins: 0,
    minutes: 0,
    minutesToday: { date: '', amount: 0 },
    topicLevel: perTopic(() => 1),
    stars: perTopic(() => [] as number[]),
    stats: perTopic(() => ({ attempts: 0, correct: 0 })),
    totalCorrect: 0,
    mistakes: [],
    sessionCount: 0,
    streak: { count: 0, lastDate: '' },
    dailyDone: '',
    practiceByDate: {},
    owned: ['c-purple', 'h-grad', 'b-sky'],
    equipped: { color: 'c-purple', hat: 'h-grad', glasses: null, accessory: null, background: 'b-sky' },
    badges: [],
    bossesBeaten: 0,
    perfectStages: 0,
    examsDone: 0,
    bestExam: 0,
    redemptions: [],
    settings: { pin: '', minutesPerStage: 5, minutesPerBoss: 15, dailyBonusMinutes: 10, dailyCap: 45, sound: true },
  };
}

const KEY = 'genius-state-v1';

/** Merge a loaded/imported object over defaults so new fields always exist. */
export function normalize(raw: unknown): GameState {
  const d = defaultState();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Partial<GameState>;
  return {
    ...d,
    ...r,
    topicLevel: { ...d.topicLevel, ...(r.topicLevel ?? {}) },
    stars: { ...d.stars, ...(r.stars ?? {}) },
    stats: { ...d.stats, ...(r.stats ?? {}) },
    equipped: { ...d.equipped, ...(r.equipped ?? {}) },
    settings: { ...d.settings, ...(r.settings ?? {}) },
    version: 1,
  };
}

export function loadState(): GameState {
  try {
    const s = localStorage.getItem(KEY);
    return s ? normalize(JSON.parse(s)) : defaultState();
  } catch {
    return defaultState();
  }
}

export function saveState(s: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}
