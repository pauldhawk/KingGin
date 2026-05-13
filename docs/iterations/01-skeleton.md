# Iteration 1 — Project Skeleton

> **Goal:** Working dev environment. Empty app shell that renders in the browser plus empty rules engine stubs. No game logic yet.
>
> **Completion promise:** `npm run dev` shows "King Gin — coming soon" and `npm run check` passes with zero errors.

---

## Context

Stack locked in planning interview (see `docs/decisions.md`):
- React 19 + Vite, TypeScript strict mode
- Tailwind CSS v4 (CSS-based config — no `tailwind.config.js`)
- Vitest for tests; React Testing Library deferred
- ESLint + Prettier; ESLint rule enforcing zero React/DOM imports in `src/engine/`
- `seedrandom` for reproducible shuffles
- GitHub Pages deployment via GitHub Actions (`base: '/KingGin/'` in Vite config)

Rules engine lives in `src/engine/` — pure TypeScript, no React. Everything else can import from it; it imports from nothing outside itself.

---

## Tasks

### 1. Scaffold

- [x] Run `npm create vite@latest . -- --template react-ts` (or equivalent) to generate initial project structure
- [x] Update `package.json`: set `name`, `description`; add `seedrandom` + `@types/seedrandom`
- [x] Verify `npm run dev` starts without errors (Vite default page is fine at this stage)

### 2. TypeScript config

- [x] Set `"strict": true` in `tsconfig.json` (should be default from Vite template — confirm)
- [x] Set `"target": "ES2022"` and `"lib": ["ES2022", "DOM"]`
- [x] Confirm `tsconfig.node.json` covers `vite.config.ts`

### 3. Vite config

- [x] Add `base: '/KingGin/'` for GitHub Pages routing
- [x] Confirm `@vitejs/plugin-react` is present and wired up

### 4. Vitest

- [x] Add Vitest to `vite.config.ts` (inline config, no separate file needed):
  ```ts
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  }
  ```
- [x] Add `"test": "vitest run"` to npm scripts

### 5. Tailwind CSS v4

- [x] Install `tailwindcss` and `@tailwindcss/vite`
- [x] Add `@tailwindcss/vite` plugin to `vite.config.ts`
- [x] In `src/styles/index.css`, add `@import "tailwindcss";` (v4 CSS-first config — no `tailwind.config.js`)
- [x] Import `src/styles/index.css` in `src/main.tsx`
- [x] Verify a Tailwind utility class renders correctly on the placeholder page

### 6. ESLint + Prettier

- [x] Confirm ESLint is installed (Vite template includes it); update config for strict TypeScript rules
- [x] Add an ESLint rule (or plugin) that forbids imports of `react`, `react-dom`, or anything DOM-related inside `src/engine/**`
  - Use `eslint-plugin-import` or a custom no-restricted-imports rule targeting `src/engine/` files
- [x] Add Prettier (`prettier`, `eslint-config-prettier`); create `.prettierrc` with project defaults
- [x] Add `"lint": "eslint src tests"` and `"format": "prettier --write src tests"` to npm scripts

### 7. npm scripts

Add to `package.json` scripts:

```json
"typecheck": "tsc --noEmit",
"check": "npm run typecheck && npm run lint && npm run test"
```

`check` is the single command CI and the Definition of Done both rely on.

- [x] `typecheck`, `check` scripts added

### 8. App shell

- [x] Replace default `src/App.tsx` with a minimal placeholder:
  ```tsx
  export default function App() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-900">
        <h1 className="text-4xl font-bold text-white">King Gin — coming soon</h1>
      </div>
    );
  }
  ```
- [x] Clean up Vite template boilerplate (remove `src/assets/react.svg`, default CSS, etc.)

### 9. Rules engine stubs

Create the following files in `src/engine/`. These are **type stubs only** — function bodies can be `throw new Error('not implemented')` or empty returns. No logic yet.

- [x] `src/engine/types.ts` — core types
- [x] `src/engine/deck.ts` — stub `buildDeck()` and `shuffle()`
- [x] `src/engine/contracts.ts` — stub contract type and `CONTRACTS` constant (7 rounds)
- [x] `src/engine/validate.ts` — stub `validateContract()`
- [x] `src/engine/score.ts` — stub `scoreHand()`
- [x] `src/engine/bots.ts` — stub `BotStrategy` interface
- [x] `src/engine/index.ts` — re-export everything

### 10. State stubs

- [x] `src/state/gameState.ts` — stub `GameState` type and `gameReducer` function signature
- [x] `src/state/actions.ts` — stub `GameAction` union type (empty for now)

### 11. Test infrastructure

- [x] Create `tests/engine/` directory
- [x] Create `tests/fixtures/` directory
- [x] Write one smoke test `tests/engine/types.test.ts` — 3 passing tests

### 12. Project files

- [x] Create `CLAUDE.md`
- [x] Create `README.md`
- [x] `.gitignore` covers `node_modules/`, `dist/`, `.env`

### 13. GitHub Actions

- [x] Create `.github/workflows/deploy.yml`

---

## CLAUDE.md Template

*(Used — see `CLAUDE.md` in repo root.)*

---

## Completion Steps

After all tasks are checked off and acceptance criteria pass:

- [x] Commit all changes with a message describing the iteration
- [ ] Push to `main`

---

## Acceptance Criteria

- [x] `npm run dev` opens a page displaying "King Gin — coming soon" with a dark green background
- [x] `npm run check` exits 0 (typecheck + lint + tests all green)
- [x] `src/engine/` contains all 7 stub files; none import from React or DOM
- [x] ESLint rule blocks React imports in `src/engine/` (verified: adding `import React from 'react'` to `types.ts` produces lint error)
- [x] GitHub Actions workflow file exists and is syntactically valid

---

## Retrospective

- **Wrote all files manually** instead of running `npm create vite@latest` — cleaner since we knew exactly what we wanted and avoided template cleanup.
- **`happy-dom` 17.x had a critical CVE** — upgraded to `^20.9.0` immediately. Worth pinning to `^20.9.0` or higher in future iterations.
- **`vitest/config` vs `vite`** — importing `defineConfig` from `vitest/config` (not `vite`) is the right call when adding a `test:` block inline; this gives TypeScript the full Vitest config types without a separate config file.
- **Engine boundary rule** verified working: `no-restricted-imports` in the flat ESLint config, scoped to `src/engine/**`, catches React imports immediately with a clear error message.
