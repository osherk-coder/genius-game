import { useState } from 'react';
import type { Lesson } from '../data/lessons';
import { useGame } from '../store/GameContext';
import { speak } from '../speech';
import { Owl } from './Owl';

/** A step-by-step lesson: each tap reveals the next step with a small animation. */
export function LessonView({ lesson, onDone, doneLabel = 'הבנתי! 💪' }: { lesson: Lesson; onDone: () => void; doneLabel?: string }) {
  const { state } = useGame();
  const [shown, setShown] = useState(1);
  const all = shown >= lesson.steps.length;
  return (
    <div className="lesson">
      <div className="lesson-head">
        <Owl equipped={state.equipped} size={80} mood="wow" />
        <div>
          <small>🎓 לומדים את הטריק</small>
          <h3>
            {lesson.emoji} {lesson.title}
          </h3>
        </div>
      </div>
      <ol className="lesson-steps">
        {lesson.steps.slice(0, shown).map((st, i) => (
          <li key={i} className="lesson-step pop">
            <span className="step-num">{i + 1}</span>
            <div>
              <p>{st.text}</p>
              {st.example && (
                <div className="lesson-example" dir={st.ltr ? 'ltr' : undefined}>
                  {st.example}
                </div>
              )}
            </div>
            {state.settings.readAloud && (
              <button className="speak-btn" aria-label="הקראה" onClick={() => speak(st.text + (st.example && !st.ltr ? '. ' + st.example : ''))}>
                🔊
              </button>
            )}
          </li>
        ))}
      </ol>
      <div className="row">
        {!all ? (
          <button className="btn primary big" onClick={() => setShown(shown + 1)}>
            הצעד הבא ⬅
          </button>
        ) : (
          <button className="btn primary big" onClick={onDone}>
            {doneLabel}
          </button>
        )}
      </div>
    </div>
  );
}
