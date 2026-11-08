export interface Tracker {
  level: number;
  rightRun: number;
  wrongRun: number;
}

export const UP_AFTER = 3;
export const DOWN_AFTER = 2;

export const newTracker = (level: number, min: number, max: number): Tracker => ({
  level: Math.min(max, Math.max(min, level)),
  rightRun: 0,
  wrongRun: 0,
});

/** 3 correct in a row → level up; 2 wrong in a row → level down; clamped to [min, max]. */
export function step(t: Tracker, correct: boolean, min: number, max: number): Tracker {
  if (correct) {
    const run = t.rightRun + 1;
    if (run >= UP_AFTER && t.level < max) return { level: t.level + 1, rightRun: 0, wrongRun: 0 };
    return { level: t.level, rightRun: run, wrongRun: 0 };
  }
  const run = t.wrongRun + 1;
  if (run >= DOWN_AFTER && t.level > min) return { level: t.level - 1, rightRun: 0, wrongRun: 0 };
  return { level: t.level, rightRun: 0, wrongRun: run };
}
