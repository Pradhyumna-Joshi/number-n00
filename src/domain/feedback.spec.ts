import { describe, expect, it } from 'vitest'
import { countByColor, evaluateGuess } from './feedback'

describe('evaluateGuess', () => {
  it('marks an exact match as all green', () => {
    expect(evaluateGuess([0, 4, 7, 2], [0, 4, 7, 2])).toEqual(['green', 'green', 'green', 'green'])
  })

  it('marks digits in the secret at another position as yellow', () => {
    expect(evaluateGuess([7, 1, 2, 3], [1, 2, 3, 4])).toEqual([
      'red',
      'yellow',
      'yellow',
      'yellow',
    ])
  })

  it('marks digits missing from the secret as red', () => {
    expect(evaluateGuess([5, 6, 7, 8], [1, 2, 3, 4])).toEqual(['red', 'red', 'red', 'red'])
  })

  it('mixes green, yellow, and red per position', () => {
    expect(evaluateGuess([4, 7, 9, 2], [0, 4, 7, 2])).toEqual([
      'yellow',
      'yellow',
      'red',
      'green',
    ])
  })

  it('handles a leading zero secret', () => {
    expect(evaluateGuess([0, 1, 9, 8], [0, 1, 7, 2])).toEqual([
      'green',
      'green',
      'red',
      'red',
    ])
  })
})

describe('countByColor', () => {
  it('counts digits per bucket', () => {
    const colors = evaluateGuess([4, 7, 9, 2], [0, 4, 7, 2])

    expect(countByColor(colors)).toEqual({ green: 1, yellow: 2, red: 1 })
  })

  it('counts an all-green guess', () => {
    expect(countByColor(evaluateGuess([0, 4, 7, 2], [0, 4, 7, 2]))).toEqual({
      green: 4,
      yellow: 0,
      red: 0,
    })
  })

  it('always sums to the number of digits', () => {
    const colors = evaluateGuess([5, 6, 7, 8], [1, 2, 3, 4])
    const counts = countByColor(colors)

    expect(counts.green + counts.yellow + counts.red).toBe(4)
  })
})
