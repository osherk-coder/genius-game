import { useRef, useState } from 'react';
import type { Go } from './nav';
import { useGame } from '../store/GameContext';
import { PinPad, TopBar } from '../components/ui';
import { TOPICS } from '../data/topics';
import { defaultState, normalize, type Settings } from '../store/state';
import { today } from '../engine/rewards';

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return today(d);
  });
}

const DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export function ParentScreen({ go }: { go: Go }) {
  const { state, update, replace } = useGame();
  const [unlocked, setUnlocked] = useState(false);
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [changingPin, setChangingPin] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const hasPin = !!state.settings.pin;

  // --- PIN gate ---
  if (!unlocked || changingPin) {
    const creating = !hasPin || changingPin;
    return (
      <div className="screen">
        <TopBar onBack={() => (changingPin ? setChangingPin(false) : go({ name: 'home' }))} title="⚙️ אזור הורים" />
        <PinPad
          title={creating ? (firstPin ? 'הקלידו שוב את הקוד החדש' : 'בחרו קוד הורים חדש (4 ספרות)') : 'הקלידו את קוד ההורים'}
          error={error}
          onCancel={() => (changingPin ? setChangingPin(false) : go({ name: 'home' }))}
          onSubmit={(pin) => {
            if (!creating) {
              if (pin === state.settings.pin) {
                setUnlocked(true);
                setError('');
              } else setError('קוד שגוי');
              return;
            }
            if (!firstPin) {
              setFirstPin(pin);
              setError('');
              return;
            }
            if (pin !== firstPin) {
              setFirstPin(null);
              setError('הקודים לא תואמים, נסו שוב');
              return;
            }
            update((s) => ({ ...s, settings: { ...s.settings, pin } }));
            setFirstPin(null);
            setChangingPin(false);
            setUnlocked(true);
            setError('');
            setMsg('הקוד נשמר ✓');
          }}
        />
      </div>
    );
  }

  const setSetting = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    update((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));

  const days = last7Days();
  const maxSec = Math.max(60, ...days.map((d) => state.practiceByDate[d] ?? 0));
  const topicRows = TOPICS.map((t) => {
    const st = state.stats[t.id];
    const pct = st.attempts ? Math.round((st.correct / st.attempts) * 100) : null;
    return { t, st, pct };
  });
  const weak = topicRows.filter((r) => r.pct !== null && r.st.attempts >= 8).sort((a, b) => a.pct! - b.pct!)[0];

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `genius-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importData(file: File) {
    file.text().then((txt) => {
      try {
        replace(normalize(JSON.parse(txt)));
        setMsg('הגיבוי שוחזר ✓');
      } catch {
        setMsg('הקובץ לא תקין');
      }
    });
  }

  return (
    <div className="screen parent">
      <TopBar onBack={() => go({ name: 'home' })} title="⚙️ אזור הורים" />
      {msg && <p className="ok-msg">{msg}</p>}

      <section className="panel">
        <h3>📊 הצלחה לפי נושא</h3>
        {topicRows.map(({ t, st, pct }) => (
          <div key={t.id} className="bar-row">
            <span className="bar-label">
              {t.emoji} {t.name}
            </span>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${pct ?? 0}%`, background: pct === null ? 'transparent' : pct >= 75 ? '#22c55e' : pct >= 55 ? '#f59e0b' : '#ef4444' }} />
            </div>
            <span className="bar-val">{pct === null ? '—' : `${pct}%`}</span>
            <small className="bar-sub">
              {st.attempts} שאלות · רמה {state.topicLevel[t.id]}/5
            </small>
          </div>
        ))}
        {weak && (
          <p className="muted-text">
            💡 כדאי לחזק: <strong>{weak.t.name}</strong> ({weak.pct}% הצלחה)
          </p>
        )}
      </section>

      <section className="panel">
        <h3>⏰ זמן תרגול (7 ימים אחרונים)</h3>
        <div className="week">
          {days.map((d) => {
            const sec = state.practiceByDate[d] ?? 0;
            return (
              <div key={d} className="week-col">
                <small>{Math.round(sec / 60)}′</small>
                <div className="week-bar" style={{ height: `${(sec / maxSec) * 100}px` }} />
                <small>{DAY_NAMES[new Date(d + 'T12:00').getDay()]}</small>
              </div>
            );
          })}
        </div>
        <p className="muted-text">
          רצף נוכחי: {state.streak.count} ימים · סה"כ נכונות: {state.totalCorrect} · סימולציות: {state.examsDone} (שיא {state.bestExam}%)
        </p>
      </section>

      <section className="panel">
        <h3>⏱️ בנק דקות</h3>
        <p>
          יתרה: <strong>{state.minutes}</strong> דקות
        </p>
        <div className="settings-grid">
          <label>
            דקות לשלב שעבר
            <input type="number" min={0} max={60} value={state.settings.minutesPerStage} onChange={(e) => setSetting('minutesPerStage', Number(e.target.value))} />
          </label>
          <label>
            דקות לבוס / סימולציה
            <input type="number" min={0} max={120} value={state.settings.minutesPerBoss} onChange={(e) => setSetting('minutesPerBoss', Number(e.target.value))} />
          </label>
          <label>
            דקות לאתגר יומי
            <input type="number" min={0} max={60} value={state.settings.dailyBonusMinutes} onChange={(e) => setSetting('dailyBonusMinutes', Number(e.target.value))} />
          </label>
          <label>
            תקרה יומית
            <input type="number" min={0} max={300} value={state.settings.dailyCap} onChange={(e) => setSetting('dailyCap', Number(e.target.value))} />
          </label>
        </div>
        <div className="row">
          <button className="btn small" onClick={() => update((s) => ({ ...s, minutes: s.minutes + 10 }))}>
            +10 דקות בונוס
          </button>
          <button className="btn small" onClick={() => update((s) => ({ ...s, minutes: Math.max(0, s.minutes - 10) }))}>
            −10 דקות
          </button>
        </div>
        <h4>היסטוריית מימושים</h4>
        {state.redemptions.length === 0 ? (
          <p className="muted-text">עדיין אין מימושים.</p>
        ) : (
          <ul className="history">
            {state.redemptions.slice(0, 10).map((r, i) => (
              <li key={i}>
                {new Date(r.at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })} · {r.minutes} דקות
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h3>🔧 הגדרות</h3>
        <label className="check">
          <input type="checkbox" checked={state.settings.sound} onChange={(e) => setSetting('sound', e.target.checked)} /> צלילים
        </label>
        <label>
          שם הילדה
          <input value={state.childName} onChange={(e) => update((s) => ({ ...s, childName: e.target.value }))} />
        </label>
        <div className="row wrap">
          <button className="btn small" onClick={() => setChangingPin(true)}>
            🔑 שינוי קוד
          </button>
          <button className="btn small" onClick={exportData}>
            💾 גיבוי לקובץ
          </button>
          <button className="btn small" onClick={() => fileRef.current?.click()}>
            📂 שחזור מגיבוי
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          <button
            className="btn small danger"
            onClick={() => {
              if (confirm('לאפס את כל ההתקדמות? אי אפשר לבטל את זה. (מומלץ לגבות קודם)')) {
                replace({ ...defaultState(), settings: state.settings, childName: state.childName });
                setMsg('ההתקדמות אופסה');
              }
            }}
          >
            🗑️ איפוס התקדמות
          </button>
        </div>
      </section>
    </div>
  );
}
