export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type Card = { suit: Suit; rank: Rank };
export type Joker = { suit: 'joker'; rank: 'joker' };
export type AnyCard = Card | Joker;
export type Hand = AnyCard[];

// Full definitions in Iteration 2
export type Contract = unknown;
export type Player = unknown;
export type GameState = unknown;
