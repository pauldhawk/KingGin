import type { AnyCard, Hand } from './types';
import type { ContractSpec, ContractMeld } from './contracts';
import { isValidGroup, isValidSequence } from './validate';

export function cardPoints(card: AnyCard): number {
  if (card.suit === 'joker') return 20;
  switch (card.rank) {
    case '2':
      return 20;
    case 'A':
      return 15;
    case '10':
    case 'J':
    case 'Q':
    case 'K':
      return 10;
    default:
      return 5; // 3–9
  }
}

function isValidMeld(cards: AnyCard[], meld: ContractMeld): boolean {
  if (meld.type === 'group') return isValidGroup(cards, meld.size);
  return isValidSequence(cards, meld.size);
}

// Find the assignment of cards to contract melds that minimises the score of
// uncovered cards. Only completely satisfied melds (exact size) are covered.
// Backtracking over all k-subsets of the remaining hand for each meld.
export function scoreHand(hand: Hand, contract: ContractSpec): number {
  if (hand.length === 0) return 0;

  const totalPoints = hand.reduce((s, c) => s + cardPoints(c), 0);
  let bestCoveredPoints = 0;

  const melds = [...contract].sort((a, b) => b.size - a.size);

  function search(meldIdx: number, remaining: AnyCard[], coveredPoints: number): void {
    if (coveredPoints > bestCoveredPoints) bestCoveredPoints = coveredPoints;
    if (meldIdx >= melds.length || remaining.length === 0) return;

    const meld = melds[meldIdx];
    const k = meld.size;
    const n = remaining.length;

    if (n >= k) {
      // Try every exact-size subset
      const indices = Array.from({ length: k }, (_, i) => i);

      const tryNext = (): void => {
        const subset = indices.map((i) => remaining[i]);
        if (isValidMeld(subset, meld)) {
          const subPts = subset.reduce((s, c) => s + cardPoints(c), 0);
          const next = remaining.filter((_, i) => !indices.includes(i));
          search(meldIdx + 1, next, coveredPoints + subPts);
        }

        // Advance combination
        let i = k - 1;
        while (i >= 0 && indices[i] === n - k + i) i--;
        if (i < 0) return;
        indices[i]++;
        for (let j = i + 1; j < k; j++) indices[j] = indices[j - 1] + 1;
        tryNext();
      };

      tryNext();
    }

    // Also skip this meld (no coverage from it)
    search(meldIdx + 1, remaining, coveredPoints);
  }

  search(0, hand, 0);
  return totalPoints - bestCoveredPoints;
}

export function roundScores(
  hands: Hand[],
  contract: ContractSpec,
  goingOutPlayerIndex: number
): number[] {
  return hands.map((hand, i) =>
    i === goingOutPlayerIndex ? 0 : scoreHand(hand, contract)
  );
}
