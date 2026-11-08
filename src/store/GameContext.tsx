import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadState, saveState, type GameState } from './state';
import { awardBadges, type Badge } from '../engine/badges';

interface Ctx {
  state: GameState;
  /** Apply a pure update; badges are checked automatically. */
  update: (fn: (s: GameState) => GameState) => void;
  replace: (s: GameState) => void;
  newBadges: Badge[];
  clearBadges: () => void;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadState);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => saveState(state), [state]);

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setState((prev) => {
      const [next, earned] = awardBadges(fn(prev));
      if (earned.length)
        setTimeout(() => setNewBadges((b) => [...b, ...earned.filter((e) => !b.some((x) => x.id === e.id))]), 0);
      return next;
    });
  }, []);

  const replace = useCallback((s: GameState) => setState(s), []);
  const clearBadges = useCallback(() => setNewBadges([]), []);

  return <GameCtx.Provider value={{ state, update, replace, newBadges, clearBadges }}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error('useGame outside provider');
  return c;
}
