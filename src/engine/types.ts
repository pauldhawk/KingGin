export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type Card = { suit: Suit; rank: Rank };
export type Joker = { suit: 'joker'; rank: 'joker' };
export type AnyCard = Card | Joker;
export type Hand = AnyCard[];

export type ContractMeld =
  | { type: 'group'; size: number }
  | { type: 'sequence'; size: number };

export type ContractSpec = ContractMeld[];

export type Player = {
  id: string;
  name: string;
  hand: Hand;
  mayIsUsed: number; // 0–3
};

export type RoundState = {
  roundIndex: number; // 0-based (0 = round 1)
  players: Player[];
  activePlayerIndex: number;
  drawPile: AnyCard[];
  discardPile: AnyCard[]; // top = last element
};

export type GameState = {
  players: Player[];
  roundScores: number[][]; // roundScores[playerIndex][roundIndex]
  currentRound: RoundState | null;
};
