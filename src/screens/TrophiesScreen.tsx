import type { Go } from './nav';
import { useGame } from '../store/GameContext';
import { TopBar } from '../components/ui';
import { BADGES } from '../engine/badges';
import { TOPICS } from '../data/topics';

export function TrophiesScreen({ go }: { go: Go }) {
  const { state } = useGame();
  const totalStars = TOPICS.reduce((n, t) => n + state.stars[t.id].reduce((a, b) => a + (b ?? 0), 0), 0);
  return (
    <div className="screen">
      <TopBar onBack={() => go({ name: 'home' })} title="🏆 הגביעים שלי" />
      <div className="stat-row">
        <div className="stat">
          <strong>{state.totalCorrect}</strong>
          <small>תשובות נכונות</small>
        </div>
        <div className="stat">
          <strong>★ {totalStars}</strong>
          <small>כוכבים</small>
        </div>
        <div className="stat">
          <strong>{state.badges.length}/{BADGES.length}</strong>
          <small>תגים</small>
        </div>
        <div className="stat">
          <strong>🔥 {state.streak.count}</strong>
          <small>רצף ימים</small>
        </div>
      </div>
      <div className="badges">
        {BADGES.map((b) => {
          const on = state.badges.includes(b.id);
          return (
            <div key={b.id} className={on ? 'badge earned' : 'badge'}>
              <span className="badge-emoji">{on ? b.emoji : '❔'}</span>
              <strong>{b.name}</strong>
              <small>{b.desc}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
