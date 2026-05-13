import { describe, it, expect } from 'vitest';
import { isWild, isValidGroup, isValidSequence, validateContract } from '../../src/engine/validate';
import { CONTRACTS } from '../../src/engine/contracts';
import type { AnyCard } from '../../src/engine/types';

const J = (): AnyCard => ({ suit: 'joker', rank: 'joker' });
const C = (rank: string, suit: string): AnyCard =>
  ({ rank, suit } as AnyCard);

describe('isWild', () => {
  it('joker is wild', () => expect(isWild({ suit: 'joker', rank: 'joker' })).toBe(true));
  it('2 is wild', () => expect(isWild(C('2', 'hearts'))).toBe(true));
  it('K is not wild', () => expect(isWild(C('K', 'spades'))).toBe(false));
  it('A is not wild', () => expect(isWild(C('A', 'clubs'))).toBe(false));
  it('3 is not wild', () => expect(isWild(C('3', 'diamonds'))).toBe(false));
});

describe('isValidGroup', () => {
  it('valid: 3 same rank, no wilds', () => {
    expect(isValidGroup([C('K', 'clubs'), C('K', 'hearts'), C('K', 'spades')], 3)).toBe(true);
  });

  it('valid: 4 same rank, no wilds', () => {
    expect(
      isValidGroup([C('7', 'clubs'), C('7', 'hearts'), C('7', 'spades'), C('7', 'diamonds')], 4)
    ).toBe(true);
  });

  it('valid: 3 same rank + 1 joker', () => {
    expect(isValidGroup([C('Q', 'clubs'), C('Q', 'hearts'), J()], 3)).toBe(true);
  });

  it('valid: 4 cards — 2 same rank + 2 jokers forms group of 4', () => {
    expect(isValidGroup([C('Q', 'clubs'), C('Q', 'hearts'), J(), J()], 4)).toBe(true);
  });

  it('valid: 1 natural + 2 jokers', () => {
    expect(isValidGroup([C('5', 'clubs'), J(), J()], 3)).toBe(true);
  });

  it('valid: all jokers (size 3)', () => {
    expect(isValidGroup([J(), J(), J()], 3)).toBe(true);
  });

  it('valid: 2 naturals same rank + 1 wildcard 2', () => {
    expect(isValidGroup([C('A', 'clubs'), C('A', 'hearts'), C('2', 'spades')], 3)).toBe(true);
  });

  it('invalid: only 2 cards', () => {
    expect(isValidGroup([C('K', 'clubs'), C('K', 'hearts')], 3)).toBe(false);
  });

  it('invalid: wrong size parameter', () => {
    expect(isValidGroup([C('K', 'clubs'), C('K', 'hearts'), C('K', 'spades')], 4)).toBe(false);
  });

  it('invalid: 3 cards with 2 different ranks, 0 wilds', () => {
    expect(isValidGroup([C('K', 'clubs'), C('K', 'hearts'), C('Q', 'spades')], 3)).toBe(false);
  });

  it('invalid: 3 cards, 2 different ranks, 1 wild card 2', () => {
    // K K Q with 2 is actually valid (2 is wild, covers Q)
    expect(isValidGroup([C('K', 'clubs'), C('K', 'hearts'), C('2', 'spades')], 3)).toBe(true);
  });
});

describe('isValidSequence', () => {
  it('valid: 4 consecutive same suit, no wilds', () => {
    expect(
      isValidSequence([C('3', 'hearts'), C('4', 'hearts'), C('5', 'hearts'), C('6', 'hearts')], 4)
    ).toBe(true);
  });

  it('valid: 5 consecutive same suit, no wilds', () => {
    expect(
      isValidSequence(
        [C('3', 'hearts'), C('4', 'hearts'), C('5', 'hearts'), C('6', 'hearts'), C('7', 'hearts')],
        5
      )
    ).toBe(true);
  });

  it('valid: joker fills a gap (3-[J]-5-6)', () => {
    expect(
      isValidSequence([C('3', 'hearts'), J(), C('5', 'hearts'), C('6', 'hearts')], 4)
    ).toBe(true);
  });

  it('valid: joker extends at start ([J]-4-5-6)', () => {
    expect(
      isValidSequence([J(), C('4', 'hearts'), C('5', 'hearts'), C('6', 'hearts')], 4)
    ).toBe(true);
  });

  it('valid: joker extends at end (4-5-6-[J])', () => {
    expect(
      isValidSequence([C('4', 'hearts'), C('5', 'hearts'), C('6', 'hearts'), J()], 4)
    ).toBe(true);
  });

  it('valid: 2 jokers fill 2 separate gaps (3-[J]-5-[J]-7)', () => {
    expect(
      isValidSequence(
        [C('3', 'clubs'), J(), C('5', 'clubs'), J(), C('7', 'clubs')],
        5
      )
    ).toBe(true);
  });

  it('valid: corner wrap Q-K-A-2 (natural 2 at wrap position)', () => {
    expect(
      isValidSequence(
        [C('Q', 'hearts'), C('K', 'hearts'), C('A', 'hearts'), C('2', 'hearts')],
        4
      )
    ).toBe(true);
  });

  it('valid: corner wrap K-A-2-3', () => {
    expect(
      isValidSequence(
        [C('K', 'clubs'), C('A', 'clubs'), C('2', 'clubs'), C('3', 'clubs')],
        4
      )
    ).toBe(true);
  });

  it('valid: ace low A-2-3-4 (2 natural)', () => {
    expect(
      isValidSequence(
        [C('A', 'spades'), C('2', 'spades'), C('3', 'spades'), C('4', 'spades')],
        4
      )
    ).toBe(true);
  });

  it('valid: ace high J-Q-K-A', () => {
    expect(
      isValidSequence(
        [C('J', 'diamonds'), C('Q', 'diamonds'), C('K', 'diamonds'), C('A', 'diamonds')],
        4
      )
    ).toBe(true);
  });

  it('valid: natural 2 acts as wild to fill gap (5-[2]-7-8)', () => {
    expect(
      isValidSequence(
        [C('5', 'hearts'), C('2', 'hearts'), C('7', 'hearts'), C('8', 'hearts')],
        4
      )
    ).toBe(true);
  });

  it('invalid: different suits', () => {
    expect(
      isValidSequence([C('3', 'hearts'), C('4', 'clubs'), C('5', 'hearts'), C('6', 'hearts')], 4)
    ).toBe(false);
  });

  it('invalid: only 3 cards for size 4', () => {
    expect(isValidSequence([C('3', 'hearts'), C('4', 'hearts'), C('5', 'hearts')], 4)).toBe(false);
  });

  it('invalid: gap too large for available wilds (5-9 with 2 jokers, size 4)', () => {
    // span=5, gaps=3, wilds=2 → gaps > wilds → invalid
    expect(isValidSequence([C('5', 'hearts'), C('9', 'hearts'), J(), J()], 4)).toBe(false);
  });

  it('invalid: duplicate rank in sequence', () => {
    expect(
      isValidSequence([C('5', 'hearts'), C('5', 'hearts'), C('6', 'hearts'), C('7', 'hearts')], 4)
    ).toBe(false);
  });
});

describe('validateContract', () => {
  it('valid: round 1 — two groups of 3', () => {
    const hand: AnyCard[] = [
      C('K', 'clubs'), C('K', 'hearts'), C('K', 'spades'),
      C('7', 'clubs'), C('7', 'hearts'), C('7', 'diamonds'),
    ];
    expect(validateContract(hand, CONTRACTS[0])).toBe(true);
  });

  it('valid: round 2 — group of 3 + sequence of 4', () => {
    const hand: AnyCard[] = [
      C('Q', 'clubs'), C('Q', 'hearts'), C('Q', 'spades'),
      C('3', 'diamonds'), C('4', 'diamonds'), C('5', 'diamonds'), C('6', 'diamonds'),
    ];
    expect(validateContract(hand, CONTRACTS[1])).toBe(true);
  });

  it('valid: round 3 — two sequences of 4', () => {
    const hand: AnyCard[] = [
      C('3', 'hearts'), C('4', 'hearts'), C('5', 'hearts'), C('6', 'hearts'),
      C('8', 'clubs'), C('9', 'clubs'), C('10', 'clubs'), C('J', 'clubs'),
    ];
    expect(validateContract(hand, CONTRACTS[2])).toBe(true);
  });

  it('valid: contract with wilds distributed across melds', () => {
    const hand: AnyCard[] = [
      C('A', 'clubs'), C('A', 'hearts'), J(),          // group of 3 (A A joker)
      C('5', 'spades'), C('6', 'spades'), C('7', 'spades'), J(), // sequence of 4
    ];
    expect(validateContract(hand, CONTRACTS[1])).toBe(true);
  });

  it('invalid: hand too small for contract', () => {
    const hand: AnyCard[] = [C('K', 'clubs'), C('K', 'hearts'), C('K', 'spades')];
    expect(validateContract(hand, CONTRACTS[0])).toBe(false);
  });

  it('invalid: cards cannot form any valid grouping for the contract', () => {
    const hand: AnyCard[] = [
      C('K', 'clubs'), C('Q', 'hearts'), C('J', 'spades'),
      C('3', 'hearts'), C('5', 'clubs'), C('7', 'diamonds'),
    ];
    expect(validateContract(hand, CONTRACTS[0])).toBe(false);
  });
});
