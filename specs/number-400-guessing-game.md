# Feature Spec: Number 400 — A Number Guessing Game

**Status:** Draft
**Feature name:** number-400-guessing-game
**Owner:** —
**Last updated:** 2026-11-03

---

## 1. Overview

"Number 400" is a fun, minimal number guessing game.
The app generates a secret **4-digit number**. The player has **7 attempts**
to guess it. After every submission, the app evaluates the guess and gives
feedback using three colored count blocks (guess on the left, counts on the right):

- **Green** — digits that are present in the secret AND in the right position
- **Yellow** — digits that are present in the secret but NOT in the right position
- **Red** — digits that are NOT present in the secret at all

The game is won when the guess matches the secret exactly (4 green digits).
The game is lost when all 7 attempts are used without an exact match.

---

## 2. Goals

- A single-page game that is instantly understandable and fun to replay.
- Clear, count-based feedback so players can reason their way to the answer.
- Fast,responsive input experience (keyboard-first, works on mobile too).
- Zero-friction replay ("Play again" resets instantly).

## 3. Non-Goals (for v1)

- No multiplayer or daily shared puzzle (future idea).
- No leaderboards or accounts.
- No difficulty levels (future idea: 3-digit / 5-digit variants).
- No i18n.

---

## 4. Game Rules

### 4.1 The Secret

- The secret is a **4-digit number**.
- Each digit is `0–9` (inclusive of `0`; a leading `0` is allowed — e.g. `0472`).
- **All four digits are unique** — no repeats anywhere in the secret
  (e.g. `0472` ✓, `1123` ✗). Generation: pick 4 distinct digits from `0–9`
  without replacement (uniform shuffle).
- The secret is generated uniformly at random at game start and is **never
  displayed until the game ends** (win or lose).

### 4.2 The Guess

- Exactly 4 digits, entered into **4 input blocks**.
- **All digits in a guess must be unique.** A digit already used in the active
  row is rejected: its keypad key and input path are blocked (disabled visual
  state + gentle shake).
- The player submits by pressing **Enter** (or tapping the Enter/Check button).
- A guess is only submittable when all 4 blocks contain a digit.

### 4.3 Attempts

- The player has **7 attempts**.
- Each valid submission consumes one attempt.
- Invalid input (incomplete guess) does **not** consume an attempt.

### 4.4 Feedback Rules (the core logic)

For a guess `G = g1 g2 g3 g4` against secret `S = s1 s2 s3 s4` — because both
secret and guess contain only **unique** digits, every guess digit falls in
exactly one bucket (no counting/tally rules needed):

1. **Green (exact match):** `gi == si` — digit is in the secret at this
   position.
2. **Yellow (misplaced):** `gi != si` but `gi` exists somewhere in `S`.
3. **Red (absent):** `gi` does not exist in `S` at all.

Equivalently: first pass labels exact position matches green; any remaining
guess digit whose value is present in the secret becomes yellow; everything
else is red. Guaranteed consistent because a value can occupy at most one slot
in `S` and at most one slot in `G`.

### 4.5 Feedback Display

Each submitted guess is shown as a **single horizontal row**: the four guessed
digits on the left, and **three colored count blocks on the right** (green,
yellow, red). The blocks display **only a count** — never the digit values
themselves.

```
┌────────────────────────────────────┐
│  Guess          🟩    🟨    🟥     │
│  [7][1][2][4]    1     2     1     │
└────────────────────────────────────┘
```

- **Green block:** how many digits are present *and* in the right spot.
- **Yellow block:** how many digits are present but in the wrong spot.
- **Red block:** how many digits are not in the secret at all.
- Because guesses use unique digits, the three counts always sum to 4.
- A count of `0` is displayed explicitly (never hidden or left blank).
- The meaning of each block is conveyed by color plus accessible labels; a
  compact legend in the page header explains green/yellow/red.
- All previous guesses stay visible in their fixed board rows, each rendered
  with the same left-guess / right-counts layout.

### 4.6 Win / Lose

- **Win:** all four digits green → show the secret, a victory message, and
  the number of attempts used.
- **Lose:** 7 attempts exhausted without a match → reveal the secret.
- Both ends offer a **"Play Again"** action that starts a fresh game with a
  new random secret.

---

## 5. UI / UX

### 5.1 Layout (single page, mobile-first)

```
┌─────────────────────────────────────┐
│              NUMBER 400             │  ← title + subtitle only (no tagline)
│       Guess the number in 7 tries   │
├─────────────────────────────────────┤
│  ℹ  How to play                  ⌄  │  ← rules box (info icon, collapsible)
│    • 4 unique digits, 7 attempts    │
│    • 🟩 right · 🟨 misplaced · 🟥 absent
├─────────────────────────────────────┤
│  Attempt X / 7                      │
│  1  [ ][ ][ ][ ]    [ ][ ][ ]       │  ← fixed 7-row board
│  …                                  │     (see fixed-board-annotations.md)
│  7  [ ][ ][ ][ ]    [ ][ ][ ]       │
├─────────────────────────────────────┤
│  1 2 3 4 5 6 7 8 9 0  _  ⌫ ⏎        │  ← on-screen keypad (mobile only)
└─────────────────────────────────────┘
```

- **Equal, larger blocks:** the four input blocks and the three count blocks
  use the **same square size**, noticeably larger than the first version, with
  matching gaps so each row reads as one aligned strip.
- **Rules box:** directly below the header sits a bordered box with an info
  (ℹ) icon and a "How to play" label. It is collapsible (expanded by default)
  and contains: the four-unique-digit rule, the 7-attempt limit, the green /
  yellow / red count meanings, and the input shortcuts (Enter, `_`,
  Backspace). The standalone color legend moves inside this box.
- **No "Word500/Wordle-style" tagline:** the header shows only the title and a
  short subtitle.

### 5.2 Input Behavior

- 4 input blocks in the active row; each accepts a single digit `0–9`.
- Each row keeps an **insertion cursor** — the block that receives the next
  digit. Typing a digit writes it into the cursor's block and **auto-advances**
  to the next empty block (wrapping to the first empty one if needed).
- **`_` (underscore)** is a *move-forward* key: pressing it advances the cursor
  one block to the right **without entering a digit**, so blocks can be filled
  out of order. On the last block it does nothing. Available on the physical
  keyboard (`Shift` + `-`) and as a dedicated `_` key on the on-screen keypad.
  An underscore is never stored as a digit.
- **Backspace** clears the block under the cursor; if that block is already
  empty, it steps left and clears the nearest filled block.
- **Enter** submits when all four blocks hold digits; shows a gentle
  shake/toast when the guess is incomplete (a row with gaps is not
  submittable).
- Physical keyboard **and** on-screen keypad both supported (on-screen keypad
  primarily for touch devices).

### 5.3 Feedback & Animations

- On submit, the guess row locks **in place** with its three count blocks, and
  the cursor moves to the next row.
- Count blocks animate in with a short stagger (e.g. fade/slide, ~150ms each).
- Win: count blocks pulse green; confetti is optional (keep bundle light).
- Lose: the secret is revealed beneath the board.

### 5.4 End-of-game dialog (non-blocking banner)

- Shows: result (🎉 Win / 💀 Lose), the secret, attempts used, and a
  "Play Again" button.

---

## 6. Tech Stack & Project Conventions

| Concern      | Choice                                        |
| ------------ | --------------------------------------------- |
| Framework    | **Vue 3** (`<script setup lang="ts">`)        |
| Language     | **TypeScript** (strict mode)                  |
| Build tool   | **Vite** (existing setup)                     |
| Package mgr  | **pnpm**                                      |
| Styling      | Plain CSS / scoped styles in SFCs (no UI lib) |
| Typography   | Monospace-first: "Input Mono" as primary font, system mono fallbacks (`--sans` and `--mono` share one stack) |
| State        | Composables + `reactive`/`ref` (no Pinia needed for v1) |
| Tests        | Vitest (feedback logic is pure TS — fully unit-testable) |

pnpm commands: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm preview`
(already mapped in `package.json` scripts).

---

## 7. Component Architecture

```
src/
├── main.ts
├── App.vue                     — page shell, wires the game
├── composables/
│   └── useGame.ts              — game state machine (new, submit, reset)
├── domain/
│   ├── types.ts                — Guess, Feedback, GameStatus, etc.
│   ├── secret.ts               — random 4-distinct-digit secret generation
│   └── feedback.ts             — pure evaluateGuess(guess, secret) fn
└── components/
    ├── GameBoard.vue           — history list + active input row
    ├── GuessHistory.vue        — list of past guesses
    ├── GuessFeedback.vue       — one row: guess digits left, 3 count blocks right
    ├── FeedbackPanel.vue       — single colored count block (green/yellow/red)
    ├── InputRow.vue            — 4-digit input blocks
    ├── DigitInput.vue          — one input block (autos, backspace)
    ├── Keypad.vue              — on-screen digits + ⌫ + ⏎
    └── GameResultBanner.vue    — win/lose dialog + Play Again
```

> **Note:** [`fixed-board-annotations.md`](./fixed-board-annotations.md) supersedes the
> history-based `GuessHistory` / `GuessFeedback` / `InputRow` components with a
> fixed 7-row board (`GuessRow.vue`) and adds clickable tile annotations.

### 7.1 Key types (`domain/types.ts`)

> **Note:** the types below are the original v1 shape. The fixed-row board's
> `GuessRow`-based state and cursor are defined in
> [`fixed-board-annotations.md`](./fixed-board-annotations.md) §7.

```ts
export type FeedbackColor = 'green' | 'yellow' | 'red';

export interface GuessAttempt {
  guess: [number, number, number, number];
  colors: FeedbackColor[];          // per-position: green | yellow | red
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  secret: [number, number, number, number];
  attempts: GuessAttempt[];
  current: (number | null)[];       // 4 slots being typed
  status: GameStatus;
}
```

### 7.2 Core pure function (`domain/feedback.ts`)

```ts
function evaluateGuess(
  guess: number[],
  secret: number[],
): FeedbackColor[]
```

Simple single pass, valid because both arrays contain unique digits:

1. For each position `i`, return `'green'` when `guess[i] === secret[i]`.
2. Otherwise return `'yellow'` when the value exists anywhere in `secret`.
3. Otherwise return `'red'`.

A small companion helper turns the per-position colors into the panel counts:

```ts
function countByColor(
  colors: FeedbackColor[],
): Record<FeedbackColor, number>
```

It returns `{ green: n, yellow: n, red: n }` and is what the UI renders.
Both helpers are deterministic and covered by unit tests (Vitest).

---

## 8. State & Persistence

- Game state lives in a single `useGame()` composable provided to `App.vue`
  (props/events down the component tree; no global store for v1).
- *(Optional, stretch)* Persist current game + aggregate stats (games played,
  wins, current streak, best attempts) in `localStorage` under a `number400`
  key, so a reload resumes the board.

---

## 9. Edge Cases & Validation

| Case                          | Behavior                                     |
| ----------------------------- | -------------------------------------------- |
| Submit with < 4 digits        | Blocked; shake animation + hint message      |
| Non-digit input               | Blocked; input blocks accept digits only     |
| Digit already used in the row | Blocked; key disabled + shake, no attempt used |
| `_` pressed on the last block | Cursor stays put; nothing entered         |
| Row with gaps submitted       | Blocked as incomplete; no attempt consumed |
| New row becomes active        | Cursor resets to the first block           |
| All 7 attempts used, no win   | Status → `lost`, reveal secret               |
| Guess equals secret           | Status → `won` even if attempts remain       |
| Page refresh mid-game         | Fresh game (unless persistence stretch goal) |
| Multiple rapid submits        | Enter ignored while status ≠ `playing` — submit is a no-op after win/lose |

---

## 10. Assumptions & Open Questions

**Assumptions made in this spec:**
1. Game title digits: "400" ↔ 4 blocks; the secret is 4 digits regardless of the "400" name.
2. Digits `0–9` allowed; **no repeats** — secret and guesses both contain four
   distinct digits *(updated decision, applies to both sides for consistency;
   this removed the Mastermind tally rules entirely)*.
3. Feedback blocks show **counts only**, never digit values, laid out
   horizontally: guess on the left, three colored count blocks on the right.
   Per-position colors still live in state, so per-tile coloring could be added
   later without changing the feedback logic.
4. Input blocks and count blocks use the **same, larger square size** with equal
   gaps (see §5.1).
5. **`_`** moves the insertion cursor one block right without entering a digit;
   a row with empty blocks cannot be submitted.
6. The header drops the Word500/Wordle-style tagline; the rules live in a
   collapsible info-icon box directly under the header.

**Resolved decisions (clarified with product):**
1. On-screen keypad: hidden on desktop (shown at ≤720px or on coarse pointers).
2. Stats/persistence: not in v1; a refresh starts a fresh game.
3. Feedback display: count-only blocks in a horizontal left-guess / right-counts row.
4. Rules box: expanded by default; collapse state is not persisted.
5. Underscore: forward cursor movement only — never stored as a digit.

**Still open (post-v1):**
1. Should stats/persistence ship right after v1?
2. Should a 3-digit / 5-digit difficulty variant ship later?

---

## 11. Acceptance Criteria

- [ ] A fresh game generates a valid 4-digit secret with **four distinct digits** (digits `0–9`, no repeats).
- [ ] A guess containing a digit already used in the active row cannot be submitted (key/input rejected, no attempt consumed).
- [ ] Entering 4 digits and pressing Enter produces a guess row laid out with the guess digits on the left and three colored count blocks (green/yellow/red) on the right; the blocks show **counts only** (0–4, always summing to 4) and never digit values.
- [ ] Incomplete guesses cannot be submitted and don't consume an attempt.
- [ ] Exactly 7 attempts are allowed; the 7th failed attempt ends the game with `lost` and reveals the secret.
- [ ] An exact match ends the game with `won`, revealing the secret and attempts used — Enter is ignored afterwards.
- [ ] Feedback correctness per §4.4 (green/yellow/red per position, unique digits) is enforced by unit tests (`pnpm test` / Vitest) for `evaluateGuess`.
- [ ] Input and count blocks render at the same, larger square size with equal gaps.
- [ ] Pressing `_` advances the insertion cursor without entering a digit; a row with gaps cannot be submitted.
- [ ] The header contains no Word500/Wordle-style tagline; rules appear in an info-icon box under the header.
- [ ] "Play Again" resets everything with a new random secret.
- [ ] `pnpm build` passes `vue-tsc` type checking with no errors.
- [ ] Game is fully playable on a mobile viewport using the on-screen keypad.
