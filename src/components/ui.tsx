import { useEffect, useState, type ReactNode } from 'react';
import { useGame } from '../store/GameContext';
import { currentStreak } from '../engine/rewards';
import { sounds } from '../sound';

export function TopBar({ onBack, title }: { onBack?: () => void; title?: string }) {
  const { state } = useGame();
  return (
    <header className="topbar">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="חזרה">
          ➜
        </button>
      ) : (
        <span className="hello">שלום {state.childName}! 👋</span>
      )}
      {title && <h2 className="topbar-title">{title}</h2>}
      <div className="pills">
        <span className="pill" title="רצף ימים">🔥 {currentStreak(state)}</span>
        <span className="pill" title="יהלומים">💎 {state.coins}</span>
        <span className="pill" title="דקות מסך">⏱️ {state.minutes}</span>
      </div>
    </header>
  );
}

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/** Numeric keypad for the parent PIN. */
export function PinPad({ title, onSubmit, onCancel, error }: { title: string; onSubmit: (pin: string) => void; onCancel: () => void; error?: string }) {
  const [pin, setPin] = useState('');
  const press = (d: string) => {
    sounds.tap();
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        onSubmit(next);
        setPin('');
      }, 150);
    }
  };
  return (
    <Modal onClose={onCancel}>
      <h3>{title}</h3>
      <div className="pin-dots">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < pin.length ? 'dot on' : 'dot'} />
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="pinpad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button onClick={onCancel} className="muted">
          ביטול
        </button>
        <button onClick={() => press('0')}>0</button>
        <button onClick={() => setPin(pin.slice(0, -1))} className="muted">
          ⌫
        </button>
      </div>
    </Modal>
  );
}

export function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  const emojis = ['⭐', '🎉', '✨', '💎', '💜', '🌟'];
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((i) => (
        <span
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${1.8 + Math.random() * 1.5}s`,
            fontSize: `${18 + Math.random() * 18}px`,
          }}
        >
          {emojis[i % emojis.length]}
        </span>
      ))}
    </div>
  );
}

export function BadgeToasts() {
  const { newBadges, clearBadges } = useGame();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (newBadges.length) {
      setShown(true);
      sounds.win();
    }
  }, [newBadges.length]);
  if (!shown || !newBadges.length) return null;
  return (
    <Modal
      onClose={() => {
        setShown(false);
        clearBadges();
      }}
    >
      <Confetti />
      <h3>קיבלת {newBadges.length > 1 ? 'תגים חדשים' : 'תג חדש'}! 🎉</h3>
      <div className="badge-row">
        {newBadges.map((b) => (
          <div key={b.id} className="badge earned pop">
            <span className="badge-emoji">{b.emoji}</span>
            <strong>{b.name}</strong>
            <small>{b.desc}</small>
          </div>
        ))}
      </div>
      <button
        className="btn primary"
        onClick={() => {
          setShown(false);
          clearBadges();
        }}
      >
        יש! 🥳
      </button>
    </Modal>
  );
}
