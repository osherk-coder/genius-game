import type { Question, TopicId } from '../types';

export interface LessonStep {
  text: string;
  /** A worked example shown in big letters (left-to-right when `ltr`). */
  example?: string;
  ltr?: boolean;
}

export interface Lesson {
  id: string;
  topic: TopicId;
  title: string;
  emoji: string;
  steps: LessonStep[];
}

/** Which lesson fits a question (based on how its id and display are built). */
export function kindOf(q: Question): string {
  const id = q.id;
  if (q.topic === 'math') {
    if (q.display?.includes('🙂')) return 'smiley';
    if (q.display && /[<>]/.test(q.display)) return 'inequality';
    if (q.prompt.startsWith('כל ציור')) return 'picture';
    if (q.display?.includes('___')) return 'exercise';
    return 'word';
  }
  if (q.topic === 'reading') return 'reading';
  if (id.startsWith('ncir')) return 'circles';
  if (id.startsWith('nmac')) return 'machine';
  if (id.startsWith('seq')) return 'sequence';
  if (id.startsWith('analogies-pr')) return 'pairs';
  if (id.startsWith('analogies-sn')) return 'sentences';
  if (id.startsWith('analogies-mn')) return 'meaning';
  if (id.startsWith('analogies-odd')) return 'oddword';
  if (id.startsWith('mat')) return 'matrix';
  if (id.startsWith('ser')) return 'series';
  if (id.startsWith('sid')) return 'sides';
  if (id.startsWith('rows')) return 'rows';
  if (id.startsWith('carp')) return 'carpet';
  if (id.startsWith('odd')) return 'oddshape';
  if (id.startsWith('ord')) return 'ordering';
  if (id.startsWith('day')) return 'days';
  return 'logicpuzzle';
}

export const LESSONS: Lesson[] = [
  // ---------------- math ----------------
  {
    id: 'exercise',
    topic: 'math',
    title: 'חשבון בראש',
    emoji: '🧮',
    steps: [
      { text: 'בחיבור: מחברים קודם את העשרות, ואחר כך את האחדות.', example: '47 + 35 → 40 + 30 = 70, 7 + 5 = 12 → 82', ltr: true },
      { text: 'בחיסור: קודם מורידים עד לעשרת "עגולה", ואחר כך את מה שנשאר.', example: '97 − 9 → 97 − 7 = 90 → 90 − 2 = 88', ltr: true },
      { text: 'בחילוק: שואלים "איזה מספר כפול המחלק נותן את המספר?"', example: '28 : 4 = ?  →  ? × 4 = 28  →  7', ltr: true },
      { text: 'זכרי: כפל וחילוק לפני חיבור וחיסור!', example: '3 + 2 × 4 = 3 + 8 = 11', ltr: true },
    ],
  },
  {
    id: 'smiley',
    topic: 'math',
    title: 'מה מסתתר מאחורי החייכן?',
    emoji: '🙂',
    steps: [
      { text: 'החייכן הוא מספר שמישהו הסתיר. כדי למצוא אותו, עושים את הפעולה ההפוכה.' },
      { text: 'אם יש חיבור, עושים חיסור:', example: '32 + 🙂 = 41  →  41 − 32 = 9', ltr: true },
      { text: 'אם יש כפל, עושים חילוק:', example: '6 × 🙂 = 36  →  36 : 6 = 6', ltr: true },
      { text: 'תמיד אפשר לבדוק: שימי את התשובה במקום החייכן. אם התרגיל נכון, צדקת! 🎉', example: '32 + 9 = 41 ✓', ltr: true },
    ],
  },
  {
    id: 'inequality',
    topic: 'math',
    title: 'אי-שוויון: מי גדול יותר?',
    emoji: '⚖️',
    steps: [
      { text: 'הסימן < נקרא "קטן מ", והסימן > נקרא "גדול מ". הפה של התנין תמיד פתוח לכיוון הגדול 🐊.', example: '3 < 8     9 > 2', ltr: true },
      { text: 'הטריק: כששני הצדדים מתחילים באותו מספר, משווים רק את מה שמשתנה!', example: '47 + 15 < 47 + ___', ltr: true },
      { text: 'בשני הצדדים יש 47, אז צריך מספר שגדול מ-15. למשל 16.', example: '47 + 15 < 47 + 16 ✓', ltr: true },
      { text: 'זהירות בחיסור: כשמורידים פחות, נשאר יותר!', example: '30 − 8 < 30 − 5  (22 < 25)', ltr: true },
    ],
  },
  {
    id: 'picture',
    topic: 'math',
    title: 'חידות בציורים',
    emoji: '🍎',
    steps: [
      { text: 'כל ציור הוא מספר. אותו ציור = אותו מספר, בכל השורות.' },
      { text: 'מתחילים מהשורה שיש בה רק סוג אחד של ציור:', example: '🍎 + 🍎 = 6  →  🍎 = 3', ltr: true },
      { text: 'עכשיו שמים את המספר שמצאנו בשורה הבאה:', example: '🍎 + 🍌 = 11  →  3 + 🍌 = 11  →  🍌 = 8', ltr: true },
      { text: 'ממשיכים כך שורה אחרי שורה, עד שמגיעים לציור שהשאלה שואלת עליו.' },
    ],
  },
  {
    id: 'word',
    topic: 'math',
    title: 'בעיות מילוליות',
    emoji: '📝',
    steps: [
      { text: 'שלב 1: קוראים את הבעיה פעמיים. בפעם השנייה מחפשים: מה שואלים אותי?' },
      { text: 'שלב 2: מוצאים את המספרים החשובים. לפעמים יש מספר שלא צריך!' },
      { text: 'שלב 3: מילים שעוזרות להחליט:', example: '"בסך הכול" → חיבור או כפל\n"כמה נשאר" → חיסור\n"פי 2" → כפל\n"שווה בשווה" → חילוק' },
      { text: 'שלב 4: בעיות של כמה שלבים? פותרים שלב אחרי שלב, ובסוף בודקים שהתשובה הגיונית.' },
    ],
  },
  // ---------------- reading ----------------
  {
    id: 'reading',
    topic: 'reading',
    title: 'איך עונים על שאלות קריאה',
    emoji: '📖',
    steps: [
      { text: 'קוראים את כל הקטע פעם אחת, בשקט ובסבלנות.' },
      { text: 'כשהשאלה אומרת "שורה 7", חוזרים לשורה 7 וקוראים גם את השורות שלפניה ואחריה.' },
      { text: '"מה פירוש המילה?" שמים כל תשובה במקום המילה במשפט, ובודקים מה מתאים.' },
      { text: 'מילים חשובות: "אבל" = משהו הפוך, "לכן" = תוצאה, "גם" = מוסיף עוד דבר.' },
      { text: '"על איזו שאלה אין תשובה בקטע?" בודקים כל תשובה: האם כתוב עליה בקטע? זו שלא כתובה היא התשובה.' },
    ],
  },
  // ---------------- sequences ----------------
  {
    id: 'sequence',
    topic: 'sequences',
    title: 'מגלים את החוק של הסדרה',
    emoji: '🔗',
    steps: [
      { text: 'כותבים את ההפרש בין כל שני מספרים צמודים:', example: '3, 7, 11, 15\n+4  +4  +4  → הבא: 19', ltr: true },
      { text: 'אם ההפרשים משתנים, בודקים את החוק שלהם:', example: '1, 2, 4, 7, 11\n+1  +2  +3  +4  → הבא: 16', ltr: true },
      { text: 'אם המספרים גדלים מהר מאוד, אולי זה כפל:', example: '2, 4, 8, 16 → ×2 → 32', ltr: true },
      { text: 'אם יש קפיצות מוזרות, הסתכלי רק על כל מספר שני. אולי יש שתי סדרות שזורות!' },
    ],
  },
  {
    id: 'circles',
    topic: 'sequences',
    title: 'מספרים בעיגולים',
    emoji: '⭕',
    steps: [
      { text: 'בכל עיגול יש שני מספרים למעלה ומספר אחד למטה. הכלל זהה בכל העיגולים.' },
      { text: 'נסי על העיגול הראשון: חיבור? חיסור? כפל?', example: '10 , 2  →  20 ?\n10 + 2 = 12 ✗   10 × 2 = 20 ✓', ltr: true },
      { text: 'לפני שעונים, בודקים שהכלל עובד גם בעיגול השני!', example: '9 , 3 → 27   (9 × 3 = 27 ✓)', ltr: true },
      { text: 'רק עכשיו מפעילים את הכלל על העיגול עם סימן השאלה.' },
    ],
  },
  {
    id: 'machine',
    topic: 'sequences',
    title: 'מכונת המספרים',
    emoji: '⚙️',
    steps: [
      { text: 'המספר נכנס למכונה משמאל, משהו קורה לו, ויוצא מימין.' },
      { text: 'מסתכלים על שורה שלמה: מה המכונה עשתה?', example: '8 → [2] → 16    כלומר 8 × 2', ltr: true },
      { text: 'עושים את אותו הדבר בשורה עם סימן השאלה:', example: '10 → [4] → ?    10 × 4 = 40', ltr: true },
    ],
  },
  // ---------------- words ----------------
  {
    id: 'pairs',
    topic: 'analogies',
    title: 'הקשר בין המילים',
    emoji: '🔤',
    steps: [
      { text: 'ממציאים משפט קצר שמחבר בין שתי המילים:', example: 'כלב : נביחה\n"נביחה היא הקול שהכלב משמיע"' },
      { text: 'בודקים כל תשובה עם אותו משפט בדיוק:', example: 'ציפור : ציוץ\n"ציוץ הוא הקול שהציפור משמיעה" ✓' },
      { text: 'שימי לב לסדר! "חלב : מקרר" זה לא כמו "מקרר : חלב".' },
      { text: 'אם יותר מתשובה אחת מתאימה, עושים את המשפט מדויק יותר.' },
    ],
  },
  {
    id: 'sentences',
    topic: 'analogies',
    title: 'השלמת משפטים',
    emoji: '✏️',
    steps: [
      { text: 'קוראים את המשפט עם כל תשובה, כאילו מקריאים אותו בקול.' },
      { text: 'מילות קישור הן רמז גדול:', example: 'אבל / למרות → משהו הפוך או מפתיע\nלכן / ולכן → תוצאה\nכי / משום ש → סיבה' },
      { text: 'כשיש כמה חורים, כל החלקים צריכים להתאים. מספיק שחלק אחד לא מתאים, והתשובה נפסלת.' },
    ],
  },
  {
    id: 'meaning',
    topic: 'analogies',
    title: 'פירוש מילים וביטויים',
    emoji: '💭',
    steps: [
      { text: 'שמים כל תשובה במקום המילה, ובודקים אם המשפט נשאר עם אותה משמעות.' },
      { text: 'ביטויים לא מתכוונים למילים עצמן: "הרים ידיים" זה לא באמת להרים ידיים, אלא לוותר.' },
    ],
  },
  {
    id: 'oddword',
    topic: 'analogies',
    title: 'המילה שלא שייכת',
    emoji: '🙈',
    steps: [
      { text: 'מחפשים מה משותף לשלוש מילים: סוג (פרי, חיה, צבע), פעולה, או משמעות.' },
      { text: 'המילה הרביעית, שאין לה את התכונה המשותפת, היא התשובה.', example: 'תפוח, בננה, גזר, אגס\n→ גזר (ירק, לא פרי)' },
    ],
  },
  // ---------------- shapes ----------------
  {
    id: 'matrix',
    topic: 'shapes',
    title: 'טבלת צורות (מטריצה)',
    emoji: '🔲',
    steps: [
      { text: 'בודקים שורה: מה משתנה משמאל לימין? צורה? צבע? מספר? כיוון?' },
      { text: 'בודקים עמודה: מה משתנה מלמעלה למטה?' },
      { text: 'הרבה פעמים, בכל שורה ובכל עמודה כל צורה וכל צבע מופיעים פעם אחת בדיוק. אז החסר הוא מה שעוד לא הופיע!' },
      { text: 'פוסלים תשובות: כל תשובה שלא מתאימה לשורה או לעמודה, פוסלים.' },
    ],
  },
  {
    id: 'series',
    topic: 'shapes',
    title: 'סדרת צורות',
    emoji: '➡️',
    steps: [
      { text: 'קוראים משמאל לימין. סימן השאלה נמצא בסוף, בצד ימין.' },
      { text: 'עוקבים אחרי דבר אחד בכל פעם: קודם מספר הצורות, אחר כך הכיוון, אחר כך הצבע.' },
      { text: 'חץ שמסתובב: שימי אצבע על הקצה שלו, ובדקי לאן הוא זז בכל צעד.' },
    ],
  },
  {
    id: 'sides',
    topic: 'shapes',
    title: 'סופרים צלעות',
    emoji: '📐',
    steps: [
      { text: 'צלע היא קו ישר בצורה. למשולש 3 צלעות, לריבוע 4, למחומש 5, למשושה 6.' },
      { text: 'אם בכל צעד יש צלע אחת יותר, הצורה הבאה היא זו עם עוד צלע.', example: '△ → □ → ⬠ → ?  (6 צלעות)' },
    ],
  },
  {
    id: 'rows',
    topic: 'shapes',
    title: 'שלוש שורות, כלל אחד',
    emoji: '🧱',
    steps: [
      { text: 'מוצאים את הכלל בשורה הראשונה, משמאל לימין.' },
      { text: 'בודקים שאותו כלל עובד גם בשורה השנייה. כל שורה יכולה להתחיל ממקום אחר!', example: 'שורה 1: 1 → 2 → 3\nשורה 2: 3 → 4 → 5' },
      { text: 'בשורה האחרונה ממשיכים את הכלל מהמקום שבו היא התחילה.', example: 'שורה 3: 2 → 3 → ?  = 4' },
    ],
  },
  {
    id: 'carpet',
    topic: 'shapes',
    title: 'השטיח עם החור',
    emoji: '🧶',
    steps: [
      { text: 'קודם מוצאים את הדוגמה בשטיח: פסים? לוח שחמט? אלכסונים?' },
      { text: 'מסתכלים על המשבצות שמסביב לחור: מעליו, מתחתיו ובצדדים. הדוגמה צריכה להמשיך לתוך החור.' },
      { text: 'פוסלים: חתיכה הפוכה, חתיכה עם משבצת אחת לא נכונה, או חתיכה שזזה צעד אחד.' },
    ],
  },
  {
    id: 'oddshape',
    topic: 'shapes',
    title: 'הצורה יוצאת הדופן',
    emoji: '🔍',
    steps: [
      { text: 'בודקים כל תכונה בנפרד: סוג הצורה, צבע, מילוי, כיוון, גודל.' },
      { text: 'מוצאים תכונה שמשותפת לשלוש צורות. הרביעית היא התשובה.' },
    ],
  },
  // ---------------- logic ----------------
  {
    id: 'ordering',
    topic: 'logic',
    title: 'מי לפני מי?',
    emoji: '📏',
    steps: [
      { text: 'מציירים קו בראש (או על דף): הכי גבוה למעלה, הכי נמוך למטה.' },
      { text: 'מכניסים כל משפט לקו, אחד אחד.', example: 'דנה > רון, רון > מיכל\n→ דנה, רון, מיכל' },
      { text: 'רק אחרי שכולם בקו, עונים על השאלה.' },
    ],
  },
  {
    id: 'days',
    topic: 'logic',
    title: 'ימים בשבוע',
    emoji: '📅',
    steps: [
      { text: 'קודם מוצאים איזה יום היום!', example: 'מחר יום שישי → היום חמישי' },
      { text: 'שלשום = לפני יומיים, אתמול = לפני יום, מחר = עוד יום, מחרתיים = עוד יומיים.' },
      { text: 'אחרי 7 ימים חוזרים לאותו יום בדיוק.' },
    ],
  },
  {
    id: 'logicpuzzle',
    topic: 'logic',
    title: 'חידות היגיון',
    emoji: '🧩',
    steps: [
      { text: 'ציירי את החידה! תור, מקל, עצים... ציור קטן פותר הרבה.' },
      { text: 'אל תשכחי את עצמך: "לפניה 2 ואחריה 3" → יש גם אותה!' },
      { text: '"לפחות כמה צריך כדי להיות בטוחים?" חושבים על המקרה הכי גרוע שיכול לקרות.' },
    ],
  },
];

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
