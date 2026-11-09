import type { Option, Question, ShapeKind, ShapeSpec } from '../types';
import { finalize, pick, randInt, shuffle, uid } from './util';
import { COLORS, sameShape } from './shapes';

// ---------------------------------------------------------------------------
// Three-row series: the same rule repeats in every row, but restarts each row
// (like part 5b of the official demo test).
// ---------------------------------------------------------------------------

type RowRule = 'dots' | 'rotate' | 'grow';

export function rowsSeries(level: number): Question {
  const rule: RowRule = level <= 2 ? 'dots' : level <= 3 ? pick(['dots', 'rotate'] as RowRule[]) : pick(['dots', 'rotate', 'grow'] as RowRule[]);
  const cells: ShapeSpec[] = [];
  let correct: ShapeSpec;
  let makers: (() => ShapeSpec)[];
  let explanation: string;
  let hint: string;

  if (rule === 'dots') {
    // each row: count goes up by `step`; each row starts from a different count
    const kind = pick(['circle', 'square', 'star', 'heart'] as ShapeKind[]);
    const color = pick(COLORS);
    const step = level >= 4 ? 2 : 1;
    const starts = shuffle([1, 2, 3]).slice(0, 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push({ kind, color, count: starts[r] + step * c });
    correct = cells[8];
    makers = [
      () => ({ ...correct, count: correct.count! + pick([-2, -1, 1]) }),
      () => ({ ...correct, count: cells[5].count }),
      () => ({ ...correct, kind: pick(['circle', 'square', 'star', 'heart'].filter((k) => k !== kind) as ShapeKind[]) }),
    ];
    hint = 'בדקי מה קורה בתוך כל שורה, משמאל לימין. השורה האחרונה מתחילה ממקום אחר, אבל הכלל זהה.';
    explanation = `בכל שורה מספר הצורות גדל ב-${step} משמאל לימין. בשורה השלישית: ${cells[6].count}, ${cells[7].count}, ולכן ${correct.count}.`;
  } else if (rule === 'rotate') {
    const color = pick(COLORS);
    const step = pick([90, 45]);
    const starts = shuffle([0, 90, 180, 270]).slice(0, 3);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) cells.push({ kind: 'arrow', color, rotation: (starts[r] + step * c) % 360 });
    correct = cells[8];
    makers = [
      () => ({ ...correct, rotation: (correct.rotation! + pick([45, 90, 180, 270])) % 360 }),
      () => ({ ...correct, rotation: cells[7].rotation }),
    ];
    hint = 'עקבי אחרי החץ בכל שורה: לאן הוא מסתובב בכל צעד?';
    explanation = `בכל שורה החץ מסתובב ב-${step} מעלות עם כיוון השעון בכל צעד. כל שורה מתחילה מכיוון אחר, אבל הסיבוב זהה.`;
  } else {
    // a shape gets one more side each step; each row starts from a different polygon
    const POLY: ShapeKind[] = ['triangle', 'square', 'pentagon', 'hexagon', 'heptagon', 'octagon'];
    const color = pick(COLORS);
    const starts = shuffle([0, 1, 2, 3]).slice(0, 3);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) cells.push({ kind: POLY[starts[r] + c], color, filled: false });
    correct = cells[8];
    makers = [
      () => ({ ...correct, kind: POLY[Math.max(0, POLY.indexOf(correct.kind) - pick([1, 2]))] }),
      () => ({ ...correct, kind: POLY[Math.min(5, POLY.indexOf(correct.kind) + 1)] }),
      () => ({ ...correct, filled: true }),
    ];
    hint = 'ספרי צלעות בכל צורה. מה קורה למספר הצלעות בכל שורה?';
    explanation = 'בכל שורה לכל צורה יש צלע אחת יותר מהצורה שלפניה. כל שורה מתחילה ממצולע אחר.';
  }

  const distractors: ShapeSpec[] = [];
  for (let g = 0; distractors.length < 3 && g < 200; g++) {
    const d = pick(makers)();
    if (!sameShape(d, correct) && !distractors.some((x) => sameShape(x, d))) distractors.push(d);
  }
  const { options, answer } = finalize({ shape: correct } as Option, distractors.map((s) => ({ shape: s })));
  return {
    id: uid('rows'),
    topic: 'shapes',
    level,
    prompt: 'בכל שורה הצורות משתנות לפי אותו כלל, והכלל מתחיל מחדש בכל שורה. מה הצורה החסרה?',
    grid: [...cells.slice(0, 8), null],
    gridCols: 3,
    options,
    answer,
    hint,
    explanation,
  };
}

// ---------------------------------------------------------------------------
// Carpet with a missing piece: a repeating pattern with a 2x2 hole.
// ---------------------------------------------------------------------------

const CARPET_COLS = 8;
const CARPET_ROWS = 6;

type Pattern = { color: (x: number, y: number) => string; text: string };

function pattern(level: number): Pattern {
  const pal = shuffle(COLORS);
  const opts: Pattern[][] = [
    [
      { color: (x, y) => pal[(x + y) % 2], text: 'לוח שחמט: הצבעים מתחלפים בכל משבצת, גם לרוחב וגם לאורך' },
      { color: (_x, y) => pal[y % 2], text: 'פסים לרוחב: כל שורה בצבע אחר, והצבעים מתחלפים' },
    ],
    [
      { color: (_x, y) => pal[y % 3], text: 'פסים לרוחב בשלושה צבעים שחוזרים על עצמם' },
      { color: (x) => pal[x % 3], text: 'פסים לאורך בשלושה צבעים שחוזרים על עצמם' },
    ],
    [
      { color: (x, y) => pal[(x + y) % 3], text: 'פסים אלכסוניים בשלושה צבעים' },
      { color: (x, y) => pal[(Math.floor(x / 2) + Math.floor(y / 2)) % 2], text: 'לוח שחמט של ריבועים גדולים (2×2)' },
    ],
    [
      { color: (x, y) => pal[(x - y + 30) % 3], text: 'פסים אלכסוניים לכיוון השני, בשלושה צבעים' },
      { color: (x, y) => pal[(x + 2 * y) % 4], text: 'ארבעה צבעים שזזים בכל שורה שני צעדים' },
    ],
    [
      { color: (x, y) => pal[(x % 2) + 2 * (y % 2)], text: 'ריבוע של ארבעה צבעים שחוזר על עצמו' },
      { color: (x, y) => pal[(x + 2 * y) % 3], text: 'שלושה צבעים: בכל שורה הדוגמה זזה שני צעדים' },
      { color: (x, y) => ((x + y) % 4 === 0 ? pal[0] : (x - y + 40) % 4 === 0 ? pal[1] : pal[2]), text: 'שני סוגי אלכסונים שמצטלבים' },
    ],
  ];
  return pick(opts[Math.min(5, Math.max(1, level)) - 1]);
}

const patchAt = (p: Pattern, x: number, y: number) => [p.color(x, y), p.color(x + 1, y), p.color(x, y + 1), p.color(x + 1, y + 1)];
const samePatch = (a: string[], b: string[]) => a.every((c, i) => c === b[i]);

export function carpet(level: number): Question {
  for (;;) {
    const p = pattern(level);
    const hx = randInt(1, CARPET_COLS - 3);
    const hy = randInt(1, CARPET_ROWS - 3);
    const correct = patchAt(p, hx, hy);
    const used = new Set(Array.from({ length: CARPET_COLS * CARPET_ROWS }, (_, i) => p.color(i % CARPET_COLS, Math.floor(i / CARPET_COLS))));
    const palette = [...used];
    const candidates: string[][] = [
      patchAt(p, hx + 1, hy),
      patchAt(p, hx, hy + 1),
      patchAt(p, hx + 1, hy + 1),
      patchAt(p, hx - 1, hy),
      [correct[1], correct[0], correct[3], correct[2]], // mirrored
      [correct[2], correct[3], correct[0], correct[1]], // upside down
      correct.map((c, i) => (i === 3 ? palette.find((x) => x !== c) ?? c : c)), // one tile wrong
      correct.map((c, i) => (i === 0 ? palette.find((x) => x !== c) ?? c : c)),
    ];
    const distractors: string[][] = [];
    for (const c of shuffle(candidates)) {
      if (distractors.length === 3) break;
      if (!samePatch(c, correct) && !distractors.some((d) => samePatch(d, c))) distractors.push(c);
    }
    if (distractors.length < 3) continue;
    const cells: (string | null)[] = [];
    for (let y = 0; y < CARPET_ROWS; y++)
      for (let x = 0; x < CARPET_COLS; x++) cells.push(x >= hx && x <= hx + 1 && y >= hy && y <= hy + 1 ? null : p.color(x, y));
    const { options, answer } = finalize({ patch: correct }, distractors.map((d) => ({ patch: d })));
    return {
      id: uid('carp'),
      topic: 'shapes',
      level,
      prompt: 'לפניך שטיח שחסרה בו חתיכה. איזו חתיכה משלימה את השטיח?',
      carpet: { cols: CARPET_COLS, rows: CARPET_ROWS, cells },
      options,
      answer,
      hint: 'מצאי את הדוגמה שחוזרת בשטיח. הסתכלי על המשבצות שמסביב לחור: מה צריך להיות מעליהן, מתחתן ובצדדים?',
      explanation: `הדוגמה בשטיח: ${p.text}. רק החתיכה הנכונה ממשיכה את הדוגמה מכל הכיוונים.`,
    };
  }
}
