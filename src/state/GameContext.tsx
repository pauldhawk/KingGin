import { createContext, useContext, useReducer, useEffect, type Dispatch, type ReactNode } from 'react';
import type { AppState, AppAction } from './types';
import { gameReducer, initialState } from './gameReducer';

interface GameContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Fire bot turns automatically with a delay so human can follow the action.
  useEffect(() => {
    if (state.phase !== 'waiting-draw') return;
    if (state.activePlayerIndex === state.humanPlayerIndex) return;

    const id = setTimeout(() => dispatch({ type: 'BOT_TURN' }), 600);
    return () => clearTimeout(id);
  }, [state.activePlayerIndex, state.phase, state.humanPlayerIndex]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
