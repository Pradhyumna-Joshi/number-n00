import { computed, reactive } from 'vue'
import { evaluateGuess } from '../domain/feedback'
import { generateSecret } from '../domain/secret'
import {
  CODE_LENGTH,
  MAX_ATTEMPTS,
  type DigitTuple,
  type GameState,
  type GuessRow,
  type Note,
} from '../domain/types'

export type SubmitResult = 'accepted' | 'incomplete' | 'ignored'

/** Click cycle for a tile's note: uncolored → red → yellow → green → uncolored. */
const NOTE_CYCLE: readonly Note[] = [null, 'red', 'yellow', 'green']

export function createRow(index: number): GuessRow {
  return {
    index,
    guess: Array.from({ length: CODE_LENGTH }, () => null),
    colors: null,
    notes: Array.from({ length: CODE_LENGTH }, () => null),
    cursor: 0,
  }
}

function createBoard(): GuessRow[] {
  return Array.from({ length: MAX_ATTEMPTS }, (_, index) => createRow(index))
}

/**
 * The Number 400 state machine with a fixed 7-row board.
 * Typing always targets the first unsubmitted row; submitted rows keep their
 * guess and counts in place and can be annotated with color notes.
 */
export function useGame() {
  const state = reactive<GameState>({
    secret: generateSecret(),
    rows: createBoard(),
    status: 'playing',
  })

  const attemptsUsed = computed(() => state.rows.filter((row) => row.colors !== null).length)
  const isPlaying = computed(() => state.status === 'playing')

  /** First row without feedback while playing, or -1 once the game is over. */
  const activeRowIndex = computed(() => {
    if (!isPlaying.value) return -1
    return state.rows.findIndex((row) => row.colors === null)
  })
  const activeRow = computed(() => state.rows[activeRowIndex.value] ?? null)

  const activeSlotIndex = computed(() => activeRow.value?.cursor ?? 0)

  const isComplete = computed(
    () => activeRow.value?.guess.every((digit) => digit !== null) ?? false,
  )

  const usedDigits = computed(() => {
    const row = activeRow.value
    return new Set((row?.guess ?? []).filter((digit): digit is number => digit !== null))
  })

  /** Finds the next empty slot after `from`, wrapping around; falls back to `from`. */
  function nextEmptySlot(row: GuessRow, from: number): number {
    for (let step = 1; step <= CODE_LENGTH; step += 1) {
      const index = (from + step) % CODE_LENGTH
      if (row.guess[index] === null) return index
    }
    return from
  }

  function addDigit(digit: number): boolean {
    const row = activeRow.value
    if (!isPlaying.value || !row) return false
    if (usedDigits.value.has(digit)) return false

    row.guess[row.cursor] = digit
    row.cursor = nextEmptySlot(row, row.cursor)
    return true
  }

  /** Moves the insertion cursor one block right without entering a digit (`_`). */
  function moveCursor(): boolean {
    const row = activeRow.value
    if (!isPlaying.value || !row) return false
    if (row.cursor >= CODE_LENGTH - 1) return false

    row.cursor += 1
    return true
  }

  /**
   * Clears the block under the cursor; if it is already empty, steps left and
   * clears the nearest filled block.
   */
  function removeDigit(): boolean {
    const row = activeRow.value
    if (!isPlaying.value || !row) return false

    if (row.guess[row.cursor] !== null) {
      row.guess[row.cursor] = null
      return true
    }

    for (let index = row.cursor - 1; index >= 0; index -= 1) {
      if (row.guess[index] !== null) {
        row.guess[index] = null
        row.cursor = index
        return true
      }
    }

    return false
  }

  function submitGuess(): SubmitResult {
    const row = activeRow.value
    if (!isPlaying.value || !row) return 'ignored'
    if (!isComplete.value) return 'incomplete'

    const colors = evaluateGuess(row.guess as DigitTuple, state.secret)
    row.colors = colors

    if (colors.every((color) => color === 'green')) {
      state.status = 'won'
    } else if (attemptsUsed.value >= MAX_ATTEMPTS) {
      state.status = 'lost'
    }

    return 'accepted'
  }

  /**
   * Cycles the note on a submitted tile. Ignored for rows that have not been
   * submitted yet. Annotations never affect scoring and stay until reset.
   */
  function cycleNote(rowIndex: number, tileIndex: number): void {
    const row = state.rows[rowIndex]
    if (!row || row.colors === null) return
    if (tileIndex < 0 || tileIndex >= row.notes.length) return

    const current = row.notes[tileIndex] ?? null
    const nextIndex = (NOTE_CYCLE.indexOf(current) + 1) % NOTE_CYCLE.length
    row.notes[tileIndex] = NOTE_CYCLE[nextIndex] ?? null
  }

  function resetGame(): void {
    state.secret = generateSecret()
    state.rows = createBoard()
    state.status = 'playing'
  }

  return {
    state,
    attemptsUsed,
    isPlaying,
    activeRowIndex,
    activeSlotIndex,
    isComplete,
    usedDigits,
    addDigit,
    moveCursor,
    removeDigit,
    submitGuess,
    cycleNote,
    resetGame,
  }
}
