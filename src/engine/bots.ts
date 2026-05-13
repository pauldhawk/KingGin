import type { AnyCard, Hand } from './types';

export interface BotStrategy {
  draw(hand: Hand, topDiscard: AnyCard): 'stock' | 'discard';
  discard(hand: Hand): AnyCard;
}
