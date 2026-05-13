# King Gin — Project Plan

> **Status:** Draft. This is the initial plan, created before the first iteration. Expect to update it as decisions are made and spikes complete.
>
> **Last updated:** 2026-04-22

---

## 1. Vision

Build a **web-based implementation of King Gin**, the house variant of Contract Rummy documented in [`docs/King_Gin_Rules.md`](./King_Gin_Rules.md). The goal is a playable, testable web app written in TypeScript, built iteratively so that after every spike there is something concrete to exercise in the browser.

## 2. Guiding Principles

- **Iterative delivery.** Every spike ends with something runnable and testable. No spike "prepares for the next one" without delivering visible value.
- **Rules engine first, UI second.** The game logic (deck, dealing, contract validation, scoring) lives in a pure TypeScript module with no UI dependencies. This makes it cheap to unit-test and hard to break.
- **Testability over cleverness.** Use a seeded RNG so deals are reproducible. Write tests as data fixtures where possible ("given this hand and this contract, is it valid?").
- **Decisions get logged.** Any non-obvious choice goes in [`docs/decisions.md`](./decisions.md). Any unresolved ambiguity goes in [`docs/open-questions.md`](./open-questions.md).

## 3. Requirements

From the original brief:

- Web app written in TypeScript.
- No restrictions on packages.
- Built iteratively, with a spike per iteration.
- Every iteration must be testable end-to-end after completion.
- Each iteration contains several tasks.
- Iterations are driven by the `ralph-loop` Claude Code plugin.

## 4. Tech Stack (confirmed 2026-05-13)

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript strict mode | Required. Strict mode catches rules-engine bugs early. |
| Framework | React + Vite | Fast dev loop; trivial to deploy as static site. |
| State | Plain `useReducer` + context (no Zustand/Redux) | Card games are reducer-shaped; no extra dependency needed. |
| Styling | Tailwind CSS v4 (CSS-based config — no `tailwind.config.js`) | Fast to prototype; v4 CSS-first config is simpler. |
| Testing | Vitest (React Testing Library deferred) | Matches Vite's build pipeline; RTL deferred until UI iteration. |
| RNG | `seedrandom` | Reproducible deals for deterministic tests. |
| Lint/format | ESLint + Prettier | Standard. ESLint enforces zero React/DOM imports in `src/engine/`. |
| Deployment | GitHub Pages via GitHub Actions | Free; no backend required. |

Player count: engine is parameterized for **3–6 players**; MVP ships as 4 (1 human + 3 bots).

## 5. Architecture Sketch

```
┌──────────────────────────────────────────────────────────┐
│                      UI Layer (React)                    │
│   - Components: Table, Hand, Card, ScoreBoard, MayI UI   │
│   - Reads game state, dispatches player actions          │
└──────────────────────────────┬───────────────────────────┘
                               │
                   ┌───────────▼────────────┐
                   │    Game State Store    │
                   │  (reducer + actions)   │
                   └───────────┬────────────┘
                               │
                   ┌───────────▼────────────┐
                   │     Rules Engine       │
                   │  (pure TS, no React)   │
                   │                        │
                   │ - Deck / Card types    │
                   │ - Deal / Shuffle       │
                   │ - Contract validation  │
                   │ - Scoring              │
                   │ - Bot decision logic   │
                   └────────────────────────┘
```

The **rules engine** is the star. It knows nothing about the DOM, React, or the player. It takes a game state + an action, returns a new game state (or an error). Every rule from `King_Gin_Rules.md` has a corresponding function and a test.

The **UI layer** is a thin skin over the engine. It renders the current state and dispatches player actions. No game rules live here.

## 6. Iteration Plan (First Draft)

Each iteration is a spike: a narrow vertical slice that ends in a testable deliverable. Detailed task breakdowns live in `docs/iterations/NN-*.md` (one file per iteration).

### Iteration 1 — Project Skeleton
**Goal:** Working dev environment with empty app shell and empty rules engine.
**Deliverables:**
- Repo initialized, `package.json`, TypeScript config, lint/format set up.
- Vite + React app runs with a placeholder page.
- Vitest runs (even if there are no tests yet).
- `src/engine/` folder exists with card/deck type skeletons.
- CI-style script (`npm run check` = typecheck + lint + test).

**How to test it:** `npm run dev` opens a page that says "King Gin — coming soon". `npm run check` passes.

### Iteration 2 — Core Rules Engine (No UI)
**Goal:** All game rules encoded and tested as pure functions.
**Deliverables:**
- Card and deck types, deck builder (2 decks + jokers).
- Seeded shuffle + deal.
- Contract definitions for all 7 rounds.
- Contract validator: given a hand + a contract, return whether the hand satisfies it (including wilds, corner-wrap sequences, multi-wild melds).
- Scoring function (per round and cumulative).
- Comprehensive unit tests, organized by rule.

**How to test it:** `npm test` runs 50+ tests covering every rule and edge case. You can read the test names as a specification.

### Iteration 3 — Single-Round Play Loop (Minimal UI)
**Goal:** One human player vs. simple bots can play a single round end-to-end.
**Deliverables:**
- Game state reducer that wires the rules engine to actions (draw, discard, go out).
- Basic UI: your hand, the draw pile, the discard pile, a "go out" button.
- Dumb bots (random legal move) so a round actually finishes.
- No May I yet, no multi-round scoring, no polish.

**How to test it:** `npm run dev`, play Round 1 in the browser, see it resolve to a score.

### Iteration 4 — May I Mechanic
**Goal:** Out-of-turn discard claims are fully functional.
**Deliverables:**
- May I UI: prompt when it's relevant, limit counter per player.
- Priority logic (closest player clockwise wins ties).
- Active-player-declines-must-draw-from-stock rule.
- Round 7 mandatory May I enforced.

**How to test it:** Play a round in the browser and trigger May I, decline May I, run out of May I's.

### Iteration 5 — Full 7-Round Game
**Goal:** A complete game from Round 1 to a winner.
**Deliverables:**
- Round progression with correct contracts per round.
- Cumulative scoreboard.
- End-of-game screen announcing the winner.
- Ability to start a new game.

**How to test it:** Play a full game solo against bots and reach an end screen.

### Iteration 6 — Polish & Stretch
**Goal:** Make it pleasant to use, and expand along whichever axis we prioritize.
**Candidate items (pick based on what matters most):**
- Styling pass, card graphics, animations.
- Smarter bot (greedy toward contract).
- Hot-seat multiplayer (pass-and-play with a "hand hidden" screen).
- Persistence (localStorage resume).
- Networked multiplayer (biggest scope; likely its own multi-iteration arc).

**How to test it:** Depends on which items we pick.

## 7. Definition of Done (per iteration)

An iteration is "done" when all of the following are true:

1. All tasks in the iteration's markdown file are checked off.
2. `npm run check` passes (typecheck + lint + tests).
3. The "How to test it" section of the iteration has been manually verified.
4. `docs/decisions.md` has been updated with any choices made during the iteration.
5. Any new ambiguities are captured in `docs/open-questions.md`.
6. The iteration file is updated with a short "retrospective" note (what surprised us, what to remember next time).

## 8. Repo Layout

```
KingGin/
├── README.md                       # One-pager: what it is, how to run, how to test.
├── CLAUDE.md                       # Instructions Claude Code reads every session
│                                   #   (where the rules engine lives, how to test,
│                                   #   conventions, anything the AI should know).
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
│
├── docs/
│   ├── King_Gin_Rules.md           # The canonical game rules.
│   ├── plan.md                     # THIS FILE — vision, architecture, iteration list.
│   ├── decisions.md                # Dated log of design decisions.
│   ├── open-questions.md           # Parking lot for unresolved ambiguities.
│   └── iterations/
│       ├── 01-skeleton.md          # One file per iteration: goal, tasks, acceptance.
│       ├── 02-rules-engine.md
│       ├── 03-play-loop.md
│       ├── 04-may-i.md
│       ├── 05-full-game.md
│       └── 06-polish.md
│
├── src/
│   ├── main.tsx                    # React entry point.
│   ├── App.tsx                     # Top-level component.
│   ├── engine/                     # Pure TypeScript rules engine. No React.
│   │   ├── types.ts                #   Card, Suit, Rank, Hand, GameState, etc.
│   │   ├── deck.ts                 #   Deck building, shuffling, dealing.
│   │   ├── contracts.ts            #   Contract definitions per round.
│   │   ├── validate.ts             #   Contract validation (groups, sequences, wilds).
│   │   ├── score.ts                #   Scoring logic.
│   │   ├── bots.ts                 #   Bot decision-making.
│   │   └── index.ts                #   Public API of the engine.
│   ├── state/                      # Reducer + actions that wrap the engine.
│   │   ├── gameState.ts
│   │   └── actions.ts
│   ├── ui/                         # React components.
│   │   ├── Table.tsx
│   │   ├── Hand.tsx
│   │   ├── Card.tsx
│   │   ├── ScoreBoard.tsx
│   │   └── MayIPrompt.tsx
│   └── styles/
│       └── index.css
│
└── tests/
    ├── engine/                     # Mirrors src/engine/ — one test file per module.
    │   ├── deck.test.ts
    │   ├── contracts.test.ts
    │   ├── validate.test.ts
    │   └── score.test.ts
    ├── state/
    │   └── gameState.test.ts
    └── fixtures/                   # Reusable test scenarios as data.
        ├── hands.ts                #   Pre-built hands for validation tests.
        └── games.ts                #   Scripted game-state snapshots.
```

**Notes on the layout:**

- `src/engine/` has **no imports from `react`, `react-dom`, or anything DOM-related.** This is enforced by an ESLint rule (to be added in Iteration 1). Breaking this rule means the engine stops being testable in isolation.
- `tests/` mirrors `src/` so finding the test for a given module is mechanical.
- `tests/fixtures/` is where we write scenario data that test files share. Cheaper than building hands inline in every test.
- `docs/iterations/` files are the source of truth for what's being worked on in a spike. Ralph-loop will be pointed at these.

## 9. Open Questions

All interview questions resolved 2026-05-13. See [`docs/decisions.md`](./decisions.md) for the full decision log and [`docs/open-questions.md`](./open-questions.md) for items deferred to later iterations.

## 10. Things That Would Make This Smoother

- **A style sketch** (even rough) for the table UI. Speeds up the UI spikes a lot.
- **A small fixture format** agreed up front for describing hands and game states in tests. Something like `parseHand("K♥ K♠ K♦ 7♣ Joker")`. Saves huge amounts of test-writing pain.
- **A `scripts/` folder** with a `dev-game.ts` script that runs a full simulated game in the console — useful for debugging the engine without the UI.
- **Agree on how bots are plugged in** early — if we ever want to swap in a smarter bot, the interface should be stable.
- **`CLAUDE.md` maintained from day one** — every iteration should update it with new conventions. Otherwise Claude Code re-discovers the project every session.

## 11. Next Steps

**Interview completed 2026-05-13.** All decisions locked.

1. [x] Answer the interview questions (Section 9).
2. [x] Lock in the tech stack.
3. [x] Write `docs/iterations/01-skeleton.md` with detailed tasks.
4. **Kick off Iteration 1 via `ralph-loop`.** ← current step
5. Review, revise this plan, repeat.
