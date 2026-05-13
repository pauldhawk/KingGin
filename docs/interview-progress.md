# King Gin — Interview Progress

> **Status:** Complete — all batches answered.
> **Last updated:** 2026-05-13

---

## Decisions Locked So Far

### Batch 1 — Product Scope

| Decision | Choice |
|---|---|
| Multiplayer mode | Single-player vs. bots only (no hot-seat, no networked) |
| Player count | Fixed: 1 human + 3 bots (4 players total) |
| Persistence | None for MVP; localStorage resume planned for a later iteration |
| Deployment | GitHub Pages via GitHub Actions |
| Polish level | Attractive UI by end of full-game iteration (Iter 5); animations deferred to Iteration 6 |

### Batch 2 — Tech Stack

| Layer | Choice |
|---|---|
| Framework | React + Vite |
| State management | Plain `useReducer` + context (no Zustand/Redux) |
| Styling | Tailwind CSS v4 (CSS-based config, not tailwind.config.js) |
| Testing | Vitest — rules engine unit tests priority; React Testing Library deferred |
| RNG | `seedrandom` (reproducible deals) |
| Lint/format | ESLint + Prettier |
| Deployment | GitHub Pages via GitHub Actions |

### Batch 3 — Bots

| Decision | Choice |
|---|---|
| Bot strategy | Greedy (draws toward contract, discards least useful card) |
| Bot interface | Designed for easy swap-in of smarter algorithm later |

### Batch 4 — Rules Gaps (partial)

| Rule | Decision |
|---|---|
| Scoring table (corrected) | 3–9 = 5 pts; 10/J/Q/K = 10 pts; Aces = 15 pts; 2s = 20 pts; Jokers = 20 pts |
| Going-out mechanic | On your turn after drawing: if all-but-one cards form the complete contract, lay contract down and discard the last card face-down. Must have exactly `contract_size + 1` cards. |
| Draw pile exhaustion | Reshuffle discard pile (minus top card) to form new draw pile |
| Natural 2s in sequences | **NOT YET ANSWERED** — paused here |

---

## Still To Cover

### Batch 4 — Rules Gaps (remaining)

**4d — Natural 2s in sequences (NEXT QUESTION)**
When a 2 appears at its natural rank in a sequence (e.g. A♥–2♥–3♥–4♥), is it wild or natural?
Options discussed:
- A: Player declares intent when laying down
- B: Always natural if in natural position
- C: Always wild regardless of position
- D (recommended): Engine treats it optimally in the player's favor (natural if it fits naturally, wild otherwise) — most player-friendly, no declaration mechanic

**4e — Tie-breaking rule**
If two or more players finish with the same cumulative score after 7 rounds:
- Shared win, or tiebreaker round?

**4f — Player count max**
2 decks = 108 cards. With 11 dealt per player, what's the hard cap?
(108 / 11 = ~9, but leaving stock pile cards matters)

### Batch 5 — Process

- Where does `ralph-loop` expect iteration files? Format to match?
- Linear / GitHub Issues, or `docs/iterations/` only?

---

## After Interview Completes

Tasks remaining (in order):
1. Update `docs/plan.md` with locked decisions
2. Create `docs/decisions.md` (dated log)
3. Create `docs/open-questions.md` (deferred items)
4. Draft `docs/iterations/01-skeleton.md` (Iteration 1 task breakdown)
