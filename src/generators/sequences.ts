import type { Question } from '../types';
import { numericQuestion, pick, randInt, uid } from './util';

export interface SeqRule {
  terms: number[];
  next: number;
  hint: string;
  rule: string;
}

function arithmetic(minStep: number, maxStep: number, down = false): SeqRule {
  const step = randInt(minStep, maxStep);
  const start = down ? randInt(step * 6, step * 6 + 40) : randInt(1, 30);
  const s = down ? -step : step;
  const terms = Array.from({ length: 5 }, (_, i) => start + s * i);
  return {
    terms,
    next: start + s * 5,
    hint: 'בדקי בכמה המספרים גדלים או קטנים בכל צעד.',
    rule: down ? `בכל צעד מורידים ${step}` : `בכל צעד מוסיפים ${step}`,
  };
}

function multiply(factor: number): SeqRule {
  const start = factor === 2 ? randInt(1, 6) : randInt(1, 3);
  const terms = Array.from({ length: 4 }, (_, i) => start * factor ** i);
  return { terms, next: start * factor ** 4, hint: 'המספרים גדלים מהר. אולי זה כפל?', rule: `בכל צעד כופלים ב-${factor}` };
}

function growingStep(): SeqRule {
  const start = randInt(1, 15);
  const first = randInt(1, 3);
  const terms = [start];
  for (let i = 0; i < 4; i++) terms.push(terms[i] + first + i);
  return {
    terms,
    next: terms[4] + first + 4,
    hint: 'כתבי את ההפרשים בין המספרים. מה קורה להם?',
    rule: `ההפרש גדל ב-1 בכל צעד: +${first}, +${first + 1}, +${first + 2}...`,
  };
}

function alternating(): SeqRule {
  const a = randInt(2, 6);
  let b = randInt(1, 9);
  if (b === a) b++;
  const down = Math.random() < 0.4;
  const start = randInt(down ? 40 : 1, down ? 60 : 20);
  const terms = [start];
  for (let i = 0; i < 5; i++) terms.push(terms[i] + (i % 2 === 0 ? a : down ? -b : b));
  return {
    terms,
    next: terms[5] + (5 % 2 === 0 ? a : down ? -b : b),
    hint: 'אולי יש שני צעדים שמתחלפים זה עם זה?',
    rule: down ? `מתחלף: +${a}, −${b}` : `מתחלף: +${a}, +${b}`,
  };
}

function interleaved(): SeqRule {
  const a0 = randInt(1, 10);
  const b0 = randInt(20, 40);
  const as = randInt(2, 5);
  const bs = randInt(1, 3);
  const terms: number[] = [];
  for (let i = 0; i < 6; i++) terms.push(i % 2 === 0 ? a0 + as * (i / 2) : b0 - bs * ((i - 1) / 2));
  return {
    terms,
    next: a0 + as * 3,
    hint: 'הסתכלי רק על המספרים במקומות 1, 3, 5. ואז על 2, 4, 6.',
    rule: `שתי סדרות שזורות: אחת עולה ב-${as}, השנייה יורדת ב-${bs}`,
  };
}

function doubleplus(): SeqRule {
  const start = randInt(1, 4);
  const terms = [start];
  for (let i = 0; i < 4; i++) terms.push(terms[i] * 2 + 1);
  return { terms, next: terms[4] * 2 + 1, hint: 'נסי לכפול כל מספר. מה עוד צריך לעשות?', rule: 'כופלים ב-2 ומוסיפים 1' };
}

function squares(): SeqRule {
  const s = randInt(1, 3);
  const terms = Array.from({ length: 5 }, (_, i) => (s + i) * (s + i));
  return { terms, next: (s + 5) * (s + 5), hint: 'האם המספרים הם מספר כפול עצמו?', rule: `מספר כפול עצמו: ${s}×${s}, ${s + 1}×${s + 1}...` };
}

function fibonacci(): SeqRule {
  const a = randInt(1, 4);
  const b = randInt(a, a + 4);
  const terms = [a, b];
  for (let i = 2; i < 6; i++) terms.push(terms[i - 1] + terms[i - 2]);
  return { terms, next: terms[5] + terms[4], hint: 'נסי לחבר שני מספרים צמודים.', rule: 'כל מספר הוא סכום שני המספרים שלפניו' };
}

function doublingDiff(): SeqRule {
  const start = randInt(1, 10);
  const terms = [start];
  let d = 1;
  for (let i = 0; i < 4; i++) {
    terms.push(terms[i] + d);
    d *= 2;
  }
  return { terms, next: terms[4] + d, hint: 'כתבי את ההפרשים. מה הקשר ביניהם?', rule: 'ההפרש מוכפל ב-2 בכל צעד: +1, +2, +4, +8...' };
}

function missingMiddle(): SeqRule {
  // handled by caller: a constant-step sequence where a middle term is missing
  return arithmetic(3, 12);
}

export function seqRule(level: number): { r: SeqRule; missingIndex: number | null } {
  switch (level) {
    case 1:
      return { r: arithmetic(2, 10), missingIndex: null };
    case 2:
      return { r: pick([() => arithmetic(2, 10, true), () => multiply(2), () => arithmetic(5, 25)])(), missingIndex: null };
    case 3:
      if (Math.random() < 0.3) return { r: missingMiddle(), missingIndex: randInt(1, 3) };
      return { r: pick([growingStep, alternating, () => multiply(3)])(), missingIndex: null };
    case 4:
      return { r: pick([interleaved, doubleplus, squares, alternating])(), missingIndex: null };
    default:
      return { r: pick([fibonacci, doublingDiff, interleaved, doubleplus])(), missingIndex: null };
  }
}

export function genSequence(level: number): Question {
  const lv = Math.min(5, Math.max(1, level));
  const { r, missingIndex } = seqRule(lv);
  let shown: string;
  let answer: number;
  if (missingIndex !== null) {
    answer = r.terms[missingIndex];
    shown = r.terms.map((t, i) => (i === missingIndex ? '?' : String(t))).join(' , ');
  } else {
    answer = r.next;
    shown = [...r.terms.map(String), '?'].join(' , ');
  }
  const last = r.terms[r.terms.length - 1];
  const step = r.terms[1] - r.terms[0];
  const q = numericQuestion(answer, [answer + 1, answer - 1, answer + step, last + step, answer + 2, answer - 2]);
  return {
    id: uid('seq'),
    topic: 'sequences',
    level: lv,
    prompt: missingIndex !== null ? 'איזה מספר חסר בסדרה?' : 'איזה מספר ממשיך את הסדרה?',
    display: shown,
    options: q.options,
    answer: q.answer,
    hint: r.hint,
    explanation: `${r.rule}. התשובה: ${answer}`,
  };
}
