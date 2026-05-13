# Iteration 3 — Single-Round Play Loop (Minimal UI)

> **Goal:** One human player vs. 3 bots can play a complete round end-to-end in the browser.
> Draw, discard, go-out logic all wired. No May I, no multi-round flow, no polish.
>
> **Completion promise:** `npm run check` passes, `npm run dev` allows a human to play Round 1
> to completion in the browser, seeing the round score at the end.

---

## Context

Stack: React 19, TypeScript strict, Tailwind v4, Vitest.

Going-out mechanic (key insight):
- Players always have 11 cards dealt. After drawing = 12 cards.
- To go out: discard 1 face-down → 11 cards remain → must satisfy contract with **flexible meld sizes** (each meld ≥ contract minimum, all 11 cards covered).
- `validateContractFlexible(hand, contract)`: backtracking partition where each meld type matches, size ≥ minimum, all cards used.
- `canGoOut(hand, contract)`: returns true if any single card removal yields a valid partition.
- Round 7 (3×4 = 12 minimum) is unachievable from 11 remaining — requires May I (Iteration 4).

UI is text-based cards: `K♥`, `J♠`, `2♦`, `Jo`. No fancy card art yet.

Bot automation: GreedyBot (from Iteration 2). Bots run automatically via `useEffect` on `activePlayerIndex` when the active player is not human.

---

## Tasks

### 1. Engine: `validateContractFlexible` + `canGoOut` in `src/engine/validate.ts`

- [x] `validateContractFlexible(hand: Hand, contract: ContractSpec): boolean`
  - Backtracking partition: assign ALL cards to exactly `contract.length` melds
  - Each meld `i`: type = `contract[i].type`, size ≥ `contract[i].size`
  - Sum of all meld sizes = `hand.length`
  - Strategy: enumerate all valid size tuples (distribute extra cards among melds), then for each tuple run subset-backtracking with exact sizes (reuse `isValidGroup`/`isValidSequence`)
- [x] `canGoOut(hand: Hand, contract: ContractSpec): boolean`
  - For each card in hand: if `validateContractFlexible(hand without card, contract)` → true
- [x] Export both from `src/engine/index.ts`

### 2. Tests for new engine functions (`tests/engine/validate.test.ts`)

- [x] `validateContractFlexible` — round 1 with 11 cards (2 groups, excess goes to bigger group)
- [x] `validateContractFlexible` — round 6 with 11 cards (exact fit: 1×3 + 2×4)
- [x] `validateContractFlexible` — false when cards can't satisfy contract
- [x] `canGoOut` — true when one removable card exists
- [x] `canGoOut` — false when no discard yields valid contract

### 3. State types in `src/state/types.ts` (new file)

- [x] `Phase = 'idle' | 'waiting-draw' | 'waiting-discard' | 'round-over'`
- [x] `AppState`:
  ```
  {
    phase: Phase
    roundIndex: number          // 0-6 (Iteration 3 always stays at 0)
    players: Player[]           // from engine types
    activePlayerIndex: number
    humanPlayerIndex: number    // always 0
    drawPile: AnyCard[]
    discardPile: AnyCard[]
    goingOutPlayerIndex: number | null
    finalScores: number[] | null
  }
  ```
- [x] `AppAction` union:
  - `{ type: 'START_GAME'; seed?: string }`
  - `{ type: 'DRAW_STOCK' }`
  - `{ type: 'DRAW_DISCARD' }`
  - `{ type: 'DISCARD'; card: AnyCard }`
  - `{ type: 'GO_OUT'; discardCard: AnyCard }`
  - `{ type: 'BOT_TURN' }` — triggers one step of the bot's turn

### 4. Reducer in `src/state/gameReducer.ts`

- [x] `initialState: AppState` (phase = 'idle')
- [x] `gameReducer(state: AppState, action: AppAction): AppState` — handles:
  - `START_GAME`: deal 11 cards to 4 players (seed → shuffle), phase → `'waiting-draw'`
  - `DRAW_STOCK`: pop top of drawPile into activePlayer's hand; if drawPile empty, reshuffle discardPile (keep top); phase → `'waiting-discard'`
  - `DRAW_DISCARD`: pop top of discardPile into activePlayer's hand; phase → `'waiting-discard'`
  - `DISCARD`: remove card from activePlayer's hand, push to discardPile; advance activePlayerIndex; phase → `'waiting-draw'` (or `'round-over'` if... no — only GO_OUT ends the round)
  - `GO_OUT`: remove discardCard from activePlayer's hand; push discardCard to discardPile (face-down — just add to pile normally); compute `roundScores` for all players; set `goingOutPlayerIndex` and `finalScores`; phase → `'round-over'`
  - `BOT_TURN`: call `GreedyBot.draw`/`GreedyBot.discard`; if `canGoOut(hand, contract)` after draw and bot would benefit, go out; otherwise discard
- [x] Update `src/state/actions.ts` to re-export from new files (keep compatibility)
- [x] Keep the old `gameReducer` stub in `src/state/gameState.ts` replaced with real import

### 5. React context in `src/state/GameContext.tsx` (new file)

- [x] `GameContext` = `React.createContext<{ state: AppState; dispatch: Dispatch<AppAction> }>`
- [x] `GameProvider` component wrapping `useReducer(gameReducer, initialState)`
- [x] `useGame()` hook shortcut
- [x] Bot automation: `useEffect` on `[state.activePlayerIndex, state.phase]` — if `phase === 'waiting-draw'` and active player is not human, dispatch `BOT_TURN` after a 600ms delay (enough to see cards animate later; prevents instant resolution)

### 6. UI components in `src/ui/`

- [x] `src/ui/Card.tsx` — renders one `AnyCard`:
  - Suit symbols: `♣ ♦ ♥ ♠`; Joker renders as `Jo`
  - Red for hearts/diamonds, black for clubs/spades, purple for jokers
  - Props: `card: AnyCard`, `onClick?: () => void`, `selected?: boolean`, `faceDown?: boolean`
  - Face-down: shows card back (solid dark color, no rank/suit)
- [x] `src/ui/Hand.tsx` — renders human player's hand as a row of `<Card>` components
  - `selectedCard` state; clicking a card toggles selection
  - Shows "Discard" button when a card is selected and phase = `'waiting-discard'`
  - Shows "Go Out" button when `canGoOut(hand, contract)` is true and phase = `'waiting-discard'`
  - Discard button dispatches `DISCARD`, Go Out dispatches `GO_OUT`
- [x] `src/ui/DrawPile.tsx` — shows count of remaining cards + "Draw" button
  - Active only when phase = `'waiting-draw'` and active player is human
  - Dispatches `DRAW_STOCK`
- [x] `src/ui/DiscardPile.tsx` — shows top card of discard pile (face-up)
  - "Take Discard" button active when phase = `'waiting-draw'` and active player is human
  - Dispatches `DRAW_DISCARD`
- [x] `src/ui/BotHand.tsx` — renders a bot player's hand as N face-down cards + player name
- [x] `src/ui/RoundResult.tsx` — shown when phase = `'round-over'`:
  - Each player's name, score for the round
  - "New Round" button (Iteration 4 — for now just shows scores)
- [x] `src/ui/GameTable.tsx` — main layout:
  - Top area: 3 bot hands (face down)
  - Middle: DrawPile + DiscardPile side by side + active player indicator
  - Bottom: human Hand
  - Conditional overlay: `RoundResult` when round-over
- [x] `src/ui/StartScreen.tsx` — shown when phase = `'idle'`:
  - "Start Round 1" button dispatching `START_GAME`

### 7. Update `src/App.tsx`

- [x] Wrap everything in `<GameProvider>`
- [x] Render `<StartScreen>` when `phase === 'idle'`, else `<GameTable>`
- [x] Remove the placeholder content

### 8. Tests for state (`tests/state/gameReducer.test.ts`)

- [x] `START_GAME` deals 4 × 11 cards, leaves 108 − 44 − 1 = 63 cards in drawPile
- [x] `DRAW_STOCK` removes top card from drawPile, adds to activePlayer's hand
- [x] `DRAW_DISCARD` removes top of discardPile, adds to activePlayer's hand
- [x] `DISCARD` removes card from hand, adds to discardPile, advances activePlayerIndex
- [x] `GO_OUT` sets phase to `'round-over'`, goingOutPlayer scores 0, others scored
- [x] Draw pile exhaustion: when drawPile empty, reshuffled discardPile (minus top) becomes new drawPile

---

## Completion Steps

- [x] `npm run check` exits 0 (typecheck + lint + tests)
- [x] `npm run dev` → play Round 1 in browser → see round-over screen with scores
- [ ] Commit: `feat: iteration 3 — single-round play loop`
- [ ] Push to `main`

---

## Acceptance Criteria

- [x] `npm run check` exits 0
- [x] Human can draw from stock or discard
- [x] Human can discard a card to end their turn
- [x] Human sees "Go Out" button when their hand satisfies `canGoOut`
- [x] Bots take turns automatically with a visible delay
- [x] Round ends when any player (human or bot) goes out
- [x] Round-over screen shows each player's name and round score
- [x] Going-out player scores 0
- [x] No May I, no multi-round scoring, no polish needed

---

## Retrospective

- **`validateContractFlexible` key insight** — the "all cards covered" requirement comes from the rule "every card remaining in your hand forms part of your complete contract." Combined with the fact that after drawing you have 12 cards and discard 1, exactly 11 remain. Rounds 1–6 work without May I; round 7 requires it (12-card minimum > 11 available).
- **BOT_TURN handles full turn atomically** — combining draw+discard in one reducer action avoids intermediate phase states that would require more complex bot state machine. The 600ms useEffect delay is purely visual.
- **Object identity for card selection** — `removeCardAt` uses `hand.indexOf(card)` which works because card objects keep their identity from `buildDeck()` through shuffling and dealing. No need for card IDs.
- **120 tests** — 29 new tests (7 engine flex, 22 reducer) added to the 91 from iteration 2.
