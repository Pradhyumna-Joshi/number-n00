import { CODE_LENGTH, type DigitTuple } from './types'

/**
 * Fisher–Yates shuffle of the digits 0–9. Accepts an injectable random source
 * so the generator can be unit-tested deterministically.
 */
export function shuffleDigits(random: () => number = Math.random): number[] {
  const pool = Array.from({ length: 10 }, (_, index) => index)

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool
}

/**
 * Picks 4 distinct digits from 0–9 without replacement.
 * Leading zeroes are valid (e.g. [0, 4, 7, 2]).
 */
export function generateSecret(random: () => number = Math.random): DigitTuple {
  const [a, b, c, d] = shuffleDigits(random).slice(0, CODE_LENGTH)
  return [a, b, c, d]
}
