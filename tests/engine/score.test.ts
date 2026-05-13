import { describe, it, expect } from 'vitest';
import { cardPoints, scoreHand, roundScores } from '../../src/engine/score';
import { CONTRACTS } from '../../src/engine/contracts';
import type { AnyCard } from '../../src/engine/types';

const C = (rank: string, suit: string): AnyCard => ({ rank, suit } as AnyCard);
const J = (): AnyCard => ({ suit: 'joker', rank: 'joker' });

describe('cardPoints', () => {
  it('3 → 5 pts', () => expect(cardPoints(C('3', 'clubs'))).toBe(5));
  it('6 → 5 pts', () => expect(cardPoints(C('6', 'hearts'))).toBe(5));
  it('7 → 5 pts', () => expect(cardPoints(C('7', 'clubs'))).toBe(5));
  it('9 → 5 pts', () => expect(cardPoints(C('9', 'spades'))).toBe(5));
  it('10 → 10 pts', () => expect(cardPoints(C('10', 'clubs'))).toBe(10));
  it('J → 10 pts', () => expect(cardPoints(C('J', 'hearts'))).toBe(10));
  it('Q → 10 pts', () => expect(cardPoints(C('Q', 'diamonds'))).toBe(10));
  it('K → 10 pts', () => expect(cardPoints(C('K', 'spades'))).toBe(10));
  it('A → 15 pts', () => expect(cardPoints(C('A', 'clubs'))).toBe(15));
  it('2 → 20 pts', () => expect(cardPoints(C('2', 'hearts'))).toBe(20));
  it('Joker → 20 pts', () => expect(cardPoints(J())).toBe(20));
});

describe('scoreHand', () => {
  it('empty hand scores 0', () => {
    expect(scoreHand([], CONTRACTS[0])).toBe(0);
  });

  it('hand that fully satisfies round 1 contract scores 0', () => {
    const hand: AnyCard[] = [
      C('K', 'clubs'), C('K', 'hearts'), C('K', 'spades'),
      C('7', 'clubs'), C('7', 'hearts'), C('7', 'diamonds'),
    ];
    expect(scoreHand(hand, CONTRACTS[0])).toBe(0);
  });

  it('hand with no contract cards scores full point total', () => {
    // Hand: K K K 7 7 7 — satisfies contract[0], so score = 0
    // Hand with completely unrelated cards:
    const hand: AnyCard[] = [
      C('3', 'clubs'), C('5', 'hearts'), C('Q', 'spades'),
    ];
    // Round 1 needs 6 cards, hand has 3 — nothing can be covered
    const score = scoreHand(hand, CONTRACTS[0]);
    expect(score).toBe(5 + 5 + 10); // 20
  });

  it('partial contract: completed meld cards are excluded from score', () => {
    // Round 1: 2 groups of 3
    // Hand has one complete group (K K K) + 3 unrelated cards
    const hand: AnyCard[] = [
      C('K', 'clubs'), C('K', 'hearts'), C('K', 'spades'), // group (30 pts if scored)
      C('3', 'clubs'), C('5', 'hearts'), C('8', 'diamonds'), // unrelated (15 pts)
    ];
    // The 3 Kings cover one group meld — they are excluded from score
    // Remaining: 3+5+8 = 15 pts
    const score = scoreHand(hand, CONTRACTS[0]);
    expect(score).toBe(15);
  });

  it('A scores 15 when left in hand', () => {
    const hand: AnyCard[] = [C('A', 'clubs')];
    expect(scoreHand(hand, CONTRACTS[0])).toBe(15);
  });

  it('Joker scores 20 when left in hand', () => {
    const hand: AnyCard[] = [J()];
    expect(scoreHand(hand, CONTRACTS[0])).toBe(20);
  });

  it('mixed hand scores correctly', () => {
    // Hand of unrelated cards vs round 1
    const hand: AnyCard[] = [C('3', 'clubs'), C('A', 'hearts'), J()];
    const score = scoreHand(hand, CONTRACTS[0]);
    expect(score).toBe(5 + 15 + 20); // 40
  });
});

describe('roundScores', () => {
  it('going-out player always scores 0', () => {
    const hands: AnyCard[][] = [
      [C('K', 'clubs'), C('K', 'hearts'), C('K', 'spades'),
       C('7', 'clubs'), C('7', 'hearts'), C('7', 'diamonds')],
      [C('A', 'clubs'), C('3', 'hearts')],
    ];
    const scores = roundScores(hands, CONTRACTS[0], 0);
    expect(scores[0]).toBe(0);
  });

  it('returns one score per player', () => {
    const hands: AnyCard[][] = [[], [], [], []];
    const scores = roundScores(hands, CONTRACTS[0], 0);
    expect(scores).toHaveLength(4);
  });

  it('non-going-out players are scored normally', () => {
    const hands: AnyCard[][] = [
      [], // going out — score 0
      [C('A', 'clubs'), C('K', 'hearts')], // 15 + 10 = 25
    ];
    const scores = roundScores(hands, CONTRACTS[0], 0);
    expect(scores[0]).toBe(0);
    expect(scores[1]).toBe(25);
  });
});
