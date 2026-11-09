import type { GameState } from '../store/state';
import type { TopicId } from '../types';
import { TOPICS } from '../data/topics';
import { today } from '../engine/rewards';
import { OWL_STAGES, owlStage } from '../data/owlStages';

function daysBack(from: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - from - i);
    return today(d);
  });
}

function sumWeek(s: GameState, dates: string[]) {
  const per: Partial<Record<TopicId, { a: number; c: number }>> = {};
  let a = 0;
  let c = 0;
  for (const d of dates) {
    const day = s.daily[d];
    if (!day) continue;
    for (const [t, v] of Object.entries(day)) {
      const p = (per[t as TopicId] ??= { a: 0, c: 0 });
      p.a += v!.a;
      p.c += v!.c;
      a += v!.a;
      c += v!.c;
    }
  }
  const seconds = dates.reduce((n, d) => n + (s.practiceByDate[d] ?? 0), 0);
  const activeDays = dates.filter((d) => (s.practiceByDate[d] ?? 0) > 0 || s.daily[d]).length;
  const minutesEarned = dates.reduce((n, d) => n + (s.minutesByDate[d] ?? 0), 0);
  return { per, a, c, seconds, activeDays, minutesEarned };
}

const pct = (c: number, a: number) => (a ? Math.round((c / a) * 100) : null);

/** Weekly summary for the parent: this week vs. last week, per topic, plus recommendations. */
export function WeeklyReport({ s }: { s: GameState }) {
  const thisWeek = sumWeek(s, daysBack(0, 7));
  const lastWeek = sumWeek(s, daysBack(7, 7));
  const weekRedeemed = s.redemptions
    .filter((r) => Date.now() - new Date(r.at).getTime() < 7 * 86400000)
    .reduce((n, r) => n + r.minutes, 0);

  const rows = TOPICS.map((t) => {
    const now = thisWeek.per[t.id];
    const before = lastWeek.per[t.id];
    return {
      t,
      a: now?.a ?? 0,
      p: now ? pct(now.c, now.a) : null,
      prev: before ? pct(before.c, before.a) : null,
    };
  });

  const tips: string[] = [];
  const practiced = rows.filter((r) => r.a >= 5);
  const weakest = [...practiced].sort((x, y) => (x.p ?? 0) - (y.p ?? 0))[0];
  if (weakest && (weakest.p ?? 100) < 70) tips.push(`כדאי לחזק את "${weakest.t.name}" (${weakest.p}% הצלחה השבוע). אפשר להציע לה את "הטריקים של האי".`);
  const untouched = rows.filter((r) => r.a === 0).map((r) => r.t.name);
  if (untouched.length && untouched.length < TOPICS.length) tips.push(`השבוע לא תורגלו: ${untouched.join(', ')}.`);
  if (thisWeek.activeDays < 3) tips.push('מומלץ לתרגל קצר אבל כמעט כל יום (10–15 דקות), במקום הרבה בבת אחת.');
  if (s.examsDone === 0 && s.totalCorrect > 80) tips.push('היא כבר תרגלה לא מעט. זה זמן טוב לנסות סימולציית מבחן עם שעון.');
  const improved = rows.filter((r) => r.p !== null && r.prev !== null && r.p - r.prev >= 10);
  if (improved.length) tips.push(`שיפור יפה ב: ${improved.map((r) => r.t.name).join(', ')} 🎉 שווה לפרגן לה!`);
  if (!tips.length) tips.push('שבוע מצוין! המשיכו כך 👏');

  const delta = (now: number | null, prev: number | null) =>
    now === null || prev === null ? '' : now > prev ? ` ▲${now - prev}` : now < prev ? ` ▼${prev - now}` : '';

  return (
    <section className="panel">
      <h3>📅 הדוח השבועי (7 הימים האחרונים)</h3>
      <div className="report-stats">
        <div>
          <strong>{thisWeek.a}</strong>
          <small>שאלות ({lastWeek.a} בשבוע הקודם)</small>
        </div>
        <div>
          <strong>{pct(thisWeek.c, thisWeek.a) ?? '—'}%</strong>
          <small>הצלחה{delta(pct(thisWeek.c, thisWeek.a), pct(lastWeek.c, lastWeek.a))}</small>
        </div>
        <div>
          <strong>{Math.round(thisWeek.seconds / 60)}′</strong>
          <small>זמן תרגול · {thisWeek.activeDays} ימים</small>
        </div>
        <div>
          <strong>
            +{thisWeek.minutesEarned} / −{weekRedeemed}
          </strong>
          <small>דקות מסך: נצברו / מומשו</small>
        </div>
      </div>
      <table className="report-table">
        <thead>
          <tr>
            <th>נושא</th>
            <th>שאלות</th>
            <th>הצלחה</th>
            <th>שבוע קודם</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.t.id}>
              <td>
                {r.t.emoji} {r.t.name}
              </td>
              <td>{r.a}</td>
              <td>{r.p === null ? '—' : `${r.p}%`}</td>
              <td>{r.prev === null ? '—' : `${r.prev}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4>💡 המלצות</h4>
      <ul className="report-tips">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
      <p className="muted-text">
        ינשופי בשלב: {OWL_STAGES[owlStage(s.totalCorrect)].emoji} {OWL_STAGES[owlStage(s.totalCorrect)].name} · טריקים שנלמדו: {s.lessonsSeen.length}
      </p>
    </section>
  );
}

/** Short "how it works" page for the parent. */
export function HowItWorks() {
  return (
    <section className="panel">
      <details>
        <summary>
          <h3 style={{ display: 'inline' }}>❓ איך זה עובד (להורים)</h3>
        </summary>
        <div className="how">
          <h4>🎯 המטרה</h4>
          <p>
            להכין לשני שלבי מבחן המחוננים בדרך של משחק. השאלות בנויות לפי סוגי השאלות במבחנים לדוגמה (שלב א': חשבון והבנת הנקרא. שלב ב': קשר בין
            מילים, השלמת משפטים, בעיות, מספרים בצורות וצורות). כל השאלות מקוריות.
          </p>
          <h4>📈 קושי מסתגל</h4>
          <p>
            לכל נושא יש רמה מ-1 עד 5. אחרי 3 תשובות נכונות ברצף הרמה עולה, ואחרי 2 טעויות ברצף היא יורדת. כך האתגר נשאר לא קל מדי ולא מתסכל. שלבים
            מתקדמים באי פותחים רמות גבוהות יותר.
          </p>
          <h4>🔁 חזרה על טעויות</h4>
          <p>שאלה שהיא טעתה בה חוזרת אליה אחרי כמה משחקים. יש גם כפתור "לתקן טעויות" במסך הבית.</p>
          <h4>🎓 לומדים את הטריק</h4>
          <p>
            לכל סוג שאלה יש שיעור קצר צעד אחר צעד. הוא מוצע לה בפעם הראשונה שהיא פוגשת סוג שאלה, ואפשר לפתוח אותו בכל רגע מהכפתור "🎓 הטריק" או
            מהאי.
          </p>
          <h4>⏱️ איך מחושבות הדקות</h4>
          <ul>
            <li>מעבר שלב בפעם הראשונה (או שיפור כוכבים): לפי ההגדרה "דקות לשלב".</li>
            <li>ניצחון על בוס, או 70% ומעלה בסימולציה: לפי "דקות לבוס / סימולציה".</li>
            <li>האתגר היומי (פעם ביום): לפי "דקות לאתגר יומי".</li>
            <li>יש תקרה יומית, כך שאי אפשר "לחרוש" שלבים קלים.</li>
            <li>מימוש: היא בוחרת כמה דקות, ואתם מאשרים בקוד. הדקות יורדות מהיתרה, ואת הזמן עצמו נותנים בבקרת ההורים של המכשיר.</li>
          </ul>
          <h4>💎 יהלומים וינשופי</h4>
          <p>
            יהלומים מקבלים על כל תשובה נכונה (פחות אם השתמשה ברמז), וקונים בהם פריטים לינשוף. הינשוף עצמו גדל מאפרוח לינשוף גאון ככל שהיא עונה נכון
            יותר. זה לא קשור ליהלומים, ולכן אי אפשר "לקנות" גדילה.
          </p>
          <h4>💾 גיבוי</h4>
          <p>
            הכול נשמר רק בטאבלט הזה. אם מנקים את נתוני הדפדפן, ההתקדמות נמחקת. מומלץ ללחוץ על "גיבוי לקובץ" פעם בכמה שבועות, ולשמור את הקובץ (למשל
            במייל לעצמכם). "שחזור מגיבוי" מחזיר הכול.
          </p>
          <h4>🔊 הקראה</h4>
          <p>
            כפתור 🔊 מקריא שאלות וקטעים בעברית, בעזרת הקול המובנה של המכשיר. באייפד יש קול עברי מובנה. באנדרואיד צריך את "שירותי הדיבור של Google"
            עם עברית (הגדרות ← נגישות ← המרת טקסט לדיבור).
          </p>
        </div>
      </details>
    </section>
  );
}
