import type { Option, Question } from '../types';
import { finalize, numericQuestion, pick, randInt, shuffle, uid } from './util';

const GIRLS = ['נועה', 'מאיה', 'תמר', 'יעל', 'שירה', 'רוני', 'אביגיל', 'הילה'];
const BOYS = ['דני', 'יונתן', 'איתי', 'עומר', 'אורי', 'נדב', 'אלון', 'גיל'];

interface Built {
  prompt: string;
  display?: string;
  ltr?: boolean;
  answer: number;
  distractors: number[];
  hint: string;
  explanation: string;
  /** Format options (e.g. as clock times or with units). */
  format?: (n: number) => string;
  /** Pre-built options (for questions where only one option may satisfy a condition). */
  custom?: { options: string[]; answer: number };
}

// ---------- exercises ----------

function addSub(big = false): Built {
  if (Math.random() < 0.5) {
    const a = randInt(big ? 25 : 12, big ? 75 : 60);
    const b = randInt(5, 99 - a);
    const ans = a + b;
    return {
      prompt: 'כמה זה?',
      display: `${a} + ${b} = ___`,
      ltr: true,
      answer: ans,
      distractors: [ans + 10, ans - 10, ans + 1, ans - 1],
      hint: 'חברי קודם את העשרות ואחר כך את האחדות.',
      explanation: `${a} + ${b} = ${ans}`,
    };
  }
  const a = randInt(big ? 60 : 30, big ? 140 : 99);
  const b = randInt(5, Math.min(a - 5, big ? 60 : 40));
  const ans = a - b;
  return {
    prompt: 'כמה זה?',
    display: `${a} − ${b} = ___`,
    ltr: true,
    answer: ans,
    distractors: [ans + 10, ans - 10, ans + 2, ans - 2],
    hint: 'טריק: קודם מורידים עד לעשרת השלמה, ואחר כך את השאר.',
    explanation: `${a} − ${b} = ${ans}. בדיקה: ${ans} + ${b} = ${a}`,
  };
}

function mulDiv(): Built {
  if (Math.random() < 0.55) {
    const a = randInt(3, 10);
    const b = randInt(3, 10);
    const ans = a * b;
    return {
      prompt: 'כמה זה?',
      display: `${a} × ${b} = ___`,
      ltr: true,
      answer: ans,
      distractors: [a * (b + 1), a * (b - 1), ans + 2, a + b],
      hint: `${a} × ${b} זה ${b} פעמים ${a}.`,
      explanation: `${a} × ${b} = ${ans}`,
    };
  }
  const b = randInt(2, 10);
  const ans = randInt(2, 10);
  const a = ans * b;
  return {
    prompt: 'כמה זה?',
    display: `${a} : ${b} = ___`,
    ltr: true,
    answer: ans,
    distractors: [ans + 1, ans - 1, ans + 2, b],
    hint: `איזה מספר כפול ${b} נותן ${a}?`,
    explanation: `${a} : ${b} = ${ans}, כי ${ans} × ${b} = ${a}`,
  };
}

function orderOfOps(): Built {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 20);
  const ans = c + a * b;
  return {
    prompt: 'כמה זה? (זכרי: כפל לפני חיבור)',
    display: `${c} + ${a} × ${b} = ___`,
    ltr: true,
    answer: ans,
    distractors: [(c + a) * b, ans + 1, ans - a, c + a + b],
    hint: 'קודם עושים את הכפל, ורק אחר כך את החיבור.',
    explanation: `${a} × ${b} = ${a * b}, ואז ${c} + ${a * b} = ${ans}`,
  };
}

// ---------- smileys (missing number) ----------

function smiley(level: number): Built {
  const S = '🙂';
  const kind = level <= 1 ? randInt(0, 1) : level === 2 ? randInt(0, 2) : randInt(0, 3);
  let display: string;
  let ans: number;
  let explanation: string;
  let distractors: number[];
  if (kind === 0) {
    const a = randInt(10, 60);
    ans = randInt(4, 35);
    display = `${a} + ${S} = ${a + ans}`;
    explanation = `${a + ans} − ${a} = ${ans}, ולכן ${a} + ${ans} = ${a + ans}`;
    distractors = [a + ans + a, ans + 10, ans - 1, ans + 1];
  } else if (kind === 1) {
    // S − b = c  →  S = b + c
    const b = randInt(5, 25);
    const c = randInt(5, 40);
    ans = b + c;
    display = `${S} − ${b} = ${c}`;
    explanation = `החייכן גדול ב-${b} מ-${c}: ${c} + ${b} = ${ans}`;
    distractors = [c - b, ans + 10, ans - 1, ans + 1];
  } else if (kind === 2) {
    const a = randInt(2, 9);
    ans = randInt(2, 10);
    display = `${a} × ${S} = ${a * ans}`;
    explanation = `${a * ans} : ${a} = ${ans}, ולכן ${a} × ${ans} = ${a * ans}`;
    distractors = [ans + 1, ans - 1, a * ans - a, ans + a];
  } else {
    const b = randInt(2, 9);
    ans = randInt(2, 10) * b;
    display = `${S} : ${b} = ${ans / b}`;
    explanation = `${ans / b} × ${b} = ${ans}`;
    distractors = [ans / b + b, ans + b, ans - b, ans / b];
  }
  return {
    prompt: 'החייכן החליף מספר. איזה מספר מסתתר מאחורי החייכן?',
    display,
    ltr: true,
    answer: ans,
    distractors,
    hint: 'נסי להציב כל תשובה במקום החייכן ולבדוק אם התרגיל נכון.',
    explanation,
  };
}

// ---------- inequalities ----------

function inequality(level: number): Built {
  const kind = level <= 2 ? 0 : randInt(0, 2);
  let display: string;
  let ok: (x: number) => boolean;
  let pool: number[];
  let explanation: string;
  let hint: string;
  if (kind === 0) {
    // a + b < a + __  →  x > b
    const a = randInt(20, 70);
    const b = randInt(6, 20);
    const lessThan = Math.random() < 0.5;
    display = lessThan ? `${a} + ${b} < ${a} + ___` : `${a} + ${b} > ${a} + ___`;
    ok = (x) => (lessThan ? x > b : x < b);
    pool = [b - 3, b - 2, b - 1, b, b + 1, b + 2, b + 3];
    hint = `שני הצדדים מתחילים ב-${a}. מספיק להשוות את מה שמוסיפים.`;
    explanation = lessThan
      ? `בשני הצדדים יש ${a}. כדי שהצד הימני יהיה גדול יותר, צריך להוסיף יותר מ-${b}.`
      : `בשני הצדדים יש ${a}. כדי שהצד הימני יהיה קטן יותר, צריך להוסיף פחות מ-${b}.`;
  } else if (kind === 1) {
    // a − b < a − __  →  x < b   (taking away less leaves more)
    const a = randInt(30, 90);
    const b = randInt(6, 20);
    display = `${a} − ${b} < ${a} − ___`;
    ok = (x) => x < b;
    pool = [b - 3, b - 2, b - 1, b, b + 1, b + 2, b + 4];
    hint = 'כשמורידים פחות, נשאר יותר!';
    explanation = `כדי שבצד ימין יישאר יותר, צריך להוריד פחות מ-${b}.`;
  } else {
    // a × b > a × __  →  x < b
    const a = randInt(3, 9);
    const b = randInt(4, 9);
    display = `${a} × ${b} > ${a} × ___`;
    ok = (x) => x < b;
    pool = [b - 3, b - 2, b - 1, b, b + 1, b + 2, b + 3];
    hint = `שני הצדדים כופלים ב-${a}. מספיק להשוות את המספר השני.`;
    explanation = `כדי שהצד הימני יהיה קטן יותר, צריך לכפול ${a} במספר קטן מ-${b}.`;
  }
  pool = pool.filter((x) => x >= 0);
  const good = shuffle(pool.filter(ok));
  const bad = shuffle(pool.filter((x) => !ok(x)));
  const correct = good[0];
  const opts = shuffle([correct, ...bad.slice(0, 3)]);
  return {
    prompt: 'איזה מספר מתאים לקו, כך שאי-השוויון יהיה נכון?',
    display,
    ltr: true,
    answer: correct,
    distractors: [],
    hint,
    explanation: `${explanation} רק ${correct} מתאים מבין התשובות.`,
    custom: { options: opts.map(String), answer: opts.indexOf(correct) },
  };
}

// ---------- picture puzzles ----------

const PICS = [
  ['🍎', '🍌', '🍇'],
  ['⭐', '🌙', '☀️'],
  ['🐶', '🐱', '🐭'],
  ['🚗', '🚲', '✈️'],
  ['🌸', '🍀', '🍄'],
];

function picturePuzzle(level: number): Built {
  const [A, B, C] = pick(PICS);
  if (level <= 1) {
    const a = randInt(2, 9);
    return {
      prompt: `כל ציור מחליף מספר. איזה מספר מתאים ל-${A}?`,
      display: `${A} + ${A} = ${a * 2}`,
      ltr: true,
      answer: a,
      distractors: [a * 2, a + 1, a - 1, a + 2],
      hint: 'שני ציורים זהים הם אותו מספר. מה המספר שאם מחברים אותו לעצמו מקבלים את התוצאה?',
      explanation: `${a} + ${a} = ${a * 2}, לכן ${A} = ${a}`,
    };
  }
  if (level <= 3) {
    const a = randInt(2, 9);
    const b = randInt(2, 12);
    const three = level === 3 && Math.random() < 0.5;
    const second = three ? `${A} + ${A} + ${B} = ${2 * a + b}` : `${A} + ${B} = ${a + b}`;
    return {
      prompt: `כל ציור מחליף מספר. איזה מספר מתאים ל-${B}?`,
      display: `${A} + ${A} = ${2 * a}\n${second}`,
      ltr: true,
      answer: b,
      distractors: [a, b + a, b + 1, b - 1, 2 * a],
      hint: `קודם מצאי כמה שווה ${A} מהשורה הראשונה.`,
      explanation: `${A} = ${a} (כי ${a} + ${a} = ${2 * a}). ` + (three ? `${a} + ${a} + ${b} = ${2 * a + b}` : `${a} + ${b} = ${a + b}`) + `, לכן ${B} = ${b}`,
    };
  }
  // level 4-5: three pictures, chained (and multiplication at level 5)
  const a = randInt(2, 8);
  const b = randInt(2, 9);
  const c = randInt(2, 12);
  const mult = level >= 5;
  const l1 = mult ? `${A} × ${A} = ${a * a}` : `${A} + ${A} + ${A} = ${3 * a}`;
  const l2 = `${A} + ${B} = ${a + b}`;
  const l3 = `${B} + ${B} + ${C} = ${2 * b + c}`;
  return {
    prompt: `כל ציור מחליף מספר. איזה מספר מתאים ל-${C}?`,
    display: `${l1}\n${l2}\n${l3}`,
    ltr: true,
    answer: c,
    distractors: [b, a, c + 1, c - 1, c + b],
    hint: 'פותרים שורה אחרי שורה: כל שורה נותנת ציור אחד, ואותו משתמשים בשורה הבאה.',
    explanation: `${A} = ${a}, ואז ${B} = ${b}, ואז ${C} = ${2 * b + c} − ${2 * b} = ${c}`,
  };
}

// ---------- word problems ----------

function wordEasy(): Built {
  const name = pick(GIRLS);
  const k = randInt(0, 2);
  if (k === 0) {
    const boxes = randInt(3, 8);
    const per = randInt(4, 9);
    const ans = boxes * per;
    return {
      prompt: `ל${name} יש ${boxes} קופסאות, ובכל קופסה ${per} עפרונות. כמה עפרונות יש לה בסך הכול?`,
      answer: ans,
      distractors: [boxes + per, ans + per, ans - per, ans + 1],
      hint: 'כשיש כמה קבוצות שוות, משתמשים בכפל.',
      explanation: `${boxes} × ${per} = ${ans}`,
    };
  }
  if (k === 1) {
    const each = randInt(2, 4);
    const people = randInt(3, 7);
    const total = each * people;
    return {
      prompt: `כל אחד מבני המשפחה של ${name} אכל ${each} כדורי גלידה. כל המשפחה אכלה יחד ${total} כדורים. כמה בני משפחה יש?`,
      answer: people,
      distractors: [total - each, people + 1, total + each, people - 1],
      hint: 'כמה פעמים נכנס המספר של כל אחד בתוך המספר של כולם?',
      explanation: `${total} : ${each} = ${people}`,
    };
  }
  const a = randInt(2, 5);
  const b = randInt(2, 5);
  const total = a + b + randInt(2, 7);
  return {
    prompt: `בסלט יש ${total} ירקות: ${a} עגבניות, ${b} מלפפונים, וכל השאר גזרים. כמה גזרים יש בסלט?`,
    answer: total - a - b,
    distractors: [a + b, total - a, total - b, total - a - b + 1],
    hint: 'מהמספר הכולל מורידים את כל מה שאינו גזר.',
    explanation: `${total} − ${a} − ${b} = ${total - a - b}`,
  };
}

function wordMid(): Built {
  const k = randInt(0, 4);
  if (k === 0) {
    const name = pick(BOYS);
    const start = randInt(30, 80);
    const gave = randInt(5, 20);
    const got = randInt(5, 25);
    const ans = start - gave + got;
    return {
      prompt: `ל${name} היו ${start} קלפים. בהפסקה הראשונה הוא הפסיד ${gave} קלפים, ובהפסקה השנייה הרוויח ${got} קלפים. כמה קלפים יש לו עכשיו?`,
      answer: ans,
      distractors: [start + gave + got, start - gave - got, ans + 10, ans - 1],
      hint: 'שני שלבים: קודם מה נשאר אחרי שהפסיד, ואז מה קרה כשהרוויח.',
      explanation: `${start} − ${gave} = ${start - gave}, ואז ${start - gave} + ${got} = ${ans}`,
    };
  }
  if (k === 1) {
    const name = pick(GIRLS);
    const price = randInt(3, 9);
    const qty = randInt(3, 6);
    const paid = Math.ceil((price * qty + 1) / 10) * 10 + (Math.random() < 0.5 ? 10 : 0);
    const ans = paid - price * qty;
    return {
      prompt: `${name} קנתה ${qty} מחברות, כל מחברת ב-${price} ש"ח. היא שילמה ב-${paid} ש"ח. כמה עודף קיבלה?`,
      answer: ans,
      distractors: [price * qty, paid - price, ans + price, ans + 1],
      hint: 'קודם חשבי כמה עלו כל המחברות יחד.',
      explanation: `${qty} × ${price} = ${price * qty}, ו-${paid} − ${price * qty} = ${ans}`,
      format: (n) => `${n} ש"ח`,
    };
  }
  if (k === 2) {
    const secs = randInt(2, 6);
    const times = randInt(3, 9);
    const mult = pick([2, 3]);
    const ans = times * mult;
    return {
      prompt: `${pick(GIRLS)} קופצת בחבל. ב-${secs} שניות היא קופצת ${times} פעמים. כמה פעמים היא תקפוץ ב-${secs * mult} שניות?`,
      answer: ans,
      distractors: [times + secs * mult, times * secs, ans + times, times + mult],
      hint: `כמה פעמים נכנסות ${secs} שניות בתוך ${secs * mult} שניות?`,
      explanation: `${secs * mult} שניות הן פי ${mult} מ-${secs} שניות, לכן ${times} × ${mult} = ${ans}`,
    };
  }
  if (k === 3) {
    const a = randInt(3, 6);
    const b = randInt(3, 7);
    const diff = b * 4 - a * 2;
    return {
      prompt: `בחווה יש ${a} תרנגולות (2 רגליים לכל אחת) ו-${b} כבשים (4 רגליים לכל אחת). בכמה גדול מספר הרגליים של הכבשים ממספר הרגליים של התרנגולות?`,
      answer: diff,
      distractors: [b * 4, a * 2, b - a, diff + 2],
      hint: 'חשבי בנפרד את הרגליים של הכבשים ושל התרנגולות, ואז החסירי.',
      explanation: `כבשים: ${b} × 4 = ${b * 4}. תרנגולות: ${a} × 2 = ${a * 2}. ההפרש: ${diff}`,
    };
  }
  const first = randInt(5, 15);
  const step = randInt(2, 6);
  const total = first * 3 + step * 3;
  return {
    prompt: `${pick(BOYS)} פתר תרגילים שלושה ימים. ביום הראשון פתר ${first}, ובכל יום פתר ${step} יותר מביום שלפניו. כמה תרגילים פתר בסך הכול?`,
    answer: total,
    distractors: [first * 3, first + step * 2, total + step, total - step],
    hint: 'כתבי כמה פתר בכל יום, ואז חברי.',
    explanation: `${first} + ${first + step} + ${first + 2 * step} = ${total}`,
  };
}

function wordHard(): Built {
  const k = randInt(0, 5);
  if (k === 0) {
    const rows = randInt(12, 25);
    const per = randInt(4, 8);
    const extra = randInt(2, 4);
    const ans = rows * per + extra;
    return {
      prompt: `באולם יש ${rows} שורות, ובכל שורה ${per} כיסאות. בנוסף יש ${extra} כיסאות על הבמה. כמה כיסאות יש באולם בסך הכול?`,
      answer: ans,
      distractors: [rows + per + extra, rows * per, ans + per, rows * (per + extra)],
      hint: 'קודם כפל (שורות × כיסאות), ואחר כך מוסיפים את מה שנשאר.',
      explanation: `${rows} × ${per} = ${rows * per}, ועוד ${extra} = ${ans}`,
    };
  }
  if (k === 1) {
    const boxes = pick([4, 6, 8]);
    const each = randInt(5, 9);
    const sold = randInt(2, boxes - 1);
    return {
      prompt: `בחנות יש ${boxes * each} כדורים. המוכר חילק אותם שווה בשווה ל-${boxes} ארגזים. השבוע הוא מכר ${sold} ארגזים שלמים. כמה כדורים מכר?`,
      answer: sold * each,
      distractors: [each, boxes * each - sold, sold + each, (boxes - sold) * each],
      hint: 'קודם מצאי כמה כדורים יש בכל ארגז.',
      explanation: `${boxes * each} : ${boxes} = ${each} בכל ארגז, ו-${sold} × ${each} = ${sold * each}`,
    };
  }
  if (k === 2) {
    const cap = pick([6, 10, 12]);
    const cartons = randInt(2, 3);
    const eggs = cap * cartons + randInt(1, cap - 1);
    return {
      prompt: `ל${pick(BOYS)} יש ${eggs} ביצים, והוא מסדר אותן ב-${cartons} תבניות. בכל תבנית יש מקום ל-${cap} ביצים. כמה ביצים יישארו בלי מקום?`,
      answer: eggs - cap * cartons,
      distractors: [cap, cartons * cap, eggs - cap, eggs - cap * cartons + 1],
      hint: 'כמה ביצים נכנסות בכל התבניות יחד?',
      explanation: `${cartons} × ${cap} = ${cap * cartons} נכנסות, ונשארות ${eggs} − ${cap * cartons} = ${eggs - cap * cartons}`,
    };
  }
  if (k === 3) {
    const g = randInt(100, 300);
    const n = randInt(5, 15);
    const m = pick([2, 3]);
    return {
      prompt: `בחבילת עוגיות ששוקלת ${g} גרם יש ${n} עוגיות. כמה עוגיות יש בחבילה ששוקלת ${g * m} גרם?`,
      answer: n * m,
      distractors: [n + m, n * m + n, n, g * m - n],
      hint: `${g * m} גרם הם פי כמה מ-${g} גרם?`,
      explanation: `${g * m} = ${m} × ${g}, לכן יש פי ${m} עוגיות: ${n} × ${m} = ${n * m}`,
    };
  }
  if (k === 4) {
    const sh = randInt(7, 10);
    const sm = pick([0, 30]);
    const dur = randInt(5, 8) * 60 + pick([0, 30]);
    const end = sh * 60 + sm + dur;
    const fmt = (min: number) => `${Math.floor(min / 60)}:${(min % 60).toString().padStart(2, '0')}`;
    const hours = (n: number) => (n % 60 === 0 ? `${n / 60} שעות` : `${Math.floor(n / 60)} שעות וחצי`);
    const opts = shuffle([dur, dur - 60, dur + 60, dur + 30]);
    return {
      prompt: `${pick(BOYS)} יצא לטיול בשעה ${fmt(sh * 60 + sm)} וחזר הביתה בשעה ${fmt(end)}. כמה זמן הוא היה בטיול?`,
      answer: dur,
      distractors: [],
      hint: 'ספרי שעות שלמות מהיציאה, ואז הוסיפי את מה שנשאר.',
      explanation: `מ-${fmt(sh * 60 + sm)} עד ${fmt(end)} עוברות ${hours(dur)}.`,
      custom: { options: opts.map(hours), answer: opts.indexOf(dur) },
    };
  }
  const a = randInt(2, 4);
  const mult1 = 2;
  const mult2 = 3;
  const ans = a * mult1 * mult2;
  return {
    prompt: `${pick(BOYS)} קלע ${a} סלים. ${pick(GIRLS)} קלעה פי ${mult1} סלים ממנו, ו${pick(GIRLS)} קלעה פי ${mult2} סלים מהשנייה. כמה סלים קלעה האחרונה?`,
    answer: ans,
    distractors: [a * mult2, a + mult1 + mult2, a * mult1 + mult2, ans + a],
    hint: 'שלב אחרי שלב: קודם כמה קלעה השנייה, ואז האחרונה.',
    explanation: `${a} × ${mult1} = ${a * mult1}, ואז ${a * mult1} × ${mult2} = ${ans}`,
  };
}

function wordExpert(): Built {
  const k = randInt(0, 3);
  if (k === 0) {
    // two-digit number riddle
    let t: number, o: number;
    do {
      t = randInt(1, 8);
      o = t + randInt(1, 5);
    } while (o > 9 || o % 2 === 0);
    const n = t * 10 + o;
    const cands = [o * 10 + t, n + 10, n - 2, (t + 1) * 10 + (o - 1)].filter((x) => x !== n && x >= 10 && x <= 99);
    return {
      prompt: `אני מספר דו-ספרתי אי-זוגי. סכום הספרות שלי הוא ${t + o}, וספרת האחדות שלי גדולה ב-${o - t} מספרת העשרות. מי אני?`,
      answer: n,
      distractors: cands,
      hint: 'נסי כל תשובה: האם היא אי-זוגית? מה סכום הספרות? מה ההפרש?',
      explanation: `${n}: הוא אי-זוגי, ${t} + ${o} = ${t + o}, ו-${o} גדול ב-${o - t} מ-${t}.`,
    };
  }
  if (k === 1) {
    const small = randInt(4, 20);
    const diff = randInt(2, 12);
    const big = small + diff;
    return {
      prompt: `סכום של שני מספרים הוא ${small + big}, וההפרש ביניהם הוא ${diff}. מהו המספר הגדול?`,
      answer: big,
      distractors: [small, small + big - diff, big + diff, big + 1],
      hint: 'אם נוריד את ההפרש מהסכום, נקבל פעמיים את המספר הקטן.',
      explanation: `${small + big} − ${diff} = ${2 * small}, הקטן הוא ${small}, והגדול ${small} + ${diff} = ${big}`,
    };
  }
  if (k === 2) {
    const chickens = randInt(2, 7);
    const cows = randInt(2, 6);
    const legs = chickens * 2 + cows * 4;
    return {
      prompt: `בחווה יש ${chickens + cows} בעלי חיים: תרנגולות (2 רגליים) ופרות (4 רגליים). יש להם יחד ${legs} רגליים. כמה פרות יש?`,
      answer: cows,
      distractors: [chickens, cows + 1, cows - 1, Math.floor(legs / 4)],
      hint: 'דמייני שכולן תרנגולות. כמה רגליים חסרות? כל פרה מוסיפה 2.',
      explanation: `אם כולן תרנגולות: ${(chickens + cows) * 2} רגליים. חסרות ${legs - (chickens + cows) * 2}, וכל פרה מוסיפה 2, לכן יש ${cows} פרות.`,
    };
  }
  const kids = 3;
  const paid = 50;
  let candy: number, ice: number;
  do {
    candy = randInt(3, 8);
    ice = randInt(4, 9);
  } while ((paid - candy - 2 * ice) % kids !== 0);
  const change = paid - candy - 2 * ice;
  return {
    prompt: `אבא קנה לי סוכרייה ב-${candy} ש"ח, ולשני האחים שלי ארטיק ב-${ice} ש"ח לכל אחד. הוא שילם ${paid} ש"ח, וחילק את העודף שווה בשווה בין שלושתנו. כמה כסף קיבלתי?`,
    answer: change / kids,
    distractors: [change, change / kids + 1, change / kids - 1, change / kids + 2],
    hint: 'שלושה שלבים: כמה עלה הכול, כמה עודף, ואז חלוקה ל-3.',
    explanation: `${candy} + ${ice} + ${ice} = ${candy + 2 * ice}. העודף: ${paid} − ${candy + 2 * ice} = ${change}. לכל אחד: ${change} : 3 = ${change / kids}`,
    format: (n) => `${n} ש"ח`,
  };
}

function fractions(): Built {
  const q = randInt(3, 15);
  const whole = q * 4;
  const half = Math.random() < 0.5;
  const ans = half ? whole / 2 : q;
  const word = half ? 'חצי' : 'רבע';
  return {
    prompt: `כמה זה ${word} מ-${whole}?`,
    answer: ans,
    distractors: [half ? q : whole / 2, ans * 2, ans + 2, whole - ans],
    hint: half ? 'חצי זה לחלק ל-2 חלקים שווים.' : 'רבע זה לחלק ל-4 חלקים שווים.',
    explanation: `${whole} : ${half ? 2 : 4} = ${ans}`,
  };
}

const BY_LEVEL: (() => Built)[][] = [
  [() => addSub(), () => addSub(), () => smiley(1), () => picturePuzzle(1), wordEasy],
  [mulDiv, () => addSub(true), () => smiley(2), () => inequality(2), () => picturePuzzle(2), wordEasy, wordMid],
  [() => smiley(3), () => inequality(3), () => picturePuzzle(3), wordMid, wordMid, wordHard],
  [orderOfOps, fractions, () => inequality(4), () => picturePuzzle(4), wordHard, wordHard, wordMid],
  [() => picturePuzzle(5), wordExpert, wordExpert, wordHard, wordHard],
];

/** Word problems only (used by the Stage B exam simulation). */
const WORD_BY_LEVEL: (() => Built)[][] = [[wordEasy], [wordEasy, wordMid], [wordMid, wordHard], [wordHard], [wordHard, wordExpert]];

export type MathKind = 'exercise' | 'smiley' | 'inequality' | 'picture' | 'word';

const KIND_BUILDERS: Record<MathKind, (lv: number) => Built> = {
  exercise: (lv) => (lv <= 1 ? addSub() : lv === 2 ? pick([mulDiv, () => addSub(true)])() : pick([mulDiv, orderOfOps, () => addSub(true)])()),
  smiley: (lv) => smiley(Math.min(lv, 4)),
  inequality: (lv) => inequality(Math.max(2, lv)),
  picture: (lv) => picturePuzzle(lv),
  word: (lv) => pick(WORD_BY_LEVEL[lv - 1])(),
};

/** One math question of a specific kind (used to build an exam with a fixed mix). */
export function genMathKind(kind: MathKind, level: number): Question {
  const lv = Math.min(5, Math.max(1, level));
  return build(KIND_BUILDERS[kind](lv), lv);
}

export function genMath(level: number, wordOnly = false): Question {
  const lv = Math.min(5, Math.max(1, level));
  return build(pick((wordOnly ? WORD_BY_LEVEL : BY_LEVEL)[lv - 1])(), lv);
}

function build(b: Built, lv: number): Question {
  let options: Option[];
  let answer: number;
  if (b.custom) {
    const opts = b.custom.options.map((t) => ({ text: t }));
    const right = b.custom.answer;
    ({ options, answer } = finalize(opts[right], opts.filter((_, i) => i !== right)));
  } else {
    ({ options, answer } = numericQuestion(b.answer, b.distractors));
    if (b.format) for (const o of options) o.text = b.format(Number(o.text));
  }
  return {
    id: uid('math'),
    topic: 'math',
    level: lv,
    prompt: b.prompt,
    display: b.display,
    displayLtr: b.ltr,
    options,
    answer,
    hint: b.hint,
    explanation: b.explanation,
  };
}
