# Iteration 2 — Core Rules Engine

> **Goal:** Every game rule encoded as pure TypeScript functions with 50+ passing unit tests. No UI. By the end of this iteration the test suite reads like a specification — someone new to the project can understand the entire ruleset by reading test names.
>
> **Completion promise:** `npm run check` passes and `npm test` shows 50+ tests all green.

---

## Context

Stack: TypeScript strict, Vitest, `seedrandom`. No React imports in `src/engine/`.

Key decisions from planning (see `docs/decisions.md`):
- Scoring: 3–9 = 5 pts; 10/J/Q/K = 10 pts; Aces = 15 pts; 2s = 20 pts; Jokers = 20 pts
- Going out: must have exactly `contractSize + 1` cards; lay contract, discard 1 face-down
- Draw pile exhaustion: reshuffle discard minus top card
- Natural 2s in sequences: engine resolves **optimally in player's favour** — natural if it fits, wild otherwise; no declaration mechanic
- Player count: engine parameterised for 3–6; MVP is 4

---

## Tasks

### 1. Flesh out `src/engine/types.ts`

Replace the stubs with full types needed for the engine:

```ts
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';
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
  mayIsUsed: number;   // 0–3
};

export type RoundState = {
  roundIndex: number;          // 0-based (0 = round 1)
  players: Player[];
  activePlayerIndex: number;
  drawPile: AnyCard[];
  discardPile: AnyCard[];      // top = last element
};

export type GameState = {
  players: Player[];
  roundScores: number[][];     // roundScores[playerIndex][roundIndex]
  currentRound: RoundState | null;
};
```

- [ ] Replace stubs in `src/engine/types.ts` with the above

### 2. Implement `src/engine/deck.ts`

- [ ] `buildDeck(): AnyCard[]`
  - 2 standard decks (4 suits × 13 ranks × 2 = 104 cards)
  - 4 jokers (2 per deck)
  - Total: 108 cards
- [ ] `shuffle(deck: AnyCard[], seed: string): AnyCard[]`
  - Fisher-Yates using `seedrandom(seed)` for the RNG
  - Returns a new array (does not mutate)
- [ ] `deal(deck: AnyCard[], playerCount: number, cardsPerPlayer: number): { hands: AnyCard[][]; remaining: AnyCard[] }`
  - Deals round-robin (card 1 to player 0, card 1 to player 1, … then card 2 to player 0, …)
  - Returns dealt hands + remaining stock pile

### 3. Implement `src/engine/contracts.ts`

- [ ] Define `ContractMeld` and `ContractSpec` types (already in types.ts — re-export or keep local)
- [ ] `CONTRACTS: ContractSpec[]` — array of 7 entries, one per round:
  | Round | Contract |
  |---|---|
  | 1 | Two Groups of 3 |
  | 2 | One Group of 3 + One Sequence of 4 |
  | 3 | Two Sequences of 4 |
  | 4 | Three Groups of 3 |
  | 5 | Two Groups of 3 + One Sequence of 4 |
  | 6 | One Group of 3 + Two Sequences of 4 |
  | 7 | Three Sequences of 4 |
- [ ] `contractSize(contract: ContractSpec): number` — sum of all meld sizes

### 4. Implement `src/engine/validate.ts`

This is the most complex module. Implement these functions:

#### 4a. Helper: `isWild(card: AnyCard): boolean`
- Returns true for jokers and 2s

#### 4b. `isValidGroup(cards: AnyCard[], size: number): boolean`
- `cards.length` must equal `size`
- All non-wild cards must share the same rank
- Any number of wilds allowed
- A group of all wilds is valid

#### 4c. `isValidSequence(cards: AnyCard[], size: number): boolean`
- `cards.length` must equal `size`
- All non-wild, non-2 cards must be the same suit
- Natural 2s: treat **optimally** — try all 2^(count of 2s) assignments of each 2 as "natural rank 2" vs "wild"; pick whichever assignment makes the sequence valid
- Jokers are always wild
- Rank ordering for sequences:
  ```
  A(1) – 2 – 3 – 4 – 5 – 6 – 7 – 8 – 9 – 10 – J(11) – Q(12) – K(13) – A(14)
  ```
  Extend for corner-wrap: after A(14) comes 2(15), 3(16), 4(17), 5(18)
  This means Q-K-A-2, K-A-2-3, A-2-3-4 are all valid sequences.
- For each assignment of 2s (natural vs wild):
  - Natural 2s must match the sequence suit
  - Assign each natural card one value from its position set:
    - A: {1, 14}; natural 2: {2, 15}; natural 3: {3, 16}; natural 4: {4, 17}; natural 5: {5, 18}; all other naturals: single value
  - Try all combinations of position values for naturals
  - For a given set of sorted natural positions `[v₀, v₁, …]` with `W` wilds:
    - No duplicate positions → invalid
    - gaps_inside = (vₙ - v₀ + 1) - count_of_naturals (holes between naturals)
    - valid if: `gaps_inside ≤ W` AND `(vₙ - v₀ + 1) + (W - gaps_inside) ≥ size` AND `vₙ - v₀ + 1 ≤ size`
    - Simplifies to: `gaps_inside ≤ W` AND `vₙ - v₀ + 1 ≤ size` AND `vₙ - v₀ + 1 + W ≥ size`

#### 4d. `validateContract(hand: Hand, contract: ContractSpec): boolean`
- The hand must have cards assignable to melds such that every meld in the contract is satisfied
- This is a partition problem: find an assignment of cards to melds where each meld validates
- Algorithm: try all permutations of the melds against partitions of the hand
- Practical approach (sufficient for 11–12 card hands):
  1. Sort melds largest-first (reduces search space)
  2. Recursively assign cards to each meld using backtracking
  3. Return true if a valid assignment is found
- Note: the hand may have more cards than `contractSize(contract)` (e.g., after a May I)

#### 4e. `scoreHand(hand: Hand, contract: ContractSpec): number`
- Find the assignment of cards to contract melds that **minimises** the score of unassigned cards
- "Partial contracts count": a meld slot can be partially filled — cards that contribute to a partial meld are excluded from scoring
- Practical approach: use backtracking to try assigning subsets of `hand` to each meld, tracking which cards are "covered". Maximise covered cards (or equivalently minimise score of uncovered cards).
- Score uncovered cards using:
  ```
  3–9  → 5 pts
  10/J/Q/K → 10 pts
  A    → 15 pts
  2    → 20 pts
  Joker → 20 pts
  ```
- The going-out player always scores 0 (they have no remaining cards)

### 5. Implement `src/engine/score.ts`

- [ ] `cardPoints(card: AnyCard): number` — single-card point value (use table above)
- [ ] `scoreHand(hand: Hand, contract: ContractSpec): number` — move the full implementation here (or keep in validate.ts and call it from score.ts)
- [ ] `roundScores(hands: Hand[], contract: ContractSpec, goingOutPlayerIndex: number): number[]` — returns score for each player; going-out player always 0

### 6. Implement `src/engine/bots.ts`

- [ ] `BotStrategy` interface:
  ```ts
  export interface BotStrategy {
    draw(hand: Hand, topDiscard: AnyCard, contract: ContractSpec): 'stock' | 'discard';
    discard(hand: Hand, contract: ContractSpec): AnyCard;
  }
  ```
- [ ] `GreedyBot` class implementing `BotStrategy`:
  - `draw`: take the discard if it contributes to the contract (reduces wild count needed), otherwise draw from stock
  - `discard`: discard the card with highest point value that is least useful to the contract

### 7. Update `src/engine/index.ts`

- [ ] Ensure all public functions and types are exported

### 8. Write tests (`tests/engine/`)

Target: **50+ passing tests**. One file per module.

#### `tests/engine/deck.test.ts`
- `buildDeck` returns exactly 108 cards
- `buildDeck` has exactly 4 jokers
- `buildDeck` has exactly 2 of each non-joker card (52 unique × 2)
- `shuffle` returns same-length array
- `shuffle` with same seed produces identical order (deterministic)
- `shuffle` with different seeds produces different orders
- `shuffle` does not mutate the input array
- `deal` returns correct number of hands
- `deal` gives each player exactly `cardsPerPlayer` cards
- `deal` remaining pile has correct size
- `deal` round-robin: first card to player 0, second to player 1, etc.

#### `tests/engine/contracts.test.ts`
- `CONTRACTS` has exactly 7 entries
- Round 1: 2 groups of 3
- Round 2: 1 group of 3 + 1 sequence of 4
- Round 3: 2 sequences of 4
- Round 4: 3 groups of 3
- Round 5: 2 groups of 3 + 1 sequence of 4
- Round 6: 1 group of 3 + 2 sequences of 4
- Round 7: 3 sequences of 4
- `contractSize` is correct for each round
- Round 7 contract size is 12 (requires May I to complete)
- Contract sizes are non-decreasing round over round

#### `tests/engine/validate.test.ts` — groups
- Valid: 3 same rank, no wilds
- Valid: 4 same rank, no wilds
- Valid: 3 same rank + 1 joker
- Valid: 1 natural + 2 jokers
- Valid: all jokers (size 3)
- Valid: 2 naturals same rank + 1 wildcard 2
- Invalid: 2 cards only (too small)
- Invalid: 3 cards, 2 different ranks, 0 wilds
- Invalid: 4 cards, 2 different ranks, 1 wild (not enough wilds)

#### `tests/engine/validate.test.ts` — sequences
- Valid: 4 consecutive same suit, no wilds (3♥ 4♥ 5♥ 6♥)
- Valid: 5 consecutive same suit, no wilds
- Valid: joker fills a gap (3♥ [joker] 5♥ 6♥)
- Valid: joker extends at start ([joker] 4♥ 5♥ 6♥)
- Valid: joker extends at end (4♥ 5♥ 6♥ [joker])
- Valid: 2 jokers fill 2 separate gaps
- Valid: corner wrap Q-K-A-2 (natural 2 at wrap position)
- Valid: corner wrap K-A-2-3
- Valid: corner wrap A-2-3-4 (A low, 2 natural)
- Valid: ace high J-Q-K-A
- Valid: ace low A-2-3-4 (2 natural)
- Valid: natural 2♥ fills gap in 3♥-[2♥]-5♥-6♥ (treated as wild for rank 4)
- Invalid: different suits
- Invalid: only 3 cards
- Invalid: gap too large for available wilds (5♥ 9♥ with 2 jokers, need size 4 — gap=3, wilds=2)
- Invalid: duplicate rank in sequence (5♥ 5♥ 6♥ 7♥)

#### `tests/engine/validate.test.ts` — full contract validation
- Valid: round 1 contract (2 groups of 3, 6-card hand subset)
- Valid: round 2 contract (group + sequence)
- Valid: round 3 contract (2 sequences)
- Valid: contract with wilds shared across melds
- Invalid: missing one meld
- Invalid: one meld too small
- Invalid: hand cards can't form any valid grouping

#### `tests/engine/score.test.ts`
- `cardPoints`: 3 → 5, 7 → 5, 9 → 5
- `cardPoints`: 10 → 10, J → 10, Q → 10, K → 10
- `cardPoints`: A → 15
- `cardPoints`: 2 → 20
- `cardPoints`: Joker → 20
- Going-out player scores 0
- Full hand of 5-point cards scores correctly
- Mixed hand scores correctly
- Partial contract: cards forming a completed meld are excluded from score
- Partial contract: cards forming a partial meld (e.g. 2 of 3 needed) are excluded
- `roundScores` returns one score per player; going-out player = 0

### 9. Update `tests/engine/types.test.ts`

- [ ] Add tests for `isWild` (joker → true, 2 → true, K → false)
- [ ] Keep existing smoke tests

---

## Implementation Notes

### Sequence validation algorithm (summary)

```
function isValidSequence(cards, size):
  jokers = cards where card is Joker
  twos   = cards where card.rank === '2' (and not joker)
  others = remaining natural cards

  if others have multiple suits → false

  for each subset of twos treated as "natural" (2^twos.length tries):
    natural_twos = this subset (must match suit of others, if any)
    wild_count   = jokers.length + (twos.length - natural_twos.length)
    all_naturals = others + natural_twos

    if no naturals:
      return wild_count >= size  // all wilds → always valid if enough

    if all_naturals not same suit → skip

    for each assignment of positions to naturals (A→{1,14}, natural2→{2,15}, …):
      positions = sorted unique values
      if any duplicate → skip
      span = max - min + 1
      gaps = span - positions.length
      if gaps ≤ wild_count AND span ≤ size AND span + wild_count ≥ size:
        return true

  return false
```

### Scoring algorithm (summary)

```
function scoreHand(hand, contract):
  best_score = sum of cardPoints for all cards in hand  // worst case: nothing covered
  
  try_assign(meld_index, remaining_hand, covered):
    if meld_index === contract.length:
      score = sum(cardPoints(c) for c in hand if not in covered)
      best_score = min(best_score, score)
      return
    
    meld = contract[meld_index]
    for each subset of remaining_hand of size >= meld.size:
      // try both exact-size and larger subsets (extra cards go in covered)
      for each subset S of size meld.size from remaining_hand:
        if isValidMeld(S, meld):
          try_assign(meld_index + 1, remaining_hand - S, covered + S)
  
  try_assign(0, hand, [])
  return best_score
```

For practical performance (≤12 cards): prune heavily — only try subsets that pass basic rank/suit filters before full validation.

---

## Completion Steps

After all tasks are checked off and acceptance criteria pass:

- [ ] Commit with message: `feat: iteration 2 — core rules engine`
- [ ] Push to `main`

---

## Acceptance Criteria

- [ ] `npm run check` exits 0
- [ ] `npm test` shows **50+ tests**, all passing
- [ ] Test names read as a specification (describe/it blocks match the rule being tested)
- [ ] `src/engine/` has zero imports from `react`, `react-dom`, or DOM APIs (ESLint enforced)
- [ ] `buildDeck()` returns exactly 108 cards
- [ ] `shuffle` with same seed is deterministic
- [ ] `isValidSequence` correctly handles: normal sequence, corner-wrap, natural 2 as wild, natural 2 as natural rank, joker fills gap
- [ ] `validateContract` returns true for all 7 round contracts when given a valid hand

---

## Retrospective

*(Fill in after iteration completes.)*

- What surprised us?
- What should we remember next time?
