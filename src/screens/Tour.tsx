import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { Owl } from '../components/Owl';
import { speak } from '../speech';

const SLIDES = [
  {
    emoji: '🗺️',
    title: 'המפה של האיים',
    text: 'יש שישה איים, ובכל אחד סוג אחר של חידות: חשבון, קריאה, סדרות, מילים, צורות וחשיבה. בכל אי יש 10 שלבים, ובסוף מחכה בוס! 🐉',
  },
  {
    emoji: '💎',
    title: 'צוברים יהלומים',
    text: 'על כל תשובה נכונה מקבלים יהלומים, ועל כמה תשובות נכונות ברצף מקבלים בונוס 🔥. ביהלומים קונים בחנות כובעים, משקפיים וצבעים בשבילי!',
  },
  {
    emoji: '⏱️',
    title: 'מרוויחים דקות מסך',
    text: 'כשעוברים שלב, מנצחים בוס או עושים את האתגר היומי, מקבלים דקות מסך. כדי לממש אותן, נותנים את הטאבלט לאבא או לאמא שיאשרו עם הקוד.',
  },
  {
    emoji: '💪',
    title: 'טעויות זה בסדר!',
    text: 'כל מי שלומד טועה. אם טעית, יש הסבר, והשאלה תחזור אלייך מאוחר יותר. ואם קשה, יש כפתור רמז 💡 וכפתור "לומדים את הטריק" 🎓. וגם אני גדל ככל שאת מתקדמת!',
  },
];

export function Tour() {
  const { state, update } = useGame();
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <div className="screen onboarding">
      <div className="center-box tour" key={i}>
        <div className="bob">
          <Owl equipped={state.equipped} size={150} mood="wow" />
        </div>
        <div className="tour-emoji pop">{s.emoji}</div>
        <h2>{s.title}</h2>
        <p className="lead">{s.text}</p>
        {state.settings.readAloud && (
          <button className="btn small" onClick={() => speak(`${s.title}. ${s.text}`)}>
            🔊 הקריאי לי
          </button>
        )}
        <div className="tour-dots">
          {SLIDES.map((_, k) => (
            <span key={k} className={k === i ? 'dot on' : 'dot'} />
          ))}
        </div>
        <div className="row">
          {i > 0 && (
            <button className="btn" onClick={() => setI(i - 1)}>
              ➜ הקודם
            </button>
          )}
          <button
            className="btn primary big"
            onClick={() => (last ? update((st) => ({ ...st, tourDone: true })) : setI(i + 1))}
          >
            {last ? 'יאללה, מתחילים! 🚀' : 'הבא ⬅'}
          </button>
        </div>
      </div>
    </div>
  );
}
