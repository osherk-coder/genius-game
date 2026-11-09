import type { TopicId } from '../types';
import type { Go } from './nav';
import { useGame } from '../store/GameContext';
import { TopBar } from '../components/ui';
import { STAGES_PER_ISLAND, isBoss, topicById } from '../data/topics';

export function IslandScreen({ topic, go }: { topic: TopicId; go: Go }) {
  const { state } = useGame();
  const t = topicById(topic);
  const stars = state.stars[topic];
  const unlockedUpTo = (() => {
    let i = 0;
    while (i < STAGES_PER_ISLAND - 1 && (stars[i] ?? 0) > 0) i++;
    return i;
  })();

  return (
    <div className="screen island-screen" style={{ ['--c' as string]: t.color }}>
      <TopBar onBack={() => go({ name: 'home' })} title={`${t.emoji} ${t.island}`} />
      <p className="island-desc">{t.desc} · רמת קושי נוכחית: {'●'.repeat(state.topicLevel[topic])}{'○'.repeat(5 - state.topicLevel[topic])}</p>
      <div className="row">
        <button className="btn small" onClick={() => go({ name: 'lesson', lessonId: `topic:${topic}`, back: { name: 'island', topic } })}>
          🎓 הטריקים של האי
        </button>
      </div>
      <div className="path">
        {Array.from({ length: STAGES_PER_ISLAND }, (_, i) => {
          const locked = i > unlockedUpTo;
          const st = stars[i] ?? 0;
          const boss = isBoss(i);
          const current = i === unlockedUpTo && st === 0;
          return (
            <div key={i} className="path-step" style={{ marginInlineStart: `${[10, 35, 60, 35][i % 4]}%` }}>
              <button
                className={`node${boss ? ' boss' : ''}${locked ? ' locked' : ''}${current ? ' current' : ''}`}
                disabled={locked}
                onClick={() => go({ name: 'play', mode: { kind: 'stage', topic, stageIdx: i } })}
              >
                {locked ? '🔒' : boss ? '🐉' : i + 1}
              </button>
              <div className="node-stars">
                {[1, 2, 3].map((k) => (
                  <span key={k} className={k <= st ? 'on' : ''}>
                    ★
                  </span>
                ))}
              </div>
              {boss && <small className="boss-label">בוס! ⏳ עם זמן</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
