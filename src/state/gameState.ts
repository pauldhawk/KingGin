import type { GameState, GameAction } from './actions';

export type { GameState };

export function gameReducer(_state: GameState, _action: GameAction): GameState {
  throw new Error('not implemented');
}
