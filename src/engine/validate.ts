import type { AnyCard, Hand, Suit, Rank } from './types';
import type { ContractSpec, ContractMeld } from './contracts';

export function isWild(card: AnyCard): boolean {
  return card.suit === 'joker' || card.rank === '2';
}

function isJoker(card: AnyCard): boolean {
  return card.suit === 'joker';
}

// Rank → normal position in sequence. A has two: {1, 14}.
// Natural 2s can also occupy wrap positions: {2, 15}.
// 3→{3,16}, 4→{4,17}, 5→{5,18} cover the deepest corner-wrap hands.
const RANK_POSITIONS: Record<Rank, number[]> = {
  A: [1, 14],
  '2': [2, 15],
  '3': [3, 16],
  '4': [4, 17],
  '5': [5, 18],
  '6': [6],
  '7': [7],
  '8': [8],
  '9': [9],
  '10': [10],
  J: [11],
  Q: [12],
  K: [13],
};

// Check whether sorted natural positions + W wilds can form a sequence of `size`.
function fitsSequence(sorted: number[], wilds: number, size: number): boolean {
  if (sorted.length === 0) return wilds >= size;

  // Duplicates are invalid in a sequence
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) return false;
  }

  const span = sorted[sorted.length - 1] - sorted[0] + 1;
  const gapsInside = span - sorted.length;

  return gapsInside <= wilds && span <= size && span + wilds >= size;
}

// Try all combinations of position values for each natural card.
// Returns true if any combo produces a fitsSequence result.
function tryPositions(naturals: { rank: Rank }[], wilds: number, size: number): boolean {
  const positionSets = naturals.map((c) => RANK_POSITIONS[c.rank]);
  const count = naturals.length;

  function recurse(idx: number, chosen: number[]): boolean {
    if (idx === count) {
      return fitsSequence([...chosen].sort((a, b) => a - b), wilds, size);
    }
    for (const pos of positionSets[idx]) {
      if (recurse(idx + 1, [...chosen, pos])) return true;
    }
    return false;
  }

  return recurse(0, []);
}

export function isValidGroup(cards: AnyCard[], size: number): boolean {
  if (cards.length !== size) return false;

  const naturals = cards.filter((c) => !isWild(c)) as { suit: Suit; rank: Rank }[];

  if (naturals.length === 0) return true; // all wilds → valid

  const rank = naturals[0].rank;
  return naturals.every((c) => c.rank === rank);
}

export function isValidSequence(cards: AnyCard[], size: number): boolean {
  if (cards.length !== size) return false;

  const jokers = cards.filter(isJoker);
  const twos = cards.filter((c) => !isJoker(c) && c.rank === '2') as {
    suit: Suit;
    rank: '2';
  }[];
  const others = cards.filter((c) => !isJoker(c) && c.rank !== '2') as {
    suit: Suit;
    rank: Rank;
  }[];

  // All non-wild, non-2 cards must be same suit
  if (others.length > 1) {
    const suit = others[0].suit;
    if (!others.every((c) => c.suit === suit)) return false;
  }

  const sequenceSuit: Suit | null = others.length > 0 ? others[0].suit : null;

  // Try each subset of twos as "natural" (rest are wild)
  const twoCount = twos.length;
  for (let mask = 0; mask < 1 << twoCount; mask++) {
    const naturalTwos: typeof twos = [];
    let wildTwoCount = 0;

    for (let i = 0; i < twoCount; i++) {
      if (mask & (1 << i)) {
        naturalTwos.push(twos[i]);
      } else {
        wildTwoCount++;
      }
    }

    // Natural twos must share the sequence suit
    if (naturalTwos.length > 0) {
      const twoSuit = naturalTwos[0].suit;
      if (!naturalTwos.every((c) => c.suit === twoSuit)) continue;
      if (sequenceSuit !== null && twoSuit !== sequenceSuit) continue;
      // All natural twos must be same suit as each other
      if (naturalTwos.length > 1 && !naturalTwos.every((c) => c.suit === twoSuit)) continue;
    }

    const allNaturals: { rank: Rank }[] = [
      ...others,
      ...naturalTwos.map((c) => ({ rank: c.rank as Rank })),
    ];
    const totalWilds = jokers.length + wildTwoCount;

    if (allNaturals.length === 0) {
      if (totalWilds >= size) return true;
      continue;
    }

    if (tryPositions(allNaturals, totalWilds, size)) return true;
  }

  return false;
}

function isValidMeld(cards: AnyCard[], meld: ContractMeld): boolean {
  if (meld.type === 'group') return isValidGroup(cards, meld.size);
  return isValidSequence(cards, meld.size);
}

// Backtracking: try to assign cards to melds, returns true if any valid assignment exists.
function assignToMelds(
  hand: AnyCard[],
  melds: ContractMeld[],
  meldIdx: number
): boolean {
  if (meldIdx === melds.length) return true;

  const meld = melds[meldIdx];
  const n = hand.length;
  const k = meld.size;

  if (n < k) return false;

  // Generate all k-combinations of hand indices
  const indices = Array.from({ length: k }, (_, i) => i);

  function nextCombination(): boolean {
    // Check current combination
    const subset = indices.map((i) => hand[i]);
    if (isValidMeld(subset, meld)) {
      const remaining = hand.filter((_, i) => !indices.includes(i));
      if (assignToMelds(remaining, melds, meldIdx + 1)) return true;
    }

    // Advance to next combination
    let i = k - 1;
    while (i >= 0 && indices[i] === n - k + i) i--;
    if (i < 0) return false;

    indices[i]++;
    for (let j = i + 1; j < k; j++) indices[j] = indices[j - 1] + 1;

    return nextCombination();
  }

  return nextCombination();
}

export function validateContract(hand: Hand, contract: ContractSpec): boolean {
  // Sort melds largest-first to prune the search space early
  const sorted = [...contract].sort((a, b) => b.size - a.size);
  return assignToMelds(hand, sorted, 0);
}
