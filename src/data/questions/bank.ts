import type { Question, TopicId } from '../../types';
import { finalize } from '../../generators/util';

export interface BankItem {
  id: string;
  level: number;
  prompt: string;
  display?: string;
  passage?: string;
  correct: string;
  distractors: string[];
  hint: string;
  explanation: string;
}

export function bankToQuestion(item: BankItem, topic: TopicId): Question {
  const { options, answer } = finalize(
    { text: item.correct },
    item.distractors.slice(0, 3).map((t) => ({ text: t })),
  );
  return {
    id: `${topic}-${item.id}`,
    topic,
    level: item.level,
    prompt: item.prompt,
    display: item.display,
    passage: item.passage,
    options,
    answer,
    hint: item.hint,
    explanation: item.explanation,
  };
}
