import { useState } from 'react';
import type { Go, Screen } from './nav';
import { TopBar } from '../components/ui';
import { LessonView } from '../components/LessonView';
import { LESSONS, lessonById } from '../data/lessons';
import { topicById } from '../data/topics';
import { useGame } from '../store/GameContext';
import type { TopicId } from '../types';

/**
 * lessonId is either a single lesson id, or "topic:<topicId>" to list all lessons of an island.
 */
export function LessonScreen({ lessonId, back, go }: { lessonId: string; back: Screen; go: Go }) {
  const { state, update } = useGame();
  const topic = lessonId.startsWith('topic:') ? (lessonId.slice(6) as TopicId) : null;
  const isList = topic !== null || lessonId === 'all';
  const [open, setOpen] = useState<string | null>(isList ? null : lessonId);
  const lesson = open ? lessonById(open) : undefined;

  const markSeen = (id: string) =>
    update((s) => (s.lessonsSeen.includes(id) ? s : { ...s, lessonsSeen: [...s.lessonsSeen, id] }));

  return (
    <div className="screen">
      <TopBar onBack={() => (lesson && isList ? setOpen(null) : go(back))} title="🎓 לומדים את הטריק" />
      {lesson ? (
        <div className="center-box wide">
          <LessonView
            lesson={lesson}
            onDone={() => {
              markSeen(lesson.id);
              if (isList) setOpen(null);
              else go(back);
            }}
          />
        </div>
      ) : (
        <>
          <p className="lead">{topic ? `${topicById(topic).island}: בחרי טריק ללמוד` : 'כל הטריקים לכל סוגי השאלות. בחרי אחד:'}</p>
          <div className="lesson-list">
            {LESSONS.filter((l) => !topic || l.topic === topic).map((l) => (
              <button key={l.id} className="lesson-card" onClick={() => setOpen(l.id)}>
                <span className="lesson-emoji">{l.emoji}</span>
                <strong>{l.title}</strong>
                <small>{state.lessonsSeen.includes(l.id) ? '✓ למדת' : 'חדש!'}</small>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
