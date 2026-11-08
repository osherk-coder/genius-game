import type { Go } from './nav';
import { useGame } from '../store/GameContext';
import { TopBar } from '../components/ui';

export function ExamScreen({ go }: { go: Go }) {
  const { state } = useGame();
  return (
    <div className="screen">
      <TopBar onBack={() => go({ name: 'home' })} title="📝 סימולציית מבחן" />
      <p className="lead">כמו במבחן האמיתי: יש שעון, ורואים את התשובות רק בסוף. בהצלחה!</p>
      <div className="exam-cards">
        <button className="exam-card" onClick={() => go({ name: 'play', mode: { kind: 'exam', part: 'A' } })}>
          <span className="big-emoji">🔢📖</span>
          <strong>שלב א'</strong>
          <small>חשבון והבנת הנקרא · 16 שאלות · 20 דקות</small>
        </button>
        <button className="exam-card" onClick={() => go({ name: 'play', mode: { kind: 'exam', part: 'B' } })}>
          <span className="big-emoji">🔗💬🔷🧩</span>
          <strong>שלב ב'</strong>
          <small>סדרות, מילים, צורות וחשיבה · 20 שאלות · 20 דקות</small>
        </button>
      </div>
      <p className="muted-text">
        סימולציות שנעשו: {state.examsDone} · השיא שלך: {state.bestExam}% · 70% ומעלה = +{state.settings.minutesPerBoss} דקות
      </p>
    </div>
  );
}
