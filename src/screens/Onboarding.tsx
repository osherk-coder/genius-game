import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { Owl } from '../components/Owl';

export function Onboarding() {
  const { state, update } = useGame();
  const [name, setName] = useState('');
  return (
    <div className="screen onboarding">
      <div className="center-box">
        <div className="bob">
          <Owl equipped={state.equipped} size={200} mood="wow" />
        </div>
        <h1>ברוכה הבאה ל"גאון קטן"!</h1>
        <p className="lead">אני ינשופי, ואני אלווה אותך במסע בין איי החשיבה. פותרים, צוברים יהלומים ודקות, ומתכוננים למבחן בכיף!</p>
        <label className="name-label">
          איך קוראים לך?
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלך" maxLength={20} />
        </label>
        <button className="btn primary big" disabled={!name.trim()} onClick={() => update((s) => ({ ...s, childName: name.trim(), coins: s.coins + 50 }))}>
          יוצאים לדרך! 🚀
        </button>
        <small className="muted-text">מתנת פתיחה: 50 💎</small>
      </div>
    </div>
  );
}
