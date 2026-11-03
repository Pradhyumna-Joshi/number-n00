# Feature Spec: Fixed-Row Board & Click-to-Annotate Guesses

**Status:** Approved
**Feature name:** fixed-board-annotations
**Base spec:** [`number-400-guessing-game.md`](./number-400-guessing-game.md)
**Last updated:** 2026-11-03

---

## 1. Overview

This feature replaces the "active input row + appended history" board of the
base spec with a **fixed 7-row board** and adds a **click-to-annotate** helper
on submitted guesses.

- At the start of a game the board **already renders all 7 rows**, each row
  showing 4 input blocks on the left and 3 count blocks on the right.
- Guesses are submitted **into their own row** — nothing is appended, moved,
  or ("no new line after guess"). The active row simply advances to the next
  row below.
- After a submission, the player can **click the digits of that submitted
  guess** to cycle a color note — `none → red → yellow → green → none` — a
  self-annotation aid ("this digit is probably absent / misplaced / placed")
  that helps the player figure out the answer faster.

The evaluation logic, scoring, and count-block display from the base spec are
unchanged.

---

## 2. Goals

- A **fixed board** so the game's shape is visible at a glance.
- Post-submission flexibility: the player can mark their own deductions on
  submitted digits without affecting correctness.
- Keep all base-spec mechanics (7 attempts, counts-only feedback, unique
  digits) intact.

## 3. Non-Goals

- No persistence/stats (still deferred per base spec).
- Annotations are **not** validated against the secret — they never influence
  scoring, win/lose detection, or the count blocks.
- No keyboard shortcut for annotations (click/tap only in v1).

---

## 4. Board Rules (fixed rows)

1. A game starts with **7 pre-rendered rows**, numbered 1–7. Each row shows:
   - 4 digit input blocks (left)
   - 3 count blocks (right) — same count-only blocks from base spec §4.5
2. Exactly **one active row** exists while the game is playing: the first row
   without a submission, scanning from the top (**strict single active row**).
   Typing, the on-screen keypad, and backspace always target that row; other
   rows cannot be typed into (skipping rows is not allowed).
3. Submitting a guess:
   - locks the active row for typing (digits stay in place),
   - reveals that row's count blocks, and
   - advances the active row to the next row below (or ends the game).
4. Empty rows keep their count blocks visible but **dimmed/ghosted** (no
   counts computed yet) so the board shape stays constant.
5. All base-spec input rules still apply per row: 4 unique digits, Enter to
   submit, incomplete guesses blocked with shake + hint, no attempt consumed.
6. Each row keeps an **insertion cursor** (the block that receives the next
   digit). **`_` moves the cursor one block right without entering a digit**,
   so blocks may be filled out of order; the cursor resets to the first block
   when a row becomes active, and a row with gaps cannot be submitted (base
   spec §5.2).

---

## 5. Annotation Rules (click-to-annotate)

1. **Which tiles:** only the digit tiles of **submitted** rows are
   annotatable. Tiles of empty/unsubmitted rows ignore clicks.
2. **Cycle on successive clicks** of one tile:
   ```
   click 1 → red    ("probably not in the secret")
   click 2 → yellow ("probably present, wrong spot")
   click 3 → green  ("probably present, right spot")
   click 4 → back to uncolored (cycle restarts)
   ```
3. Annotations are the **player's own notes** — they are not checked against
   the secret and do not affect counts, attempts, or win/lose.
4. Annotations **persist for the whole game** (including after later
   submissions and after game over) and are cleared only by **Play Again**.
5. A tile shows exactly one annotation color at a time (the latest cycle
   state), rendered as a fill on the tile while the digit stays readable.
6. Usable during `playing` **and** after `won`/`lost`, until Play Again.

---

## 6. UI / UX

### 6.1 Board layout

```
Attempt 2 / 7
┌─────────────────────────────────────────┐
│ 1  [ ][ ][ ][ ]     [–][–][–]           │  ← ghost counts until submitted
│ 2  [5][1][2][3]     [0][3][1]           │  ← submitted + revealed counts
│ 3  [5][3][1][2]     [–][–][–]           │  ← active row (accent cursor)
│ 4  [ ][ ][ ][ ]     [–][–][–]           │
│ …                                        │
│ 7  [ ][ ][ ][ ]     [–][–][–]           │
└─────────────────────────────────────────┘
```

- Row numbers (1–7) on the left edge anchor the fixed board.
- The active row gets the same active-slot highlight as before; the cursor
  block is accent-outlined and `_` moves that cursor without typing a digit.
- Submitted rows show their counts; unsubmitted rows show dimmed ghost
  count blocks (placeholder `–`).
- **Equal, larger blocks:** the four input blocks and the three count blocks
  share the **same square size** (roughly 40–52px depending on viewport) and
  the same gaps, so every row reads as one aligned strip.

### 6.2 Tile states (digit blocks)

| State            | Visual                                        |
| ---------------- | --------------------------------------------- |
| Empty / upcoming | dark surface, muted border                    |
| Cursor (active)  | accent border/outline; receives the next digit |
| Filled, typing   | slightly elevated surface                     |
| Submitted, plain | locked neutral surface, reduced emphasis      |
| Submitted + note | filled with the annotation color (red/yellow/green), digit still readable |

- Input and count blocks are equal squares at every breakpoint. All seven rows
  are always laid out in full (the board itself never scrolls); on very short
  viewports the page scrolls naturally instead.
- Submitted, annotatable tiles show a `pointer` cursor and a subtle press
  animation; unsubmitted/empty tiles show the default cursor.
- Accessibility: every annotatable tile is a real button with an
  `aria-label` like "Digit 5, note: yellow — click to cycle note".

### 6.3 Rules box & header

- The header shows **only** "Number 400" plus one short subtitle. The former
  "A Word500-style number game" eyebrow/tagline is removed.
- Directly under the header: a bordered **rules box** with an info icon (ℹ)
  and a "How to play" label. It is collapsible and **expanded by default**;
  the collapsed state is not persisted.
- Contents: four unique digits, seven attempts, the green/yellow/red count
  meanings, click-to-annotate, and the input shortcuts (Enter, `_`,
  Backspace). The standalone color legend moves inside this box.

### 6.4 Everything else

- Keypad, hint messages, status line, result banner, and Play Again behave as
  in the base spec. The mobile keypad gains a dedicated `_` key.

---

## 7. State & Types

`GameState` changes from `attempts + current` to a fixed `rows` array:

```ts
export type Note = FeedbackColor | null;   // annotation layer reuses the colors

export interface GuessRow {
  index: number;                  // fixed position 0–6, never changes
  guess: (number | null)[];       // typed digits
  colors: FeedbackColor[] | null; // set once, on submission
  notes: Note[];                  // user annotations, one per tile
  cursor: number;                 // insertion slot (0–3), moved by `_`
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  secret: DigitTuple;
  rows: GuessRow[];               // always length MAX_ATTEMPTS (7)
  status: GameStatus;
}
```

- `attemptsUsed = rows.filter(r => r.colors !== null).length`
- `activeRowIndex = rows.findIndex(r => r.colors === null)` (`-1` when done)

### 7.1 `useGame()` API (updated)

| Function | Change |
| -------- | ------ |
| `addDigit` / `removeDigit` | target the **active row**; `addDigit` writes at the cursor, `removeDigit` clears at/left of it |
| `moveCursor` | **new** — advances the cursor one slot right (bound to `_`); no-op on the last slot |
| `submitGuess` | locks active row, sets its `colors`, advances active row, win/lose as before |
| `cycleNote(rowIndex, tileIndex)` | **new** — cycles `none → red → yellow → green → none`; ignored for unsubmitted rows; allowed while playing and after game over |
| `resetGame` | rebuilds 7 fresh rows (counters cleared, new secret) |

---

## 8. Component Architecture (updated)

```
src/components/
├── GameBoard.vue           — status line + 7 fixed GuessRow rows + banner
├── GuessRow.vue            — NEW: one fixed row (row number, digits, counts)
├── DigitInput.vue          — renders cursor/active slot + note color; clickable when annotatable
├── FeedbackPanel.vue       — unchanged; gains a pending/ghost state for unsubmitted rows
├── Keypad.vue              — gains a dedicated `_` (move-forward) key; otherwise unchanged
└── GameResultBanner.vue    — unchanged
```

- **Retired:** `GuessHistory.vue`, `GuessFeedback.vue`, `InputRow.vue` — the
  appended-history design is replaced by fixed rows.
- `GameBoard` renders rows in a fixed list; no list mutation on submit.

---

## 9. Edge Cases

| Case | Behavior |
| ---- | -------- |
| Click a tile in an unsubmitted/empty row | No-op (annotation is submitted-rows only) |
| Click the same tile repeatedly | Cycles none → red → yellow → green → none |
| Annotations after game over | Allowed; persist until Play Again |
| Second game (Play Again) | All rows, notes, and the secret are reset |
| Typing into a non-active row | Not possible; strict single active row |
| Submitting the 7th row with no match | `lost`; rows keep final guesses + revealed counts |
| Digit already in the active row | Blocked as before (keypad key dimmed, shake, no attempt) |
| `_` pressed on the last block | Cursor stays; nothing entered |
| Submitting a row with gaps | Blocked as incomplete; no attempt consumed |
| New row becomes active | Cursor resets to slot 0 |

---

## 10. Testing

- `useGame.spec.ts` updates:
  - board always has exactly `MAX_ATTEMPTS` rows at start,
  - submission sets `colors` on the active row and advances `activeRowIndex`,
  - `moveCursor` advances and clamps at the last slot; new rows start at slot 0,
  - `cycleNote` transitions `null → 'red' → 'yellow' → 'green' → null`,
  - `cycleNote` ignored for unsubmitted rows,
  - reset rebuilds the board with cleared notes.
- `feedback.spec.ts` / `secret.spec.ts` unchanged.

---

## 11. Acceptance Criteria

- [ ] On game start the board shows exactly 7 rows, each with 4 input blocks and 3 count blocks; no new rows appear after a guess.
- [ ] Input blocks and count blocks are the same, larger square size with equal gaps.
- [ ] Pressing `_` moves the cursor one block right without entering a digit; a row with gaps cannot be submitted.
- [ ] Submitting locks the guess in its own row, reveals that row's counts, and makes the next row active (typing targets strictly the active row).
- [ ] Clicking a digit tile of a submitted row cycles its annotation none → red → yellow → green → none; successive clicks show the next color each time.
- [ ] Clicking tiles of unsubmitted rows does nothing.
- [ ] Annotations never affect counts, attempts, or win/lose; count blocks still show counts only (base spec §4.5).
- [ ] Notes persist across further submissions and after the game ends; Play Again clears them along with a new secret.
- [ ] Unsubmitted rows show dimmed ghost count blocks; submitted rows reveal real counts.
- [ ] The header has no Word500/Wordle-style tagline; rules appear in an info-icon box beneath it.
- [ ] All existing uniqueness / incomplete-submit / 7-attempt / duplicate-digit rules still hold (base spec §9).
- [ ] `pnpm test` passes for the updated composable tests; `pnpm build` stays type-check clean.
