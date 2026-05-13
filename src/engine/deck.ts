import seedrandom from 'seedrandom';
import type { AnyCard, Suit, Rank } from './types';

const SUITS: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function buildDeck(): AnyCard[] {
  const deck: AnyCard[] = [];
  for (let d = 0; d < 2; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank });
      }
    }
    deck.push({ suit: 'joker', rank: 'joker' });
    deck.push({ suit: 'joker', rank: 'joker' });
  }
  return deck;
}

export function shuffle(deck: AnyCard[], seed: string): AnyCard[] {
  const rng = seedrandom(seed);
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function deal(
  deck: AnyCard[],
  playerCount: number,
  cardsPerPlayer: number
): { hands: AnyCard[][]; remaining: AnyCard[] } {
  const hands: AnyCard[][] = Array.from({ length: playerCount }, () => []);
  let i = 0;
  for (let card = 0; card < cardsPerPlayer; card++) {
    for (let p = 0; p < playerCount; p++) {
      hands[p].push(deck[i++]);
    }
  }
  return { hands, remaining: deck.slice(i) };
}
