import { describe, it, expect } from 'vitest';
import { buildDeck, shuffle, deal } from '../../src/engine/deck';

describe('buildDeck', () => {
  it('returns exactly 108 cards', () => {
    expect(buildDeck()).toHaveLength(108);
  });

  it('contains exactly 4 jokers', () => {
    const jokers = buildDeck().filter((c) => c.suit === 'joker');
    expect(jokers).toHaveLength(4);
  });

  it('contains exactly 2 of each non-joker card', () => {
    const deck = buildDeck();
    const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for (const suit of suits) {
      for (const rank of ranks) {
        const count = deck.filter((c) => c.suit === suit && c.rank === rank).length;
        expect(count, `${rank}${suit}`).toBe(2);
      }
    }
  });
});

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const deck = buildDeck();
    expect(shuffle(deck, 'seed')).toHaveLength(deck.length);
  });

  it('is deterministic with the same seed', () => {
    const deck = buildDeck();
    const a = shuffle(deck, 'abc');
    const b = shuffle(deck, 'abc');
    expect(a).toEqual(b);
  });

  it('produces different orders for different seeds', () => {
    const deck = buildDeck();
    const a = shuffle(deck, 'seed-1');
    const b = shuffle(deck, 'seed-2');
    // Comparing first 10 cards is enough — astronomically unlikely to match
    expect(a.slice(0, 10)).not.toEqual(b.slice(0, 10));
  });

  it('does not mutate the input array', () => {
    const deck = buildDeck();
    const copy = [...deck];
    shuffle(deck, 'test');
    expect(deck).toEqual(copy);
  });

  it('contains the same cards after shuffling', () => {
    const deck = buildDeck();
    const shuffled = shuffle(deck, 'x');
    expect(shuffled).toHaveLength(deck.length);
    // Every card in the original is still present
    for (const card of deck) {
      expect(shuffled).toContainEqual(card);
    }
  });
});

describe('deal', () => {
  const deck = shuffle(buildDeck(), 'deal-test');

  it('returns the correct number of hands', () => {
    const { hands } = deal(deck, 4, 11);
    expect(hands).toHaveLength(4);
  });

  it('gives each player exactly cardsPerPlayer cards', () => {
    const { hands } = deal(deck, 4, 11);
    for (const hand of hands) {
      expect(hand).toHaveLength(11);
    }
  });

  it('remaining pile has the correct size', () => {
    const { remaining } = deal(deck, 4, 11);
    expect(remaining).toHaveLength(deck.length - 4 * 11);
  });

  it('deals round-robin: first card goes to player 0', () => {
    const { hands } = deal(deck, 4, 11);
    expect(hands[0][0]).toEqual(deck[0]);
    expect(hands[1][0]).toEqual(deck[1]);
    expect(hands[2][0]).toEqual(deck[2]);
    expect(hands[3][0]).toEqual(deck[3]);
  });

  it('second card in each hand is from position 4,5,6,7', () => {
    const { hands } = deal(deck, 4, 11);
    expect(hands[0][1]).toEqual(deck[4]);
    expect(hands[1][1]).toEqual(deck[5]);
  });

  it('total dealt cards equals playerCount × cardsPerPlayer', () => {
    const { hands } = deal(deck, 3, 11);
    const total = hands.reduce((s, h) => s + h.length, 0);
    expect(total).toBe(33);
  });
});
