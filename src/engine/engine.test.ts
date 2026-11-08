import { describe, expect, it } from 'vitest';
import { newTracker, step } from './adaptive';
import { coinsForAnswer, grantMinutes, markActive, recordAnswer, starsFor, today, dueMistakes } from './rewards';
import { awardBadges } from './badges';
import { defaultState, normalize } from '../store/state';
import { genMath } from '../generators/math';

describe('adaptive difficulty', () => {
  it('goes up after 3 correct in a row', () => {
    let t = newTracker(2, 1, 5);
    t = step(t, true, 1, 5);
    t = step(t, true, 1, 5);
    expect(t.level).toBe(2);
    t = step(t, true, 1, 5);
    expect(t.level).toBe(3);
    expect(t.rightRun).toBe(0);
  });

  it('goes down after 2 wrong in a row', () => {
    let t = newTracker(3, 1, 5);
    t = step(t, false, 1, 5);
    expect(t.level).toBe(3);
    t = step(t, false, 1, 5);
    expect(t.level).toBe(2);
  });

  it('a wrong answer resets the correct run', () => {
    let t = newTracker(2, 1, 5);
    t = step(t, true, 1, 5);
    t = step(t, true, 1, 5);
    t = step(t, false, 1, 5);
    t = step(t, true, 1, 5);
    expect(t.level).toBe(2);
  });

  it('stays inside the stage range', () => {
    let t = newTracker(5, 1, 2);
    expect(t.level).toBe(2);
    for (let i = 0; i < 6; i++) t = step(t, true, 1, 2);
    expect(t.level).toBe(2);
    for (let i = 0; i < 6; i++) t = step(t, false, 1, 2);
    expect(t.level).toBe(1);
  });
});

describe('rewards', () => {
  it('caps minutes per day', () => {
    let s = { ...defaultState(), settings: { ...defaultState().settings, dailyCap: 20 } };
    let g: number;
    [s, g] = grantMinutes(s, 15);
    expect(g).toBe(15);
    [s, g] = grantMinutes(s, 15);
    expect(g).toBe(5);
    expect(s.minutes).toBe(20);
    [s, g] = grantMinutes(s, 10);
    expect(g).toBe(0);
  });

  it('resets the daily cap on a new day', () => {
    const s = { ...defaultState(), minutesToday: { date: '2000-01-01', amount: 999 } };
    const [, g] = grantMinutes(s, 10);
    expect(g).toBe(10);
  });

  it('stars thresholds', () => {
    expect(starsFor(8, 8)).toBe(3);
    expect(starsFor(6, 8)).toBe(2);
    expect(starsFor(5, 8)).toBe(1);
    expect(starsFor(4, 8)).toBe(0);
  });

  it('coins: hint halves, streak adds bonus', () => {
    expect(coinsForAnswer(false, false, 0)).toBe(0);
    expect(coinsForAnswer(true, false, 1)).toBe(10);
    expect(coinsForAnswer(true, true, 1)).toBe(5);
    expect(coinsForAnswer(true, false, 3)).toBe(15);
  });

  it('streak counts consecutive days only once per day', () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    let s = { ...defaultState(), streak: { count: 4, lastDate: today(y) } };
    s = markActive(s);
    expect(s.streak.count).toBe(5);
    s = markActive(s);
    expect(s.streak.count).toBe(5);
    const old = markActive({ ...defaultState(), streak: { count: 9, lastDate: '2000-01-01' } });
    expect(old.streak.count).toBe(1);
  });

  it('wrong answers come back later and leave once fixed', () => {
    const q = genMath(1);
    let s = recordAnswer(defaultState(), q, false);
    expect(s.mistakes).toHaveLength(1);
    expect(dueMistakes(s, 'math', 2)).toHaveLength(0);
    s = { ...s, sessionCount: s.sessionCount + 2 };
    expect(dueMistakes(s, 'math', 2)).toHaveLength(1);
    s = recordAnswer(s, q, true);
    expect(s.mistakes).toHaveLength(0);
    expect(s.stats.math).toEqual({ attempts: 2, correct: 1 });
  });
});

describe('badges and state', () => {
  it('awards a badge once', () => {
    const s = { ...defaultState(), totalCorrect: 30 };
    const [s2, earned] = awardBadges(s);
    expect(earned.map((b) => b.id)).toContain('c25');
    const [, again] = awardBadges(s2);
    expect(again.map((b) => b.id)).not.toContain('c25');
  });

  it('normalize fills missing fields from defaults', () => {
    const s = normalize({ coins: 77, settings: { pin: '1234' } });
    expect(s.coins).toBe(77);
    expect(s.settings.pin).toBe('1234');
    expect(s.settings.dailyCap).toBe(45);
    expect(s.stars.math).toEqual([]);
  });
});
