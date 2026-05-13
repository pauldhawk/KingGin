# King Gin — Decisions Log

Dated record of every non-obvious design decision. When a decision here conflicts with code, this file wins — update the code and note why.

---

## 2026-05-13 — Planning Interview

### Batch 1 — Product Scope

| Decision | Choice | Rationale |
|---|---|---|
| Multiplayer mode | Single-player vs. 3 bots only | No networking complexity for MVP |
| Player count (MVP) | 1 human + 3 bots (4 players) | Fixed for now |
| Engine player count | Parameterized: 3–6 players | Avoid rewrite if count ever changes |
| Persistence | None for MVP | localStorage planned for a later iteration |
| Deployment | GitHub Pages via GitHub Actions | Free; no backend required |
| UI polish level | Attractive UI by end of Iter 5; animations deferred to Iter 6 | Deferred polish unblocks early iterations |

### Batch 2 — Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript strict mode | Required; strict catches rules-engine bugs early |
| Framework | React + Vite | Fast dev loop; trivial to deploy as static site |
| State | Plain `useReducer` + context (no Zustand/Redux) | Card game state is reducer-shaped; no extra dependency needed |
| Styling | Tailwind CSS v4 (CSS-based config, not `tailwind.config.js`) | Fast prototyping; v4 avoids a separate config file |
| Testing | Vitest (React Testing Library deferred) | Matches Vite's build pipeline; RTL deferred until UI iteration |
| RNG | `seedrandom` | Reproducible deals make tests deterministic |
| Lint/format | ESLint + Prettier | Standard |
| Deployment | GitHub Pages via GitHub Actions | (same as scope decision) |

### Batch 3 — Bots

| Decision | Choice | Rationale |
|---|---|---|
| Bot strategy | Greedy: draws toward contract, discards least useful card | Good enough for MVP |
| Bot interface | Pluggable strategy interface | Enables smarter bots later without engine changes |

### Batch 4 — Rules Gaps

| Rule | Decision | Rationale |
|---|---|---|
| Scoring table (corrected) | 3–9 = 5 pts; 10/J/Q/K = 10 pts; Aces = 15 pts; 2s = 20 pts; Jokers = 20 pts | Original rules doc had 7 missing and 10 miscategorized |
| Going-out mechanic | Must have exactly `contract_size + 1` cards; lay contract face-up, discard 1 face-down | Canonical Contract Rummy rule |
| Draw pile exhaustion | Reshuffle discard pile minus top card to form new draw pile | Standard; top card preserved so last known discard stays visible |
| Natural 2s in sequences | Engine resolves optimally in player's favor — natural if sequence works naturally, wild otherwise | Maximally player-friendly; no declaration mechanic needed |
| Tie-breaking | Shared win — tied players are co-winners | Avoids extra-round complexity; simplest to implement |
| Player count parameterization | Engine accepts 3–6 players; MVP is 4 | Flexible without over-engineering |

### Batch 5 — Process

| Decision | Choice |
|---|---|
| Iteration task files | `docs/iterations/NN-name.md` — one file per iteration |
| Task tracking | GitHub Issues (individual tasks) + `docs/` (decisions, open questions) |
