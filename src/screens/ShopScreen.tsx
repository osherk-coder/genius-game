import { useState } from 'react';
import type { Go } from './nav';
import { useGame } from '../store/GameContext';
import { TopBar } from '../components/ui';
import { Owl } from '../components/Owl';
import { SHOP, SLOT_NAMES, type ShopItem, type Slot } from '../data/shop';
import { sounds } from '../sound';

const SLOTS: Slot[] = ['hat', 'glasses', 'accessory', 'color', 'background'];

export function ShopScreen({ go }: { go: Go }) {
  const { state, update } = useGame();
  const [slot, setSlot] = useState<Slot>('hat');
  const [preview, setPreview] = useState<ShopItem | null>(null);
  const equippedPreview = preview ? { ...state.equipped, [preview.slot]: preview.id } : state.equipped;

  function act(item: ShopItem) {
    const owned = state.owned.includes(item.id);
    if (owned) {
      const isOn = state.equipped[item.slot] === item.id;
      const canRemove = item.slot === 'hat' || item.slot === 'glasses' || item.slot === 'accessory';
      sounds.tap();
      update((s) => ({ ...s, equipped: { ...s.equipped, [item.slot]: isOn && canRemove ? null : item.id } }));
      setPreview(null);
      return;
    }
    if (state.coins < item.price || preview?.id !== item.id) {
      // first tap previews; a second tap on the same item buys it
      sounds.tap();
      setPreview(item);
      return;
    }
    sounds.coin();
    update((s) => ({
      ...s,
      coins: s.coins - item.price,
      owned: [...s.owned, item.id],
      equipped: { ...s.equipped, [item.slot]: item.id },
    }));
    setPreview(null);
  }

  return (
    <div className="screen shop">
      <TopBar onBack={() => go({ name: 'home' })} title="🛍️ החנות" />
      <div className="shop-layout">
        <div className="shop-preview">
          <Owl equipped={equippedPreview} size={190} withBackground mood="wow" />
          {preview && !state.owned.includes(preview.id) && (
            <p className="muted-text">
              {state.coins >= preview.price ? `${preview.name}: ${preview.price} 💎 · לחצי שוב כדי לקנות` : `חסרים לך ${preview.price - state.coins} 💎 ל${preview.name}. המשיכי לפתור!`}
            </p>
          )}
        </div>
        <div className="shop-items">
          <div className="tabs">
            {SLOTS.map((s) => (
              <button key={s} className={slot === s ? 'tab on' : 'tab'} onClick={() => setSlot(s)}>
                {SLOT_NAMES[s]}
              </button>
            ))}
          </div>
          <div className="items">
            {SHOP.filter((i) => i.slot === slot).map((item) => {
              const owned = state.owned.includes(item.id);
              const on = state.equipped[item.slot] === item.id;
              const afford = state.coins >= item.price;
              return (
                <button
                  key={item.id}
                  className={`item${on ? ' on' : ''}${!owned && !afford ? ' poor' : ''}`}
                  onClick={() => act(item)}
                >
                  <div className="item-thumb">
                    <Owl equipped={{ ...state.equipped, [item.slot]: item.id }} size={80} />
                  </div>
                  <strong>{item.name}</strong>
                  <small>{on ? '✓ לבוש' : owned ? 'ללבוש' : `${item.price} 💎`}</small>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
