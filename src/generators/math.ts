import type { Question } from '../types';
import { numericQuestion, pick, randInt, uid } from './util';

const GIRLS = ['נועה', 'מאיה', 'תמר', 'יעל', 'שירה', 'רוני', 'אביגיל', 'הילה'];
const BOYS = ['דני', 'יונתן', 'איתי', 'עומר', 'אורי', 'נדב', 'אלון', 'גיל'];

interface Built {
  prompt: string;
  display?: string;
  answer: number;
  distractors: number[];
  hint: string;
  explanation: string;
}

function level1(): Built {
  if (Math.random() < 0.5) {
    const a = randInt(12, 68);
    const b = randInt(5, 99 - a);
    const ans = a + b;
    return {
      prompt: 'כמה זה?',
      display: `${a} + ${b} = ?`,
      answer: ans,
      distractors: [ans + 10, ans - 10, ans + 1, ans - 1],
      hint: 'חברי קודם את העשרות ואחר כך את האחדות.',
      explanation: `${a} + ${b} = ${ans}`,
    };
  }
  const a = randInt(30, 99);
  const b = randInt(5, a - 5);
  const ans = a - b;
  return {
    prompt: 'כמה זה?',
    display: `${a} − ${b} = ?`,
    answer: ans,
    distractors: [ans + 10, ans - 10, ans + 2, ans - 2],
    hint: 'אפשר לבדוק: התשובה ועוד המספר שהורדנו צריכים לתת את המספר הראשון.',
    explanation: `${a} − ${b} = ${ans}, כי ${ans} + ${b} = ${a}`,
  };
}

function level2(): Built {
  const kind = randInt(0, 2);
  if (kind === 0) {
    const a = randInt(3, 10);
    const b = randInt(3, 10);
    const ans = a * b;
    return {
      prompt: 'כמה זה?',
      display: `${a} × ${b} = ?`,
      answer: ans,
      distractors: [a * (b + 1), a * (b - 1), ans + 2, (a + 1) * b],
      hint: `${a} × ${b} זה ${b} פעמים ${a}.`,
      explanation: `${a} × ${b} = ${ans}`,
    };
  }
  if (kind === 1) {
    const b = randInt(2, 10);
    const ans = randInt(2, 10);
    const a = ans * b;
    return {
      prompt: 'כמה זה?',
      display: `${a} : ${b} = ?`,
      answer: ans,
      distractors: [ans + 1, ans - 1, ans + 2, b],
      hint: `איזה מספר כפול ${b} נותן ${a}?`,
      explanation: `${a} : ${b} = ${ans}, כי ${ans} × ${b} = ${a}`,
    };
  }
  const name = pick(GIRLS);
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

function level3(): Built {
  const kind = randInt(0, 2);
  if (kind === 0) {
    const a = randInt(15, 60);
    const ans = randInt(8, 40);
    const op = Math.random() < 0.5 ? '+' : '−';
    if (op === '+') {
      return {
        prompt: 'איזה מספר חסר?',
        display: `${a} + ? = ${a + ans}`,
        answer: ans,
        distractors: [a + ans + a, ans + 10, ans - 1, ans + 1],
        hint: `כמה צריך להוסיף ל-${a} כדי להגיע ל-${a + ans}?`,
        explanation: `${a + ans} − ${a} = ${ans}`,
      };
    }
    const total = a + ans;
    return {
      prompt: 'איזה מספר חסר?',
      display: `${total} − ? = ${a}`,
      answer: ans,
      distractors: [total + a, ans + 10, ans - 2, ans + 2],
      hint: `כמה צריך להוריד מ-${total} כדי להישאר עם ${a}?`,
      explanation: `${total} − ${a} = ${ans}`,
    };
  }
  if (kind === 1) {
    const name = pick(BOYS);
    const start = randInt(30, 80);
    const gave = randInt(5, 20);
    const got = randInt(5, 25);
    const ans = start - gave + got;
    return {
      prompt: `ל${name} היו ${start} קלפים. הוא נתן לחבר ${gave} קלפים, ואחר כך קיבל מאחותו ${got} קלפים. כמה קלפים יש לו עכשיו?`,
      answer: ans,
      distractors: [start + gave + got, start - gave - got, ans + 10, ans - 1],
      hint: 'עשי את זה בשני שלבים: קודם מה נשאר אחרי שנתן, ואז מה קרה כשקיבל.',
      explanation: `${start} − ${gave} = ${start - gave}, ואז ${start - gave} + ${got} = ${ans}`,
    };
  }
  const name = pick(GIRLS);
  const price = randInt(3, 9);
  const qty = randInt(3, 6);
  const paid = Math.ceil((price * qty + 1) / 10) * 10 + (Math.random() < 0.5 ? 10 : 0);
  const ans = paid - price * qty;
  return {
    prompt: `${name} קנתה ${qty} מחברות, כל מחברת עולה ${price} ש"ח. היא שילמה ב-${paid} ש"ח. כמה עודף קיבלה?`,
    answer: ans,
    distractors: [price * qty, paid - price, ans + price, ans + 1],
    hint: 'קודם חשבי כמה עלו כל המחברות יחד.',
    explanation: `${qty} × ${price} = ${price * qty}, ו-${paid} − ${price * qty} = ${ans}`,
  };
}

function level4(): Built {
  const kind = randInt(0, 3);
  if (kind === 0) {
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    const c = randInt(2, 20);
    const ans = c + a * b;
    return {
      prompt: 'כמה זה? (זכרי: כפל לפני חיבור)',
      display: `${c} + ${a} × ${b} = ?`,
      answer: ans,
      distractors: [(c + a) * b, ans + 1, ans - a, c + a + b],
      hint: 'קודם עושים את הכפל, ורק אחר כך את החיבור.',
      explanation: `${a} × ${b} = ${a * b}, ואז ${c} + ${a * b} = ${ans}`,
    };
  }
  if (kind === 1) {
    const q = randInt(3, 15);
    const whole = q * 4;
    const ans = Math.random() < 0.5 ? whole / 2 : q;
    const word = ans === q ? 'רבע' : 'חצי';
    return {
      prompt: `כמה זה ${word} מ-${whole}?`,
      answer: ans,
      distractors: [ans === q ? whole / 2 : q, ans * 2, ans + 2, whole - ans],
      hint: word === 'חצי' ? 'חצי זה לחלק ל-2 חלקים שווים.' : 'רבע זה לחלק ל-4 חלקים שווים.',
      explanation: `${whole} : ${word === 'חצי' ? 2 : 4} = ${ans}`,
    };
  }
  if (kind === 2) {
    const kids = randInt(3, 6);
    const each = randInt(4, 9);
    const left = randInt(1, kids - 1);
    const total = kids * each + left;
    return {
      prompt: `בשקית יש ${total} סוכריות. מחלקים אותן שווה בשווה בין ${kids} ילדים, כך שכל ילד מקבל כמה שיותר. כמה סוכריות יישארו בשקית?`,
      answer: left,
      distractors: [each, kids, left + 1, each + left],
      hint: `מהו המספר הגדול ביותר שמתחלק ב-${kids} ושאינו גדול מ-${total}?`,
      explanation: `${kids} × ${each} = ${kids * each}, ונשארות ${total} − ${kids * each} = ${left}`,
    };
  }
  const h = randInt(1, 4);
  const m = pick([15, 20, 30, 40, 45]);
  const add = pick([25, 35, 40, 50, 55]);
  const totalMin = h * 60 + m + add;
  const ansH = Math.floor(totalMin / 60);
  const ansM = totalMin % 60;
  const fmt = (hh: number, mm: number) => `${hh}:${mm.toString().padStart(2, '0')}`;
  // Encode time as a number of minutes past noon for options; display as text.
  return {
    prompt: `הסרט התחיל בשעה ${fmt(h, m)} ונמשך ${add} דקות. באיזו שעה הוא נגמר?`,
    answer: ansH * 100 + ansM,
    distractors: [
      h * 100 + m + add,
      (ansH + 1) * 100 + ansM,
      ansH * 100 + ((ansM + 10) % 60),
      ansH * 100 + ((ansM + 30) % 60),
      (ansH - 1) * 100 + ansM,
    ].filter((x) => x % 100 < 60 && x >= 100),
    hint: 'שעה אחת היא 60 דקות. כשעוברים את 60 דקות, מוסיפים שעה.',
    explanation: `${fmt(h, m)} ועוד ${add} דקות = ${fmt(ansH, ansM)}`,
  };
}

function level5(): Built {
  const kind = randInt(0, 3);
  if (kind === 0) {
    const small = randInt(4, 20);
    const diff = randInt(2, 12);
    const big = small + diff;
    return {
      prompt: `סכום של שני מספרים הוא ${small + big}, וההפרש ביניהם הוא ${diff}. מהו המספר הגדול?`,
      answer: big,
      distractors: [small, small + big - diff, big + diff, big + 1],
      hint: `אם נוריד את ההפרש מהסכום, נקבל פעמיים את המספר הקטן.`,
      explanation: `${small + big} − ${diff} = ${2 * small}, המספר הקטן הוא ${small}, והגדול ${small} + ${diff} = ${big}`,
    };
  }
  if (kind === 1) {
    const apple = randInt(2, 6);
    const pear = apple * 2;
    const n = randInt(2, 5);
    const ans = n * pear;
    return {
      prompt: `אגס אחד שוקל כמו 2 תפוחים. תפוח אחד שוקל ${apple} קוביות. כמה קוביות שוקלים ${n} אגסים?`,
      answer: ans,
      distractors: [n * apple, ans + apple, n + pear, ans * 2],
      hint: 'קודם חשבי כמה שוקל אגס אחד.',
      explanation: `אגס = 2 × ${apple} = ${pear}, ו-${n} אגסים = ${n} × ${pear} = ${ans}`,
    };
  }
  if (kind === 2) {
    const kid = randInt(6, 10);
    const diff = randInt(20, 30);
    const years = randInt(2, 6);
    const ans = kid + diff + years;
    const name = pick(GIRLS);
    return {
      prompt: `${name} בת ${kid}, ואמא שלה מבוגרת ממנה ב-${diff} שנים. בת כמה תהיה אמא בעוד ${years} שנים?`,
      answer: ans,
      distractors: [kid + diff, ans + years, kid + years, ans - 1],
      hint: 'קודם מצאי בת כמה אמא היום.',
      explanation: `היום אמא בת ${kid} + ${diff} = ${kid + diff}, ובעוד ${years} שנים: ${ans}`,
    };
  }
  const legsChicken = 2;
  const chickens = randInt(2, 7);
  const cows = randInt(2, 6);
  const legs = chickens * legsChicken + cows * 4;
  return {
    prompt: `בחווה יש ${chickens + cows} בעלי חיים: תרנגולות (2 רגליים) ופרות (4 רגליים). יש להם ${legs} רגליים. כמה פרות יש?`,
    answer: cows,
    distractors: [chickens, cows + 1, cows - 1, Math.floor(legs / 4)],
    hint: 'נסי לדמיין שכולן תרנגולות. כמה רגליים חסרות? כל פרה מוסיפה 2.',
    explanation: `אם כולן תרנגולות: ${(chickens + cows) * 2} רגליים. חסרות ${legs - (chickens + cows) * 2}, וכל פרה מוסיפה 2, אז יש ${cows} פרות.`,
  };
}

const BUILDERS = [level1, level2, level3, level4, level5];

export function genMath(level: number): Question {
  const lv = Math.min(5, Math.max(1, level));
  const b = BUILDERS[lv - 1]();
  const isTime = b.prompt.includes('באיזו שעה');
  const { options, answer } = numericQuestion(b.answer, b.distractors);
  if (isTime) {
    for (const o of options) {
      const n = Number(o.text);
      o.text = `${Math.floor(n / 100)}:${(n % 100).toString().padStart(2, '0')}`;
    }
  }
  return {
    id: uid('math'),
    topic: 'math',
    level: lv,
    prompt: b.prompt,
    display: b.display,
    options,
    answer,
    hint: b.hint,
    explanation: b.explanation,
  };
}
