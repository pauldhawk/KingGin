# King Gin — Open Questions

Parking lot for unresolved ambiguities and deferred decisions. When something here gets decided, move it to `docs/decisions.md` with a date.

---

## Deferred to Later Iterations

### May I — UI and priority details *(decide in Iter 4)*
- How is the human player prompted when a May I opportunity arises mid-turn?
- Priority rule: closest player clockwise gets it on a tie — but how does the engine represent "closest clockwise" given bot turn order?
- Round 7 has mandatory May I — exactly when in the turn sequence is this enforced?

### UI / Style *(decide in Iter 5)*
- No style sketch for the table exists yet. A rough wireframe before Iter 5 would speed up the UI pass significantly.
- Card graphics: custom SVGs, a card library, or emoji/text placeholders?

### localStorage persistence *(decide after MVP ships)*
- Resume from a saved game state on browser refresh.
- Which game state fields need to survive — full `GameState`, or just enough to reconstruct the current hand?

### Smarter bots *(decide in or after Iter 6)*
- Greedy bots for MVP; the interface is designed for a swap-in.
- What "smarter" looks like has not been defined.

---

## Out of Scope for MVP (revisit if needed)

- **Hot-seat multiplayer** — no "hand hidden" screen for pass-and-play.
- **Networked multiplayer** — no backend; would require its own multi-iteration arc.
- **Animations** — deferred to Iter 6.
- **React Testing Library** — deferred; Vitest unit tests cover the engine, which is the priority.

---

## Trivial / Self-Answering (document here until confirmed in code)

- **Player count hard cap at 6:** 6 × 11 = 66 cards dealt in Round 1 (the largest deal), leaving 42 in the stock pile with 2 decks + 4 jokers. Comfortable margin. *(No action needed.)*
