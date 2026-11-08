import type { Option } from '../types';

export const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let counter = 0;
export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}-${randInt(0, 9999)}`;

/** Shuffle the correct option among the distractors and return the options with the answer index. */
export function finalize(correct: Option, distractors: Option[]): { options: Option[]; answer: number } {
  const all = shuffle([correct, ...distractors]);
  return { options: all, answer: all.indexOf(correct) };
}

/** Numeric distractors near the correct answer: unique, non-negative, different from the answer. */
export function numberDistractors(answer: number, candidates: number[], count = 3): number[] {
  const out: number[] = [];
  const push = (n: number) => {
    if (Number.isInteger(n) && n >= 0 && n !== answer && !out.includes(n)) out.push(n);
  };
  shuffle(candidates).forEach(push);
  let delta = 1;
  while (out.length < count) {
    push(answer + delta);
    if (out.length < count) push(answer - delta);
    delta++;
  }
  return out.slice(0, count);
}

export function numericQuestion(answer: number, candidates: number[]) {
  return finalize(
    { text: String(answer) },
    numberDistractors(answer, candidates).map((n) => ({ text: String(n) })),
  );
}
