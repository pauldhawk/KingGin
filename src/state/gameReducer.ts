import type { AppState, AppAction } from './types';
import type { AnyCard } from '../engine/types';
import { buildDeck, shuffle, deal } from '../engine/deck';
import { CONTRACTS } from '../engine/contracts';
import { canGoOut } from '../engine/validate';
import { GreedyBot } from '../engine/bots';
import { roundScores } from '../engine/score';

const bot = new GreedyBot();

export const initialState: AppState = {
  phase: 'idle',
  roundIndex: 0,
  players: [],
  activePlayerIndex: 0,
  humanPlayerIndex: 0,
  drawPile: [],
  discardPile: [],
  goingOutPlayerIndex: null,
  finalScores: null,
};

function removeCardAt(hand: AnyCard[], card: AnyCard): AnyCard[] {
  const idx = hand.indexOf(card);
  if (idx === -1) return hand;
  return [...hand.slice(0, idx), ...hand.slice(idx + 1)];
}

function reshuffleIfEmpty(drawPile: AnyCard[], discardPile: AnyCard[], seed: string): { drawPile: AnyCard[]; discardPile: AnyCard[] } {
  if (drawPile.length > 0) return { drawPile, discardPile };
  const top = discardPile[discardPile.length - 1];
  const rest = discardPile.slice(0, -1);
  return { drawPile: shuffle(rest, seed), discardPile: [top] };
}

export function gameReducer(state: AppState, action: AppAction): AppState {
  const contract = CONTRACTS[state.roundIndex];

  switch (action.type) {
    case 'START_GAME': {
      const seed = action.seed ?? String(Date.now());
      const deck = shuffle(buildDeck(), seed);
      const { hands, remaining } = deal(deck, 4, 11);
      const [topCard, ...drawPile] = remaining;
      const players = hands.map((hand, i) => ({
        id: `player-${i}`,
        name: i === 0 ? 'You' : `Bot ${i}`,
        hand,
        mayIsUsed: 0,
      }));
      return {
        ...state,
        phase: 'waiting-draw',
        roundIndex: 0,
        players,
        activePlayerIndex: 0,
        humanPlayerIndex: 0,
        drawPile,
        discardPile: [topCard],
        goingOutPlayerIndex: null,
        finalScores: null,
      };
    }

    case 'DRAW_STOCK': {
      if (state.phase !== 'waiting-draw') return state;
      const { drawPile, discardPile } = reshuffleIfEmpty(
        state.drawPile, state.discardPile, String(Date.now())
      );
      if (drawPile.length === 0) return state;
      const [drawn, ...rest] = drawPile;
      const players = state.players.map((p, i) =>
        i === state.activePlayerIndex ? { ...p, hand: [...p.hand, drawn] } : p
      );
      return { ...state, phase: 'waiting-discard', players, drawPile: rest, discardPile };
    }

    case 'DRAW_DISCARD': {
      if (state.phase !== 'waiting-draw') return state;
      if (state.discardPile.length === 0) return state;
      const drawn = state.discardPile[state.discardPile.length - 1];
      const discardPile = state.discardPile.slice(0, -1);
      const players = state.players.map((p, i) =>
        i === state.activePlayerIndex ? { ...p, hand: [...p.hand, drawn] } : p
      );
      return { ...state, phase: 'waiting-discard', players, discardPile };
    }

    case 'DISCARD': {
      if (state.phase !== 'waiting-discard') return state;
      const activePlayer = state.players[state.activePlayerIndex];
      const newHand = removeCardAt(activePlayer.hand, action.card);
      if (newHand.length === activePlayer.hand.length) return state;
      const players = state.players.map((p, i) =>
        i === state.activePlayerIndex ? { ...p, hand: newHand } : p
      );
      const discardPile = [...state.discardPile, action.card];
      const nextIndex = (state.activePlayerIndex + 1) % state.players.length;
      return { ...state, phase: 'waiting-draw', players, discardPile, activePlayerIndex: nextIndex };
    }

    case 'GO_OUT': {
      if (state.phase !== 'waiting-discard') return state;
      const activePlayer = state.players[state.activePlayerIndex];
      const newHand = removeCardAt(activePlayer.hand, action.discardCard);
      const players = state.players.map((p, i) =>
        i === state.activePlayerIndex ? { ...p, hand: newHand } : p
      );
      const discardPile = [...state.discardPile, action.discardCard];
      const scores = roundScores(players.map((p) => p.hand), contract, state.activePlayerIndex);
      return {
        ...state,
        phase: 'round-over',
        players,
        discardPile,
        goingOutPlayerIndex: state.activePlayerIndex,
        finalScores: scores,
      };
    }

    case 'BOT_TURN': {
      if (state.phase !== 'waiting-draw') return state;
      if (state.activePlayerIndex === state.humanPlayerIndex) return state;

      const { drawPile: dp, discardPile: dcp } = reshuffleIfEmpty(
        state.drawPile, state.discardPile, String(Date.now())
      );

      let drawPile = dp;
      let discardPile = dcp;
      let hand = state.players[state.activePlayerIndex].hand;
      const topDiscard = discardPile[discardPile.length - 1];

      const decision = topDiscard ? bot.draw(hand, topDiscard, contract) : 'stock';

      if (decision === 'discard' && discardPile.length > 0) {
        const drawn = discardPile[discardPile.length - 1];
        discardPile = discardPile.slice(0, -1);
        hand = [...hand, drawn];
      } else if (drawPile.length > 0) {
        const [drawn, ...rest] = drawPile;
        drawPile = rest;
        hand = [...hand, drawn];
      }

      const discardCard = bot.discard(hand, contract);
      const newHand = removeCardAt(hand, discardCard);
      const newDiscardPile = [...discardPile, discardCard];

      if (canGoOut(hand, contract)) {
        const players = state.players.map((p, i) =>
          i === state.activePlayerIndex ? { ...p, hand: newHand } : p
        );
        const scores = roundScores(players.map((p) => p.hand), contract, state.activePlayerIndex);
        return {
          ...state,
          phase: 'round-over',
          players,
          drawPile,
          discardPile: newDiscardPile,
          goingOutPlayerIndex: state.activePlayerIndex,
          finalScores: scores,
        };
      }

      const nextIndex = (state.activePlayerIndex + 1) % state.players.length;
      const players = state.players.map((p, i) =>
        i === state.activePlayerIndex ? { ...p, hand: newHand } : p
      );
      return {
        ...state,
        phase: 'waiting-draw',
        players,
        drawPile,
        discardPile: newDiscardPile,
        activePlayerIndex: nextIndex,
      };
    }

    default:
      return state;
  }
}
