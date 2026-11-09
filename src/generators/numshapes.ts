import type { NumFigure, Question } from '../types';
import { numericQuestion, pick, randInt, uid } from './util';

interface Rule {
  f: (a: number, b: number) => number;
  /** Solve for b given a and the result (when the missing number is on top). */
  inv?: (a: number, out: number) => number;
  text: string;
  range: [number, number];
  ok?: (a: number, b: number) => boolean;
}

const RULES: Rule[][] = [
  [{ f: (a, b) => a + b, inv: (a, o) => o - a, text: 'המספר למטה שווה לסכום של שני המספרים למעלה', range: [1, 12] }],
  [
    { f: (a, b) => a + b, inv: (a, o) => o - a, text: 'המספר למטה שווה לסכום של שני המספרים למעלה', range: [5, 25] },
    { f: (a, b) => a - b, inv: (a, o) => a - o, text: 'המספר למטה שווה להפרש: השמאלי פחות הימני', range: [2, 20], ok: (a, b) => a > b },
  ],
  [
    { f: (a, b) => a * b, inv: (a, o) => o / a, text: 'המספר למטה שווה למכפלה של שני המספרים למעלה', range: [2, 9] },
    { f: (a, b) => a + b + 1, inv: (a, o) => o - 1 - a, text: 'המספר למטה שווה לסכום של המספרים למעלה ועוד 1', range: [2, 15] },
  ],
  [
    { f: (a, b) => a * b - 1, text: 'המספר למטה שווה למכפלה של המספרים למעלה פחות 1', range: [2, 8] },
    { f: (a, b) => (a + b) * 2, text: 'מחברים את המספרים למעלה וכופלים ב-2', range: [2, 12] },
    { f: (a, b) => a * b, inv: (a, o) => o / a, text: 'המספר למטה שווה למכפלה של שני המספרים למעלה', range: [2, 10] },
  ],
  [
    { f: (a, b) => a * b + a, text: 'כופלים את שני המספרים למעלה, ומוסיפים את המספר השמאלי', range: [2, 7] },
    { f: (a, b) => (a - b) * 3, text: 'מחסירים: השמאלי פחות הימני, וכופלים ב-3', range: [2, 12], ok: (a, b) => a > b },
    { f: (a, b) => a * a + b, text: 'כופלים את המספר השמאלי בעצמו, ומוסיפים את הימני', range: [2, 6] },
  ],
];

function pair(r: Rule): [number, number] {
  for (;;) {
    const a = randInt(r.range[0], r.range[1]);
    const b = randInt(r.range[0], r.range[1]);
    if (!r.ok || r.ok(a, b)) return [a, b];
  }
}

function circles(level: number): Question {
  const rule = pick(RULES[level - 1]);
  const cells: [number, number, number][] = [];
  const seen = new Set<string>();
  while (cells.length < 3) {
    const [a, b] = pair(rule);
    const key = `${a},${b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cells.push([a, b, rule.f(a, b)]);
  }
  const [a, b, out] = cells[2];
  const missingTop = level >= 3 && !!rule.inv && Math.random() < 0.4;
  const answer = missingTop ? b : out;
  const fig: NumFigure = {
    kind: 'circles',
    cells: cells.map((c, i): [number | null, number | null, number | null] =>
      i < 2 ? c : missingTop ? [a, null, out] : [a, b, null],
    ),
  };
  const q = numericQuestion(answer, [answer + 1, answer - 1, a + b, a * b, answer + 2, out - a, answer * 2]);
  return {
    id: uid('ncir'),
    topic: 'sequences',
    level,
    prompt: 'בכל עיגול המספרים מסודרים לפי אותו כלל. איזה מספר צריך להיות במקום סימן השאלה?',
    numFigure: fig,
    options: q.options,
    answer: q.answer,
    hint: 'בדקי את העיגול הראשון: איך מגיעים מהמספרים למעלה למספר למטה? ודאי שזה עובד גם בעיגול השני.',
    explanation: `${rule.text}. בעיגול השלישי: ${a} ו-${b} נותנים ${out}. התשובה: ${answer}.`,
  };
}

function machine(level: number): Question {
  const rows: [number | null, string, number | null][] = [];
  let answer: number;
  let explanation: string;
  if (level <= 2) {
    const op = pick(['+', '−', '×']);
    const n = op === '×' ? randInt(2, 5) : randInt(2, 9);
    const f = (x: number) => (op === '+' ? x + n : op === '−' ? x - n : x * n);
    const xs = [randInt(n + 2, 12), randInt(n + 2, 15), randInt(n + 2, 20)];
    xs.forEach((x, i) => rows.push([x, `${op}${n}`, i < 2 ? f(x) : null]));
    answer = f(xs[2]);
    explanation = `המכונה עושה ${op}${n}: ${xs[2]} ${op} ${n} = ${answer}`;
  } else if (level <= 3) {
    // hidden single operation
    const op = pick(['+', '×']);
    const n = op === '×' ? randInt(2, 5) : randInt(3, 15);
    const f = (x: number) => (op === '+' ? x + n : x * n);
    const xs = [randInt(2, 9), randInt(2, 9), randInt(3, 12)];
    if (xs[0] === xs[1]) xs[1]++;
    xs.forEach((x, i) => rows.push([x, '?', i < 2 ? f(x) : null]));
    answer = f(xs[2]);
    explanation = `המכונה עושה ${op === '+' ? 'ועוד' : 'כפול'} ${n}: ${xs[2]} ${op} ${n} = ${answer}`;
  } else {
    // the number in the box changes; the hidden operation stays the same
    const op = level === 4 ? pick(['×', '+']) : pick(['×', ':']);
    const ns = [randInt(2, 5), randInt(2, 6)];
    const f = (x: number, n: number) => (op === '×' ? x * n : op === '+' ? x + n : x / n);
    const make = (n: number) => (op === ':' ? n * randInt(2, 9) : randInt(3, 12));
    const x1 = make(ns[0]);
    const x2 = make(ns[1]);
    rows.push([x1, String(ns[0]), f(x1, ns[0])]);
    rows.push([x2, String(ns[1]), null]);
    answer = f(x2, ns[1]);
    const word = op === '×' ? 'כופלת' : op === '+' ? 'מוסיפה' : 'מחלקת';
    explanation = `המכונה ${word} במספר שבתוך הריבוע (${x1} ${op} ${ns[0]} = ${f(x1, ns[0])}). לכן ${x2} ${op} ${ns[1]} = ${answer}`;
  }
  const q = numericQuestion(answer, [answer + 1, answer - 1, answer + 2, answer * 2, answer - 2]);
  return {
    id: uid('nmac'),
    topic: 'sequences',
    level,
    prompt: 'המספרים עוברים במכונה לפי החץ. איזה מספר יוצא במקום סימן השאלה?',
    numFigure: { kind: 'machine', rows },
    options: q.options,
    answer: q.answer,
    hint: 'בדקי מה המכונה עשתה למספר בשורה הראשונה, ועשי את אותו הדבר בשורה האחרונה.',
    explanation,
  };
}

export function genNumShapes(level: number): Question {
  const lv = Math.min(5, Math.max(1, level));
  return Math.random() < 0.6 ? circles(lv) : machine(lv);
}
