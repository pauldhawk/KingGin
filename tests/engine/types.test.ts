import { describe, it, expect } from 'vitest';
import type { AnyCard, Hand } from '../../src/engine/index';

describe('engine types smoke test', () => {
  it('AnyCard can be constructed as a regular card', () => {
    const card = { suit: 'clubs', rank: 'A' } satisfies AnyCard;
    expect(card.suit).toBe('clubs');
    expect(card.rank).toBe('A');
  });

  it('AnyCard can be constructed as a joker', () => {
    const joker = { suit: 'joker', rank: 'joker' } satisfies AnyCard;
    expect(joker.suit).toBe('joker');
  });

  it('Hand is an array of AnyCard', () => {
    const hand: Hand = [
      { suit: 'clubs', rank: 'A' },
      { suit: 'joker', rank: 'joker' },
    ];
    expect(hand).toHaveLength(2);
  });
});
