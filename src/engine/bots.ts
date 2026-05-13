import type { AnyCard, Hand } from './types';
import type { ContractSpec } from './contracts';
import { cardPoints, scoreHand } from './score';

export interface BotStrategy {
  draw(hand: Hand, topDiscard: AnyCard, contract: ContractSpec): 'stock' | 'discard';
  discard(hand: Hand, contract: ContractSpec): AnyCard;
}

export class GreedyBot implements BotStrategy {
  // Take the discard if adding it reduces the hand's score more than not having it.
  draw(hand: Hand, topDiscard: AnyCard, contract: ContractSpec): 'stock' | 'discard' {
    const scoreWithout = scoreHand(hand, contract);
    const scoreWith = scoreHand([...hand, topDiscard], contract);
    return scoreWith < scoreWithout ? 'discard' : 'stock';
  }

  // Discard the card whose removal most reduces (or least increases) the hand score.
  discard(hand: Hand, contract: ContractSpec): AnyCard {
    let bestCard = hand[0];
    let bestScore = Infinity;

    for (const card of hand) {
      const remaining = hand.filter((c) => c !== card);
      const score = scoreHand(remaining, contract) + cardPoints(card);
      if (score < bestScore) {
        bestScore = score;
        bestCard = card;
      }
    }

    return bestCard;
  }
}
