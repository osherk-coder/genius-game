import type { Option, Question, ShapeKind, ShapeSpec } from '../types';
import { finalize, pick, randInt, shuffle, uid } from './util';

export const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
const KINDS: ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'diamond', 'hexagon', 'heart'];

export const sameShape = (a: ShapeSpec, b: ShapeSpec) =>
  a.kind === b.kind &&
  a.color === b.color &&
  (a.count ?? 1) === (b.count ?? 1) &&
  ((a.rotation ?? 0) % 360) === ((b.rotation ?? 0) % 360) &&
  (a.filled ?? true) === (b.filled ?? true);

function uniqueDistractors(correct: ShapeSpec, makers: (() => ShapeSpec)[], count = 3): ShapeSpec[] {
  const out: ShapeSpec[] = [];
  let guard = 0;
  while (out.length < count && guard++ < 200) {
    const d = pick(makers)();
    if (!sameShape(d, correct) && !out.some((o) => sameShape(o, d))) out.push(d);
  }
  return out;
}

const shapeOptions = (correct: ShapeSpec, distractors: ShapeSpec[]) =>
  finalize({ shape: correct } as Option, distractors.map((s) => ({ shape: s })));

/** 3x3 matrix: rows and columns follow rules, one cell missing. */
function matrix(level: number): Question {
  const kinds = shuffle(KINDS).slice(0, 3);
  const colors = shuffle(COLORS).slice(0, 3);
  const useCount = level >= 4;
  const latin = level >= 3;
  const cells: ShapeSpec[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const kind = latin ? kinds[(r + c) % 3] : kinds[r];
      const color = latin ? colors[(r + 2 * c) % 3] : colors[c];
      const count = useCount ? (level >= 5 ? ((2 * r + c) % 3) + 1 : c + 1) : 1;
      cells.push({ kind, color, count });
    }
  }
  const missing = level >= 4 ? randInt(0, 8) : 8;
  const correct = cells[missing];
  const otherKinds = [...kinds, pick(KINDS.filter((k) => !kinds.includes(k)))];
  const distractors = uniqueDistractors(correct, [
    () => ({ ...correct, kind: pick(otherKinds) }),
    () => ({ ...correct, color: pick(colors) }),
    () => ({ ...correct, count: useCount ? randInt(1, 3) : 1, kind: pick(kinds) }),
    () => ({ ...correct, kind: pick(kinds), color: pick(colors) }),
  ]);
  const grid: (ShapeSpec | null)[] = cells.map((c, i) => (i === missing ? null : c));
  const { options, answer } = shapeOptions(correct, distractors);
  return {
    id: uid('mat'),
    topic: 'shapes',
    level,
    prompt: 'איזו צורה חסרה בטבלה?',
    grid,
    gridCols: 3,
    options,
    answer,
    hint: latin
      ? 'בכל שורה ובכל עמודה כל צורה וכל צבע מופיעים פעם אחת בדיוק.'
      : 'בדקי מה משותף לכל שורה, ומה משותף לכל עמודה.',
    explanation: latin
      ? 'בכל שורה ועמודה מופיעים שלושה סוגי צורות ושלושה צבעים, כל אחד פעם אחת. הצורה החסרה היא זו שמשלימה את השורה ואת העמודה.'
      : 'בכל שורה יש אותה צורה, ובכל עמודה אותו צבע.',
  };
}

/** A row of shapes that changes step by step (rotation / count / color cycle). */
function series(level: number): Question {
  const type = level <= 2 ? pick(['count', 'color']) : pick(['rotate', 'count', 'rotateColor']);
  const items: ShapeSpec[] = [];
  let correct: ShapeSpec;
  let rule = '';
  let hint = '';
  let makers: (() => ShapeSpec)[] = [];
  if (type === 'rotate' || type === 'rotateColor') {
    const step = level >= 4 ? pick([45, 135]) : pick([45, 90]);
    const start = pick([0, 90, 180, 270]);
    const colors = shuffle(COLORS).slice(0, 2);
    for (let i = 0; i < 5; i++)
      items.push({ kind: 'arrow', color: type === 'rotateColor' ? colors[i % 2] : colors[0], rotation: (start + step * i) % 360 });
    correct = { kind: 'arrow', color: type === 'rotateColor' ? colors[1] : colors[0], rotation: (start + step * 5) % 360 };
    rule = `החץ מסתובב ב-${step} מעלות עם כיוון השעון בכל צעד` + (type === 'rotateColor' ? ', והצבע מתחלף' : '');
    hint = 'עקבי אחרי הכיוון שהחץ מצביע אליו בכל צעד.';
    makers = [
      () => ({ ...correct, rotation: (correct.rotation! + pick([45, 90, 180, 270, 315])) % 360 }),
      () => ({ ...correct, color: colors[0] === correct.color ? colors[1] : colors[0] }),
    ];
  } else if (type === 'count') {
    const kind = pick(KINDS);
    const color = pick(COLORS);
    const startC = 1;
    const step = level >= 2 ? pick([1, 2]) : 1;
    const len = step === 2 ? 3 : 4;
    for (let i = 0; i < len; i++) items.push({ kind, color, count: startC + step * i });
    correct = { kind, color, count: startC + step * len };
    rule = `מספר הצורות גדל ב-${step} בכל צעד`;
    hint = 'ספרי כמה צורות יש בכל ריבוע.';
    makers = [
      () => ({ ...correct, count: Math.max(1, correct.count! + pick([-2, -1, 1])) }),
      () => ({ ...correct, kind: pick(KINDS) }),
    ];
  } else {
    const kind = pick(KINDS);
    const cyc = shuffle(COLORS).slice(0, 3);
    for (let i = 0; i < 5; i++) items.push({ kind, color: cyc[i % 3] });
    correct = { kind, color: cyc[5 % 3] };
    rule = 'הצבעים חוזרים על עצמם בסדר קבוע';
    hint = 'חפשי את החלק שחוזר על עצמו.';
    makers = [() => ({ ...correct, color: pick(COLORS) }), () => ({ ...correct, kind: pick(KINDS) })];
  }
  const distractors = uniqueDistractors(correct, makers);
  const { options, answer } = shapeOptions(correct, distractors);
  return {
    id: uid('ser'),
    topic: 'shapes',
    level,
    prompt: 'מה הצורה הבאה בסדרה? (קוראים מימין לשמאל)',
    grid: [...items, null],
    gridCols: items.length + 1,
    options,
    answer,
    hint,
    explanation: rule + '.',
  };
}

/** Odd one out: all shapes share a property except one. */
function oddOne(level: number): Question {
  const n = 4;
  const kind = pick(KINDS);
  const color = pick(COLORS);
  let base: ShapeSpec[];
  let odd: ShapeSpec;
  let rule: string;
  if (level <= 2) {
    base = Array.from({ length: n - 1 }, () => ({ kind, color }));
    odd = Math.random() < 0.5 ? { kind: pick(KINDS.filter((k) => k !== kind)), color } : { kind, color: pick(COLORS.filter((c) => c !== color)) };
    rule = odd.kind !== kind ? 'כל הצורות זהות חוץ מאחת שהיא צורה אחרת' : 'כל הצורות באותו צבע חוץ מאחת';
  } else if (level <= 3) {
    // same kind, different colors; odd has different kind
    const cols = shuffle(COLORS);
    base = Array.from({ length: n - 1 }, (_, i) => ({ kind, color: cols[i] }));
    odd = { kind: pick(KINDS.filter((k) => k !== kind)), color: cols[n - 1] };
    rule = 'הצבעים שונים, אבל רק צורה אחת היא מסוג אחר';
  } else {
    // arrows: all rotations are multiples of 90 except one (diagonal), or filled vs outline
    if (Math.random() < 0.5) {
      const rots = shuffle([0, 90, 180, 270]);
      base = rots.slice(0, n - 1).map((r) => ({ kind: 'arrow' as ShapeKind, color, rotation: r }));
      odd = { kind: 'arrow', color, rotation: pick([45, 135, 225, 315]) };
      rule = 'כל החצים מצביעים ישר (למעלה, למטה, ימינה, שמאלה) חוץ מאחד שמצביע באלכסון';
    } else {
      const ks = shuffle(KINDS);
      base = ks.slice(0, n - 1).map((k, i) => ({ kind: k, color: COLORS[i], filled: true }));
      odd = { kind: ks[n - 1], color: COLORS[n - 1], filled: false };
      rule = 'כל הצורות צבועות מבפנים חוץ מאחת שהיא רק קו מתאר';
    }
  }
  const { options, answer } = finalize({ shape: odd }, base.map((s) => ({ shape: s })));
  return {
    id: uid('odd'),
    topic: 'shapes',
    level,
    prompt: 'איזו צורה יוצאת דופן?',
    options,
    answer,
    hint: 'מה משותף לשלוש מהצורות ולא לרביעית? בדקי צורה, צבע, כיוון ומילוי.',
    explanation: rule + '.',
  };
}

export function genShapes(level: number): Question {
  const lv = Math.min(5, Math.max(1, level));
  const r = Math.random();
  if (r < 0.45) return matrix(lv);
  if (r < 0.8) return series(lv);
  return oddOne(lv);
}
