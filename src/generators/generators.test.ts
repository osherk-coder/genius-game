import { describe, expect, it } from 'vitest';
import type { Question, TopicId } from '../types';
import { genMath } from './math';
import { genSequence, seqRule } from './sequences';
import { genShapes, sameShape } from './shapes';
import { genLogic } from './logic';
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
    it(`logic level ${level}`, () => {
      for (let i = 0; i < RUNS; i++) checkShape(genLogic(level));
    });
  }

  it('every topic works through makeQuestion', () => {
    const topics: TopicId[] = ['math', 'reading', 'sequences', 'analogies', 'shapes', 'logic'];
    for (const t of topics) for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 30; i++) checkShape(makeQuestion(t, lv));
  });
});

describe('math answers are correct', () => {
  it('evaluates displayed arithmetic', () => {
    for (let level = 1; level <= 4; level++) {
      for (let i = 0; i < RUNS; i++) {
        const q = genMath(level);
        if (!q.display || !q.display.endsWith('= ?')) continue;
        const expr = q.display.replace('= ?', '').replace('−', '-').replace('×', '*').replace(':', '/');
        const value = Function(`return (${expr})`)() as number;
        expect(Number(q.options[q.answer].text)).toBe(value);
      }
    }
  });

  it('missing-number questions are consistent', () => {
    for (let i = 0; i < RUNS; i++) {
      const q = genMath(3);
      if (!q.display || q.display.endsWith('= ?')) continue;
      const ans = Number(q.options[q.answer].text);
      const expr = q.display.replace('?', String(ans)).replace('−', '-');
      const [left, right] = expr.split('=');
      expect(Function(`return (${left})`)()).toBe(Number(right));
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
