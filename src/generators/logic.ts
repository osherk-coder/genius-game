import type { Question } from '../types';
import { finalize, pick, randInt, shuffle, uid } from './util';

const PEOPLE = [
  { n: 'דנה', f: true },
  { n: 'רון', f: false },
  { n: 'מיכל', f: true },
  { n: 'עידו', f: false },
  { n: 'נועה', f: true },
  { n: 'אדם', f: false },
  { n: 'יעל', f: true },
  { n: 'איתי', f: false },
];
const NAMES = PEOPLE.map((p) => p.n);
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const COMPARE = [
  { m: 'גבוה יותר מ', f: 'גבוהה יותר מ', most: 'הגבוה ביותר', least: 'הנמוך ביותר' },
  { m: 'מהיר יותר מ', f: 'מהירה יותר מ', most: 'המהיר ביותר', least: 'האיטי ביותר' },
  { m: 'מבוגר יותר מ', f: 'מבוגרת יותר מ', most: 'המבוגר ביותר', least: 'הצעיר ביותר' },
];

/** Ordering puzzle: facts about who is "more" than whom. */
function ordering(level: number): Question {
  const n = level <= 2 ? 3 : level <= 4 ? 4 : 5;
  const ps = shuffle(PEOPLE).slice(0, n); // index 0 = most
  const people = ps.map((p) => p.n);
  const c = pick(COMPARE);
  const facts: string[] = [];
  for (let i = 0; i < n - 1; i++) facts.push(`${people[i]} ${ps[i].f ? c.f : c.m}${people[i + 1]}.`);
  const shownFacts = level >= 3 ? shuffle(facts) : facts;
  let ask: string;
  let ans: string;
  const r = Math.random();
  if (n >= 4 && r < 0.4) {
    const idx = randInt(1, n - 2);
    ans = people[idx];
    ask = `אם מסדרים מ${c.most} עד ${c.least}, מי יהיה במקום ה-${idx + 1}?`;
  } else if (r < 0.7) {
    ask = `מי ${c.least}?`;
    ans = people[n - 1];
  } else {
    ask = `מי ${c.most}?`;
    ans = people[0];
  }
  const distract = shuffle(people.filter((p) => p !== ans)).slice(0, 3);
  while (distract.length < 3) distract.push(pick(NAMES.filter((x) => x !== ans && !distract.includes(x))));
  const { options, answer } = finalize({ text: ans }, distract.map((t) => ({ text: t })));
  return {
    id: uid('ord'),
    topic: 'logic',
    level,
    prompt: `${shownFacts.join(' ')}\n${ask}`,
    options,
    answer,
    hint: 'סדרי את השמות בשורה, מ' + c.most + ' עד ' + c.least + '.',
    explanation: `הסדר הוא: ${people.join(', ')}. לכן התשובה היא ${ans}.`,
  };
}

const OFFSETS: Record<number, string> = { [-2]: 'שלשום', [-1]: 'אתמול', 0: 'היום', 1: 'מחר', 2: 'מחרתיים' };

/** Days-of-week reasoning. */
function days(level: number): Question {
  const known = pick([-2, -1, 1, 2]);
  let target = pick([-2, -1, 1, 2].filter((x) => x !== known));
  const extra = level >= 4 ? randInt(3, 10) : 0;
  const todayIdx = randInt(0, 6);
  const knownDay = DAYS[(todayIdx + known + 7) % 7];
  let ask: string;
  if (extra) {
    ask = `איזה יום יהיה בעוד ${extra} ימים מהיום?`;
    target = extra;
  } else {
    ask = `איזה יום ${target < 0 ? 'היה' : 'יהיה'} ${OFFSETS[target]}?`;
  }
  const ansDay = DAYS[(todayIdx + target + 70) % 7];
  const distract = shuffle(DAYS.filter((d) => d !== ansDay)).slice(0, 3);
  const { options, answer } = finalize({ text: ansDay }, distract.map((t) => ({ text: t })));
  return {
    id: uid('day'),
    topic: 'logic',
    level,
    prompt: `${OFFSETS[known] === 'שלשום' || OFFSETS[known] === 'אתמול' ? `${OFFSETS[known]} היה יום ${knownDay}` : `${OFFSETS[known]} יהיה יום ${knownDay}`}.\n${ask}`,
    options,
    answer,
    hint: 'קודם מצאי איזה יום היום. אחר כך התקדמי או חזרי אחורה.',
    explanation: `היום הוא יום ${DAYS[todayIdx]}, לכן התשובה היא יום ${ansDay}.`,
  };
}

export function genLogic(level: number): Question {
  const lv = Math.min(5, Math.max(1, level));
  return Math.random() < 0.6 ? ordering(lv) : days(lv);
}
