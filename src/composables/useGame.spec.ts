import { describe, expect, it } from 'vitest'
import { useGame } from './useGame'
import { CODE_LENGTH, MAX_ATTEMPTS } from '../domain/types'

function typeGuess(game: ReturnType<typeof useGame>, digits: number[]) {
  digits.forEach((digit) => {
    expect(game.addDigit(digit)).toBe(true)
  })
}

function submit(game: ReturnType<typeof useGame>, digits: number[]) {
  typeGuess(game, digits)
  return game.submitGuess()
}

/** A wrong guess with unique digits: left-rotate the secret so it can never match. */
function wrongGuess(game: ReturnType<typeof useGame>): number[] {
  const [first, ...rest] = game.state.secret
  return [...rest, first]
}

const emptyTiles = () => Array.from({ length: CODE_LENGTH }, () => null)

describe('useGame — fixed board', () => {
  it('starts with seven fixed, empty rows', () => {
    const game = useGame()

    expect(game.state.rows).toHaveLength(MAX_ATTEMPTS)
    game.state.rows.forEach((row, index) => {
      expect(row.index).toBe(index)
      expect(row.guess).toEqual(emptyTiles())
      expect(row.colors).toBeNull()
      expect(row.notes).toEqual(emptyTiles())
      expect(row.cursor).toBe(0)
    })

    expect(game.state.status).toBe('playing')
    expect(game.activeRowIndex.value).toBe(0)
    expect(game.activeSlotIndex.value).toBe(0)
  })

  it('rejects a digit that is already in the active row', () => {
    const game = useGame()

    expect(game.addDigit(5)).toBe(true)
    expect(game.addDigit(5)).toBe(false)
    expect(game.state.rows[0]?.guess).toEqual([5, null, null, null])
  })

  it('does not consume an attempt for an incomplete guess', () => {
    const game = useGame()
    typeGuess(game, [1, 2])

    expect(game.submitGuess()).toBe('incomplete')
    expect(game.state.rows[0]?.colors).toBeNull()
    expect(game.activeRowIndex.value).toBe(0)
  })

  it('submits into its own row, reveals counts, and advances the active row', () => {
    const game = useGame()
    const wrong = wrongGuess(game)

    expect(submit(game, wrong)).toBe('accepted')
    expect(game.state.rows[0]?.guess).toEqual(wrong)
    expect(game.state.rows[0]?.colors).not.toBeNull()
    expect(game.state.rows[0]?.colors).toHaveLength(CODE_LENGTH)
    expect(game.state.rows[0]?.notes).toEqual(emptyTiles())
    expect(game.activeRowIndex.value).toBe(1)

    typeGuess(game, [0, 1, 2, 3])
    expect(game.state.rows[1]?.guess).toEqual([0, 1, 2, 3])
    expect(game.state.rows[0]?.guess).toEqual(wrong)
  })

  it('wins when the guess matches the secret and locks the board', () => {
    const game = useGame()
    const guess = [...game.state.secret]

    expect(submit(game, guess)).toBe('accepted')
    expect(game.state.status).toBe('won')
    expect(game.state.rows[0]?.colors).toEqual(['green', 'green', 'green', 'green'])
    expect(game.activeRowIndex.value).toBe(-1)

    expect(game.addDigit(1)).toBe(false)
    expect(game.removeDigit()).toBe(false)
    expect(game.submitGuess()).toBe('ignored')
  })

  it('loses after the seventh wrong attempt', () => {
    const game = useGame()

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      expect(submit(game, wrongGuess(game))).toBe('accepted')
    }

    expect(game.state.status).toBe('lost')
    expect(game.state.rows.every((row) => row.colors !== null)).toBe(true)
    expect(game.activeRowIndex.value).toBe(-1)
  })

  it('moves the cursor to the next row after a submission', () => {
    const game = useGame()
    submit(game, wrongGuess(game))

    expect(game.activeRowIndex.value).toBe(1)
    expect(game.state.rows[1]?.cursor).toBe(0)
  })
})

describe('useGame — cursor and underscore', () => {
  it('advances the cursor on typing and supports gaps via moveCursor', () => {
    const game = useGame()

    expect(game.addDigit(1)).toBe(true)
    expect(game.activeSlotIndex.value).toBe(1)

    expect(game.moveCursor()).toBe(true)
    expect(game.activeSlotIndex.value).toBe(2)

    expect(game.addDigit(2)).toBe(true)
    expect(game.state.rows[0]?.guess).toEqual([1, null, 2, null])
    expect(game.submitGuess()).toBe('incomplete')
  })

  it('clamps the cursor on the last block', () => {
    const game = useGame()

    for (let step = 0; step < 6; step += 1) {
      game.moveCursor()
    }

    expect(game.activeSlotIndex.value).toBe(3)
    expect(game.moveCursor()).toBe(false)
  })

  it('backspace clears at the cursor or steps left when empty', () => {
    const game = useGame()
    typeGuess(game, [1, 2])
    expect(game.activeSlotIndex.value).toBe(2)

    game.moveCursor()
    expect(game.removeDigit()).toBe(true)
    expect(game.state.rows[0]?.guess).toEqual([1, null, null, null])
    expect(game.activeSlotIndex.value).toBe(1)

    expect(game.removeDigit()).toBe(true)
    expect(game.state.rows[0]?.guess).toEqual(emptyTiles())
  })

  it('ignores cursor movement and typing once the game is over', () => {
    const game = useGame()
    submit(game, [...game.state.secret])

    expect(game.state.status).toBe('won')
    expect(game.moveCursor()).toBe(false)
  })
})

describe('useGame — annotations', () => {
  it('cycles a submitted tile: none → red → yellow → green → none', () => {
    const game = useGame()
    submit(game, wrongGuess(game))

    const note = () => game.state.rows[0]?.notes[0]

    game.cycleNote(0, 0)
    expect(note()).toBe('red')
    game.cycleNote(0, 0)
    expect(note()).toBe('yellow')
    game.cycleNote(0, 0)
    expect(note()).toBe('green')
    game.cycleNote(0, 0)
    expect(note()).toBeNull()
  })

  it('ignores annotations on unsubmitted rows and invalid indexes', () => {
    const game = useGame()

    game.cycleNote(0, 0)
    expect(game.state.rows[0]?.notes).toEqual(emptyTiles())

    submit(game, wrongGuess(game))
    game.cycleNote(1, 0)
    expect(game.state.rows[1]?.notes).toEqual(emptyTiles())
    game.cycleNote(99, 0)
    game.cycleNote(0, 99)
    expect(game.state.rows[0]?.notes).toEqual(emptyTiles())
  })

  it('persists notes across later submissions and after game over', () => {
    const game = useGame()

    submit(game, wrongGuess(game))
    game.cycleNote(0, 0)
    game.cycleNote(0, 0)
    expect(game.state.rows[0]?.notes[0]).toBe('yellow')

    submit(game, wrongGuess(game))
    expect(game.state.rows[0]?.notes[0]).toBe('yellow')

    for (let attempt = 2; attempt < MAX_ATTEMPTS; attempt += 1) {
      submit(game, wrongGuess(game))
    }
    expect(game.state.status).toBe('lost')

    game.cycleNote(0, 0)
    expect(game.state.rows[0]?.notes[0]).toBe('green')
  })

  it('clears notes and rebuilds the board on reset', () => {
    const game = useGame()
    submit(game, wrongGuess(game))
    game.cycleNote(0, 0)

    game.resetGame()

    expect(game.state.status).toBe('playing')
    expect(game.state.rows).toHaveLength(MAX_ATTEMPTS)
    expect(game.state.rows.every((row) => row.colors === null)).toBe(true)
    expect(game.state.rows.every((row) => row.notes.every((note) => note === null))).toBe(true)
    expect(new Set(game.state.secret).size).toBe(CODE_LENGTH)
    expect(game.activeRowIndex.value).toBe(0)
  })
})
