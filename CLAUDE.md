# King Gin — Claude Code Instructions

## How to run
- `npm run dev` — start dev server (http://localhost:5173/KingGin/)
- `npm run check` — typecheck + lint + tests (must pass before any commit)
- `npm run test` — tests only
- `npm run typecheck` — TypeScript type check only
- `npm run lint` — ESLint only

## Rules engine
Lives in `src/engine/`. **No imports from `react`, `react-dom`, or any DOM API.**
This is enforced by ESLint — breaking it means the engine stops being testable in isolation.
The engine takes a game state + an action and returns a new game state. No side effects.

## Testing
- Tests live in `tests/`, mirroring `src/` structure.
- Fixtures (pre-built hands, game states) go in `tests/fixtures/`.
- Use seeded RNG (`seedrandom`) for any test involving shuffling.
- One test file per engine module (e.g. `tests/engine/deck.test.ts` tests `src/engine/deck.ts`).

## Architecture
- `src/engine/` — pure TypeScript rules engine. No React, no DOM.
- `src/state/` — `useReducer` + context that wires the engine to React.
- `src/ui/` — React components (added in Iteration 3+).

## Key decisions
- All design decisions: `docs/decisions.md`
- Open/deferred questions: `docs/open-questions.md`
- Iteration task files: `docs/iterations/NN-name.md`
- Game rules reference: `docs/King_Gin_Rules.md`

## Scoring (corrected)
- 3–9 = 5 pts; 10/J/Q/K = 10 pts; Aces = 15 pts; 2s = 20 pts; Jokers = 20 pts

## After each iteration
Commit and push to `main` when all tasks and acceptance criteria are complete.
