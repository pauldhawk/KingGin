import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../../src/state/gameReducer';
import type { AppState } from '../../src/state/types';

// Helper: run START_GAME and return state
function startGame(seed = 'test-seed'): AppState {
  return gameReducer(initialState, { type: 'START_GAME', seed });
}

describe('START_GAME', () => {
  it('deals 4 hands of 11 cards each', () => {
    const state = startGame();
    expect(state.players).toHaveLength(4);
    state.players.forEach((p) => expect(p.hand).toHaveLength(11));
  });

  it('leaves 63 cards in drawPile (108 − 44 dealt − 1 face-up discard)', () => {
    const state = startGame();
    expect(state.drawPile).toHaveLength(63);
  });

  it('starts discard pile with 1 card', () => {
    const state = startGame();
    expect(state.discardPile).toHaveLength(1);
  });

  it('sets phase to waiting-draw', () => {
    const state = startGame();
    expect(state.phase).toBe('waiting-draw');
  });

  it('names human player "You" and bots "Bot 1/2/3"', () => {
    const state = startGame();
    expect(state.players[0].name).toBe('You');
    expect(state.players[1].name).toBe('Bot 1');
    expect(state.players[3].name).toBe('Bot 3');
  });

  it('different seeds produce different hands', () => {
    const a = startGame('seed-a');
    const b = startGame('seed-b');
    expect(a.players[0].hand).not.toEqual(b.players[0].hand);
  });
});

describe('DRAW_STOCK', () => {
  it('adds one card to active player hand', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    expect(s1.players[0].hand).toHaveLength(12);
  });

  it('removes top card from drawPile', () => {
    const s0 = startGame();
    const before = s0.drawPile.length;
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    expect(s1.drawPile).toHaveLength(before - 1);
  });

  it('advances phase to waiting-discard', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    expect(s1.phase).toBe('waiting-discard');
  });

  it('is ignored when not in waiting-draw phase', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    // s1 is waiting-discard
    const s2 = gameReducer(s1, { type: 'DRAW_STOCK' });
    expect(s2).toBe(s1); // same reference — no state change
  });
});

describe('DRAW_DISCARD', () => {
  it('adds discard pile top card to active player hand', () => {
    const s0 = startGame();
    const topCard = s0.discardPile[s0.discardPile.length - 1];
    const s1 = gameReducer(s0, { type: 'DRAW_DISCARD' });
    expect(s1.players[0].hand).toContain(topCard);
  });

  it('removes top card from discard pile', () => {
    const s0 = startGame();
    const before = s0.discardPile.length;
    const s1 = gameReducer(s0, { type: 'DRAW_DISCARD' });
    expect(s1.discardPile).toHaveLength(before - 1);
  });

  it('advances phase to waiting-discard', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_DISCARD' });
    expect(s1.phase).toBe('waiting-discard');
  });
});

describe('DISCARD', () => {
  it('removes card from hand and adds to discard pile', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    const card = s1.players[0].hand[0];
    const s2 = gameReducer(s1, { type: 'DISCARD', card });
    expect(s2.players[0].hand).not.toContain(card);
    expect(s2.discardPile).toContain(card);
  });

  it('advances active player index', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    const card = s1.players[0].hand[0];
    const s2 = gameReducer(s1, { type: 'DISCARD', card });
    expect(s2.activePlayerIndex).toBe(1);
  });

  it('wraps active player index back to 0', () => {
    // Simulate 4 players discarding in turn
    let state = startGame();
    for (let turn = 0; turn < 4; turn++) {
      state = gameReducer(state, { type: 'DRAW_STOCK' });
      const card = state.players[state.activePlayerIndex].hand[0];
      state = gameReducer(state, { type: 'DISCARD', card });
      if (turn < 3) {
        // For bot players, we need to manually advance since BOT_TURN would normally fire
        // but here we're testing the reducer directly
        state = { ...state, activePlayerIndex: (turn + 1) % 4, phase: 'waiting-draw' };
      }
    }
    expect(state.activePlayerIndex).toBe(0);
  });

  it('returns to waiting-draw phase', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    const card = s1.players[0].hand[0];
    const s2 = gameReducer(s1, { type: 'DISCARD', card });
    expect(s2.phase).toBe('waiting-draw');
  });
});

describe('GO_OUT', () => {
  it('sets phase to round-over', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    const discardCard = s1.players[0].hand[0];
    const s2 = gameReducer(s1, { type: 'GO_OUT', discardCard });
    expect(s2.phase).toBe('round-over');
  });

  it('going-out player scores 0', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    const discardCard = s1.players[0].hand[0];
    const s2 = gameReducer(s1, { type: 'GO_OUT', discardCard });
    expect(s2.finalScores![0]).toBe(0);
  });

  it('records goingOutPlayerIndex', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    const discardCard = s1.players[0].hand[0];
    const s2 = gameReducer(s1, { type: 'GO_OUT', discardCard });
    expect(s2.goingOutPlayerIndex).toBe(0);
  });

  it('other players have scores > 0 (cards in hand)', () => {
    const s0 = startGame();
    const s1 = gameReducer(s0, { type: 'DRAW_STOCK' });
    const discardCard = s1.players[0].hand[0];
    const s2 = gameReducer(s1, { type: 'GO_OUT', discardCard });
    // Bots still have cards, so scores should be positive
    expect(s2.finalScores![1]).toBeGreaterThan(0);
  });
});

describe('draw pile exhaustion', () => {
  it('reshuffles discard pile (minus top) when draw pile is empty', () => {
    // Construct a state with an empty draw pile and a multi-card discard pile
    const s0 = startGame();
    const stateWithEmptyDraw: AppState = {
      ...s0,
      phase: 'waiting-draw',
      drawPile: [],
      discardPile: [
        { suit: 'hearts', rank: 'K' },
        { suit: 'spades', rank: 'Q' },
        { suit: 'clubs', rank: 'J' }, // top card (stays)
      ],
    };
    const s1 = gameReducer(stateWithEmptyDraw, { type: 'DRAW_STOCK' });
    // Should have drawn 1 card, reshuffled the pile
    expect(s1.players[0].hand).toHaveLength(12);
    // The top discard (J♣) stays in discard pile
    const topRemains = s1.discardPile.some(
      (c) => c.suit === 'clubs' && c.rank === 'J'
    );
    expect(topRemains).toBe(true);
  });
});
