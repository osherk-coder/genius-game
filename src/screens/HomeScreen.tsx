import type { Go } from './nav';
import { useGame } from '../store/GameContext';
import { TopBar } from '../components/ui';
import { Owl } from '../components/Owl';
import { STAGES_PER_ISLAND, TOPICS } from '../data/topics';
import { today } from '../engine/rewards';

const GREETINGS = [
  'מוכנה לאתגר של היום?',
  'כל תרגיל מקרב אותך לגאונות!',
  'בואי נגלה אי חדש!',
  'המוח שלך הוא שריר, בואי נאמן אותו 💪',
  'היום יום מעולה לפתור חידות!',
];

export function HomeScreen({ go }: { go: Go }) {
  const { state } = useGame();
  const dailyDone = state.dailyDone === today();
  const greeting = GREETINGS[new Date().getDate() % GREETINGS.length];
  const mistakes = state.mistakes.length;

  return (
    <div className="screen home">
      <TopBar />
      <section className="hero">
        <div className="owl-wrap bob">
          <Owl equipped={state.equipped} size={150} withBackground />
        </div>
        <div className="hero-side">
          <div className="speech">{greeting}</div>
          <button className={dailyDone ? 'daily done' : 'daily'} disabled={dailyDone} onClick={() => go({ name: 'play', mode: { kind: 'daily' } })}>
            {dailyDone ? '✅ האתגר היומי הושלם! חזרי מחר' : `☀️ האתגר היומי · +50 💎 +${state.settings.dailyBonusMinutes} ⏱️`}
          </button>
          {mistakes > 0 && (
            <button className="btn small" onClick={() => go({ name: 'play', mode: { kind: 'review' } })}>
              🔁 לתקן טעויות ({Math.min(10, mistakes)})
            </button>
          )}
        </div>
      </section>

      <h3 className="section-title">🗺️ מפת האיים</h3>
      <div className="islands">
        {TOPICS.map((t, i) => {
          const stars = state.stars[t.id];
          const passed = stars.filter((x) => x > 0).length;
          const total = stars.reduce((a, b) => a + (b ?? 0), 0);
          return (
            <button
              key={t.id}
              className="island"
              style={{ ['--c' as string]: t.color, animationDelay: `${i * 0.08}s` }}
              onClick={() => go({ name: 'island', topic: t.id })}
            >
              <span className="island-emoji">{t.emoji}</span>
              <strong>{t.island}</strong>
              <small>{t.name} · שלב {t.stage}'</small>
              <div className="mini-progress">
                <div style={{ width: `${(passed / STAGES_PER_ISLAND) * 100}%` }} />
              </div>
              <small>
                {passed}/{STAGES_PER_ISLAND} שלבים · ★ {total}
              </small>
            </button>
          );
        })}
      </div>

      <nav className="bottom-nav">
        <button onClick={() => go({ name: 'exam' })}>📝<span>מבחן</span></button>
        <button onClick={() => go({ name: 'shop' })}>🛍️<span>חנות</span></button>
        <button onClick={() => go({ name: 'trophies' })}>🏆<span>גביעים</span></button>
        <button onClick={() => go({ name: 'minutes' })}>⏱️<span>דקות</span></button>
        <button onClick={() => go({ name: 'parent' })}>⚙️<span>הורים</span></button>
      </nav>
    </div>
  );
}
