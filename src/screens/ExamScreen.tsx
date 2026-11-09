import type { Go } from './nav';
import { useGame } from '../store/GameContext';
import { TopBar } from '../components/ui';

export function ExamScreen({ go }: { go: Go }) {
  const { state } = useGame();
  return (
    <div className="screen">
      <TopBar onBack={() => go({ name: 'home' })} title="📝 סימולציית מבחן" />
      <p className="lead">כמו במבחן האמיתי: יש שעון, ורואים את התשובות רק בסוף. בהצלחה!</p>
      <ul className="tips">
        <li>⏱️ <strong>אל תיתקעי:</strong> שאלה קשה? לחצי "לדלג" וחזרי אליה בסוף.</li>
        <li>🗺️ <strong>מפת השאלות</strong> מראה מה עוד לא ענית (צהוב = דילגת).</li>
        <li>🎯 <strong>לא משאירים ריק:</strong> אם לא בטוחה, פוסלים תשובות שבטוח לא נכונות, ובוחרים מהשאר.</li>
        <li>👀 <strong>קוראים עד הסוף:</strong> את השאלה ואת כל התשובות, לפני שבוחרים.</li>
        <li>😌 <strong>נושמים:</strong> זה רק תרגול. כל סימולציה מכינה אותך יותר!</li>
      </ul>
      <div className="exam-cards">
        <button className="exam-card" onClick={() => go({ name: 'play', mode: { kind: 'exam', part: 'A' } })}>
          <span className="big-emoji">🔢📖</span>
          <strong>שלב א'</strong>
          <small>חשבון (תרגילים, חייכנים, אי-שוויונים, חידות בציורים, בעיות) ושני קטעי קריאה · כ-23 שאלות · 25 דקות</small>
        </button>
        <button className="exam-card" onClick={() => go({ name: 'play', mode: { kind: 'exam', part: 'B' } })}>
          <span className="big-emoji">💬🔢⭕🔷</span>
          <strong>שלב ב'</strong>
          <small>קשר בין מילים, השלמת משפטים, בעיות, מספרים בצורות וצורות · 23 שאלות · 25 דקות</small>
        </button>
      </div>
      <p className="muted-text">
        סימולציות שנעשו: {state.examsDone} · השיא שלך: {state.bestExam}% · 70% ומעלה = +{state.settings.minutesPerBoss} דקות
      </p>
    </div>
  );
}
