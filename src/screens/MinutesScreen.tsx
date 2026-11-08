import { useState } from 'react';
import type { Go } from './nav';
import { useGame } from '../store/GameContext';
import { Modal, PinPad, TopBar, Confetti } from '../components/ui';
import { minutesLeftToday } from '../engine/rewards';
import { sounds } from '../sound';

const AMOUNTS = [5, 10, 15, 20, 30];

export function MinutesScreen({ go }: { go: Go }) {
  const { state, update } = useGame();
  const [want, setWant] = useState<number | null>(null);
  const [pinError, setPinError] = useState('');
  const [done, setDone] = useState<number | null>(null);
  const noPin = !state.settings.pin;

  function approve(pin: string) {
    if (pin !== state.settings.pin) {
      setPinError('קוד לא נכון');
      sounds.wrong();
      return;
    }
    const m = want!;
    update((s) => ({
      ...s,
      minutes: s.minutes - m,
      redemptions: [{ at: new Date().toISOString(), minutes: m }, ...s.redemptions].slice(0, 100),
    }));
    sounds.win();
    setWant(null);
    setPinError('');
    setDone(m);
  }

  return (
    <div className="screen">
      <TopBar onBack={() => go({ name: 'home' })} title="⏱️ בנק הדקות" />
      <div className="center-box">
        <div className="bank">
          <span className="bank-num">{state.minutes}</span>
          <span>דקות מסך שצברת</span>
        </div>
        <p className="muted-text">היום אפשר לצבור עוד {minutesLeftToday(state)} דקות.</p>
        <h3>כמה דקות לממש?</h3>
        <div className="row wrap">
          {AMOUNTS.map((a) => (
            <button key={a} className="btn amount" disabled={state.minutes < a || noPin} onClick={() => setWant(a)}>
              {a} דק'
            </button>
          ))}
        </div>
        {noPin && <p className="error">צריך שההורה יגדיר קוד במסך ההורים לפני שאפשר לממש.</p>}
        <p className="muted-text">כשתבחרי, תני את הטאבלט לאבא או לאמא שיאשרו עם הקוד.</p>
      </div>
      {want !== null && (
        <PinPad
          title={`אישור הורה: ${want} דקות מסך`}
          error={pinError}
          onSubmit={approve}
          onCancel={() => {
            setWant(null);
            setPinError('');
          }}
        />
      )}
      {done !== null && (
        <Modal onClose={() => setDone(null)}>
          <Confetti />
          <h3>אושר! 🎉</h3>
          <p className="score">{done} דקות מסך. תהני!</p>
          <button className="btn primary" onClick={() => setDone(null)}>
            תודה!
          </button>
        </Modal>
      )}
    </div>
  );
}
