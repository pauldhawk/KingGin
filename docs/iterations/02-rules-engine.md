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

- [x] Replace stubs with full types (Suit, Rank, Card, Joker, AnyCard, Hand, ContractMeld, ContractSpec, Player, RoundState, GameState)

### 2. Implement `src/engine/deck.ts`

- [x] `buildDeck()` — 2 standard decks + 4 jokers = 108 cards
- [x] `shuffle(deck, seed)` — Fisher-Yates with seedrandom, non-mutating
- [x] `deal(deck, playerCount, cardsPerPlayer)` — round-robin, returns hands + remaining

### 3. Implement `src/engine/contracts.ts`

- [x] `CONTRACTS` — 7 entries, one per round
- [x] `contractSize(contract)` — sum of meld sizes

### 4. Implement `src/engine/validate.ts`

- [x] `isWild(card)` — true for jokers and 2s
- [x] `isValidGroup(cards, size)` — same rank + any wilds
- [x] `isValidSequence(cards, size)` — same suit, consecutive, corner-wrap, natural 2s optimal
- [x] `validateContract(hand, contract)` — backtracking partition check

### 5. Implement `src/engine/score.ts`

- [x] `cardPoints(card)` — per corrected scoring table
- [x] `scoreHand(hand, contract)` — minimise uncovered score; complete melds excluded
- [x] `roundScores(hands, contract, goingOutIdx)` — going-out player always 0

### 6. Implement `src/engine/bots.ts`

- [x] `BotStrategy` interface with `draw` and `discard` methods
- [x] `GreedyBot` class — draw if discard reduces score; discard highest-cost unhelpful card

### 7. Update `src/engine/index.ts`

- [x] All public functions and types exported

### 8. Write tests (`tests/engine/`)

- [x] `deck.test.ts` — 14 tests
- [x] `contracts.test.ts` — 16 tests
- [x] `validate.test.ts` — 37 tests
- [x] `score.test.ts` — 21 tests
- [x] `types.test.ts` — 3 tests (existing, kept)

**Total: 91 tests, all passing.**

### 9. Update `tests/engine/types.test.ts`

- [x] Kept existing smoke tests; isWild tests moved to validate.test.ts

---

## Completion Steps

- [x] Commit with message: `feat: iteration 2 — core rules engine`
- [ ] Push to `main`

---

## Acceptance Criteria

- [x] `npm run check` exits 0
- [x] `npm test` shows **91 tests**, all passing (target was 50+)
- [x] Test names read as a specification
- [x] `src/engine/` has zero React/DOM imports (ESLint enforced)
- [x] `buildDeck()` returns exactly 108 cards
- [x] `shuffle` with same seed is deterministic
- [x] `isValidSequence` handles all cases: normal, corner-wrap, natural 2 as wild/natural, joker fills gap
- [x] `validateContract` returns true for all 7 round contracts given valid hands

---

## Retrospective

- **91 tests vs 50+ target** — the sequence validator alone warranted 16 test cases once all edge cases (corner wrap, natural 2s, joker extension) were enumerated.
- **scoreHand partial coverage** — implemented as "only complete melds are excluded." The rule ("partial contracts count") is ambiguous; full partial-meld coverage caused single-card false exclusions. Stricter interpretation is correct for now and can be revisited in a later iteration.
- **Sequence position trick** — assigning A→{1,14} and natural-2→{2,15} (and 3→{3,16}, etc.) means corner-wrap validation falls out of the same arithmetic as normal sequences, no special casing needed.
- **ContractMeld export** — had to explicitly re-export `ContractMeld` from `contracts.ts`; importing modules shouldn't need to reach into `types.ts` directly.
