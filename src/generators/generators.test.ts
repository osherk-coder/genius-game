import { describe, expect, it } from 'vitest';
import type { Question, TopicId } from '../types';
import { genMath } from './math';
import { genSequence, seqRule } from './sequences';
import { genShapes, sameShape } from './shapes';
import { genLogic } from './logic';
import { genNumShapes } from './numshapes';
import { carpet, rowsSeries } from './shapes2';
import { buildExam } from '../engine/questions';
import { makeQuestion } from '../engine/questions';
import { ANALOGY_BANK } from '../data/questions/analogies';
import { LOGIC_BANK } from '../data/questions/logic';
import { READING_BANK } from '../data/questions/reading';

const RUNS = 300;

function checkShape(q: Question) {
  expect(q.options).toHaveLength(4);
  expect(q.answer).toBeGreaterThanOrEqual(0);
  expect(q.answer).toBeLessThan(4);
  expect(q.prompt.length).toBeGreaterThan(0);
  expect(q.explanation.length).toBeGreaterThan(0);
  const texts = q.options.filter((o) => o.text !== undefined).map((o) => o.text);
  expect(new Set(texts).size).toBe(texts.length);
  const shapes = q.options.filter((o) => o.shape).map((o) => o.shape!);
  if (q.prompt.includes('יוצאת דופן')) {
    // odd-one-out: the others may be identical, but the answer must differ from all of them
    const ans = q.options[q.answer].shape!;
    q.options.forEach((o, i) => i !== q.answer && expect(sameShape(o.shape!, ans)).toBe(false));
  } else {
    for (let i = 0; i < shapes.length; i++)
      for (let j = i + 1; j < shapes.length; j++) expect(sameShape(shapes[i], shapes[j])).toBe(false);
  }
  for (const t of texts) expect(t).not.toMatch(/NaN|undefined|-\d/);
  const patches = q.options.filter((o) => o.patch).map((o) => o.patch!.join());
  expect(new Set(patches).size).toBe(patches.length);
}

describe('question generators produce valid questions', () => {
  for (let level = 1; level <= 5; level++) {
    it(`math level ${level}`, () => {
      for (let i = 0; i < RUNS; i++) checkShape(genMath(level));
    });
    it(`sequences level ${level}`, () => {
      for (let i = 0; i < RUNS; i++) checkShape(genSequence(level));
    });
    it(`shapes level ${level}`, () => {
      for (let i = 0; i < RUNS; i++) checkShape(genShapes(level));
    });
    it(`numbers-in-shapes level ${level}`, () => {
      for (let i = 0; i < RUNS; i++) {
        const q = genNumShapes(level);
        checkShape(q);
        expect(q.numFigure).toBeDefined();
      }
    });
    it(`math word problems level ${level}`, () => {
      for (let i = 0; i < 100; i++) checkShape(genMath(level, true));
    });
    it(`logic level ${level}`, () => {
      for (let i = 0; i < RUNS; i++) checkShape(genLogic(level));
    });
  }

  it('every topic works through makeQuestion', () => {
    const topics: TopicId[] = ['math', 'reading', 'sequences', 'analogies', 'shapes', 'logic'];
    for (const t of topics) for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 30; i++) checkShape(makeQuestion(t, lv));
  });
});

const evalExpr = (e: string) =>
  Function(`return (${e.replace(/−/g, '-').replace(/×/g, '*').replace(/:/g, '/')})`)() as number;

describe('math answers are correct', () => {
  const many = (level: number, n = 600) => Array.from({ length: n }, () => genMath(level));

  it('evaluates displayed arithmetic', () => {
    for (let level = 1; level <= 4; level++)
      for (const q of many(level)) {
        if (!q.display || !q.display.endsWith('= ___')) continue;
        expect(Number(q.options[q.answer].text)).toBe(evalExpr(q.display.replace('= ___', '')));
      }
  });

  it('smiley exercises are consistent', () => {
    for (let level = 1; level <= 3; level++)
      for (const q of many(level)) {
        if (!q.display?.includes('🙂')) continue;
        const [left, right] = q.display.replace('🙂', q.options[q.answer].text!).split('=');
        expect(evalExpr(left)).toBe(Number(right));
      }
  });

  it('inequalities have exactly one option that works', () => {
    for (let level = 2; level <= 4; level++)
      for (const q of many(level)) {
        if (!q.display || !/[<>]/.test(q.display)) continue;
        const works = q.options.map((o) => {
          const e = q.display!.replace('___', o.text!);
          const [l, r] = e.split(/[<>]/);
          return e.includes('<') ? evalExpr(l) < evalExpr(r) : evalExpr(l) > evalExpr(r);
        });
        expect(works.filter(Boolean)).toHaveLength(1);
        expect(works[q.answer]).toBe(true);
      }
  });

  it('picture puzzles are solvable with the given answer', () => {
    for (let level = 1; level <= 5; level++)
      for (const q of many(level)) {
        if (!q.prompt.startsWith('כל ציור')) continue;
        const target = q.prompt.match(/ל-(\S+)\?/)![1];
        // solve line by line: each line introduces exactly one new picture
        const known: Record<string, number> = {};
        for (const line of q.display!.split(/\n/)) {
          const [lhs, rhs] = line.split('=');
          const terms = lhs.split(/[+×]/).map((t) => t.trim());
          const isMul = lhs.includes('×');
          const unknown = terms.find((t) => !(t in known))!;
          const cnt = terms.filter((t) => t === unknown).length;
          const rest = terms.filter((t) => t !== unknown).reduce((a, t) => a + known[t], 0);
          known[unknown] = isMul ? Math.sqrt(Number(rhs)) : (Number(rhs) - rest) / cnt;
        }
        expect(Number(q.options[q.answer].text)).toBe(known[target]);
      }
  });
});

describe('new shape types', () => {
  it('carpets: hole is 2x2, patches distinct, every option is a full patch', () => {
    for (let level = 1; level <= 5; level++)
      for (let i = 0; i < 300; i++) {
        const q = carpet(level);
        checkShape(q);
        expect(q.carpet!.cells.filter((c) => c === null)).toHaveLength(4);
        q.options.forEach((o) => expect(o.patch).toHaveLength(4));
      }
  });
  it('three-row series: 3x3 grid with the last cell missing', () => {
    for (let level = 1; level <= 5; level++)
      for (let i = 0; i < 300; i++) {
        const q = rowsSeries(level);
        checkShape(q);
        expect(q.grid).toHaveLength(9);
        expect(q.grid![8]).toBeNull();
      }
  });
});

describe('exam simulation', () => {
  it('builds both parts with valid questions', () => {
    const levels = { math: 3, reading: 3, sequences: 3, analogies: 3, shapes: 3, logic: 3 };
    for (const part of ['A', 'B'] as const) {
      const qs = buildExam(part, levels);
      expect(qs.length).toBeGreaterThanOrEqual(18);
      qs.forEach(checkShape);
    }
  });
});

describe('sequence rules', () => {
  it('constant-step sequences continue correctly', () => {
    for (let i = 0; i < RUNS; i++) {
      const { r, missingIndex } = seqRule(1);
      expect(missingIndex).toBeNull();
      const d = r.terms[1] - r.terms[0];
      r.terms.forEach((t, k) => k > 0 && expect(t - r.terms[k - 1]).toBe(d));
      expect(r.next - r.terms[r.terms.length - 1]).toBe(d);
    }
  });

  it('answer option matches the rule', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 100; i++) {
        const q = genSequence(level);
        const shown = q.display!.split(' , ');
        expect(shown).toContain('?');
        expect(Number(q.options[q.answer].text)).not.toBeNaN();
      }
    }
  });
});

describe('question banks', () => {
  it('have unique ids and 3 distinct distractors', () => {
    for (const bank of [ANALOGY_BANK, LOGIC_BANK, READING_BANK]) {
      const ids = bank.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const b of bank) {
        expect(b.distractors.length).toBeGreaterThanOrEqual(3);
        expect(b.distractors).not.toContain(b.correct);
        expect(new Set(b.distractors.slice(0, 3)).size).toBe(3);
        expect(b.level).toBeGreaterThanOrEqual(1);
        expect(b.level).toBeLessThanOrEqual(5);
      }
    }
  });
});
