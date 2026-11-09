import type { Question, TopicId } from '../types';
import { genMath, genMathKind, type MathKind } from '../generators/math';
import { genSequence } from '../generators/sequences';
import { genNumShapes } from '../generators/numshapes';
import { genShapes } from '../generators/shapes';
import { genLogic } from '../generators/logic';
import { pick, shuffle } from '../generators/util';
import { bankToQuestion, type BankItem } from '../data/questions/bank';
import { ANALOGY_BANK } from '../data/questions/analogies';
import { LOGIC_BANK } from '../data/questions/logic';
import { READING_BANK } from '../data/questions/reading';

const BANKS: Partial<Record<TopicId, BankItem[]>> = {
  analogies: ANALOGY_BANK,
  logic: LOGIC_BANK,
  reading: READING_BANK,
};

function fromBank(topic: TopicId, level: number, exclude: Set<string>, idPrefix?: string): Question {
  const all = BANKS[topic]!;
  const bank = idPrefix ? all.filter((b) => b.id.startsWith(idPrefix)) : all;
  const free = bank.filter((b) => !exclude.has(`${topic}-${b.id}`));
  const pool = free.length ? free : bank;
  const tiers = [
    pool.filter((b) => b.level === level),
    pool.filter((b) => Math.abs(b.level - level) === 1),
    pool,
  ];
  const tier = tiers.find((t) => t.length > 0)!;
  return bankToQuestion(pick(tier), topic);
}

/** Make one question for a topic at a given level, avoiding ids in `exclude` when possible. */
export function makeQuestion(topic: TopicId, level: number, exclude: Set<string> = new Set()): Question {
  switch (topic) {
    case 'math':
      return genMath(level);
    case 'sequences':
      return Math.random() < 0.5 ? genSequence(level) : genNumShapes(level);
    case 'shapes':
      return genShapes(level);
    case 'logic':
      return Math.random() < 0.45 ? genLogic(level) : fromBank('logic', level, exclude);
    default:
      return fromBank(topic, level, exclude);
  }
}

const examLevel = (levels: Record<TopicId, number>, t: TopicId) => Math.min(5, Math.max(2, levels[t] + 1));

/** Whole reading passages (all their questions, in order), like in the real test. */
function readingPassages(level: number, count: number): Question[] {
  const byPassage = new Map<string, BankItem[]>();
  for (const b of READING_BANK) {
    const key = b.id.split('q')[0];
    if (!byPassage.has(key)) byPassage.set(key, []);
    byPassage.get(key)!.push(b);
  }
  const groups = shuffle([...byPassage.values()]).sort(
    (a, b) => Math.abs(a[0].level - level) - Math.abs(b[0].level - level),
  );
  return groups.slice(0, count).flatMap((g) => g.map((b) => bankToQuestion(b, 'reading')));
}

/**
 * Exam simulation, built in parts like the real test.
 * Stage A: math (exercises, smileys, inequalities, picture puzzles, word problems) + 2 reading passages.
 * Stage B: word relations, sentence completion, word problems, numbers in shapes, shapes.
 */
export function buildExam(part: 'A' | 'B', levels: Record<TopicId, number>): Question[] {
  const exclude = new Set<string>();
  const add = (q: Question) => {
    exclude.add(q.id);
    return q;
  };
  // avoid two questions from the same template in one exam
  const usedStarts = new Set<string>();
  const times = (n: number, f: () => Question) =>
    Array.from({ length: n }, () => {
      let q = f();
      for (let tries = 0; tries < 8 && usedStarts.has(q.prompt.slice(0, 14) + (q.display ?? '').slice(0, 3)); tries++) q = f();
      usedStarts.add(q.prompt.slice(0, 14) + (q.display ?? '').slice(0, 3));
      return add(q);
    });
  if (part === 'A') {
    const ml = examLevel(levels, 'math');
    const mix: [MathKind, number][] = [
      ['exercise', 2],
      ['smiley', 2],
      ['inequality', 2],
      ['picture', 2],
      ['word', 4],
    ];
    return [
      ...mix.flatMap(([kind, n]) => times(n, () => genMathKind(kind, ml))),
      ...readingPassages(examLevel(levels, 'reading'), 2),
    ];
  }
  const al = examLevel(levels, 'analogies');
  return [
    ...times(5, () => fromBank('analogies', al, exclude, 'pr')),
    ...times(5, () => fromBank('analogies', al, exclude, 'sn')),
    ...times(4, () => genMath(examLevel(levels, 'math'), true)),
    ...times(4, () => genNumShapes(examLevel(levels, 'sequences'))),
    ...times(5, () => genShapes(examLevel(levels, 'shapes'))),
  ];
}
