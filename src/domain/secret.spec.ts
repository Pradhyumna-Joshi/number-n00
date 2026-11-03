import { describe, expect, it } from 'vitest'
import { generateSecret, shuffleDigits } from './secret'

describe('generateSecret', () => {
  it('returns exactly four digits', () => {
    const secret = generateSecret()
    expect(secret).toHaveLength(4)
  })

  it('never repeats a digit', () => {
    for (let run = 0; run < 250; run += 1) {
      const secret = generateSecret()
      expect(new Set(secret).size).toBe(4)
      secret.forEach((digit) => {
        expect(digit).toBeGreaterThanOrEqual(0)
        expect(digit).toBeLessThanOrEqual(9)
      })
    }
  })

  it('supports a deterministic random source', () => {
    expect(generateSecret(() => 0)).toEqual([1, 2, 3, 4])
    expect(generateSecret(() => 0.999999)).toEqual([0, 1, 2, 3])
  })

  it('allows leading zeroes', () => {
    expect(generateSecret(() => 0.5)).toEqual([0, 9, 1, 7])
  })
})

describe('shuffleDigits', () => {
  it('returns a permutation of 0–9', () => {
    const digits = shuffleDigits()
    expect(digits).toHaveLength(10)
    expect(new Set(digits)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
  })
})
