import type { Question, TopicId } from '../types';
import { genMath } from '../generators/math';
import { genSequence } from '../generators/sequences';
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

function fromBank(topic: TopicId, level: number, exclude: Set<string>): Question {
  const bank = BANKS[topic]!;
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
      return genSequence(level);
    case 'shapes':
      return genShapes(level);
    case 'logic':
      return Math.random() < 0.45 ? genLogic(level) : fromBank('logic', level, exclude);
    default:
      return fromBank(topic, level, exclude);
  }
}

/** A fixed list of questions for the exam simulation. */
export function buildExam(topics: TopicId[], levels: Record<TopicId, number>, count: number): Question[] {
  const exclude = new Set<string>();
  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    const level = Math.min(5, Math.max(2, levels[topic] + 1));
    const q = makeQuestion(topic, level, exclude);
    exclude.add(q.id);
    out.push(q);
  }
  return shuffle(out);
}
