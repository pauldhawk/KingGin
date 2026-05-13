import type { AnyCard, Player } from '../engine/types';

export type Phase = 'idle' | 'waiting-draw' | 'waiting-discard' | 'round-over';

export interface AppState {
  phase: Phase;
  roundIndex: number;
  players: Player[];
  activePlayerIndex: number;
  humanPlayerIndex: number;
  drawPile: AnyCard[];
  discardPile: AnyCard[];
  goingOutPlayerIndex: number | null;
  finalScores: number[] | null;
}

export type AppAction =
  | { type: 'START_GAME'; seed?: string }
  | { type: 'DRAW_STOCK' }
  | { type: 'DRAW_DISCARD' }
  | { type: 'DISCARD'; card: AnyCard }
  | { type: 'GO_OUT'; discardCard: AnyCard }
  | { type: 'BOT_TURN' };
