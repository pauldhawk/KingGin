import type { GameState } from '../engine/types';

export type { GameState };

export function gameReducer(_state: GameState, _action: unknown): GameState {
  throw new Error('not implemented');
}
