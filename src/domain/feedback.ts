import type { FeedbackColor } from './types'

/**
 * Evaluates one guess against the secret.
 * Both arrays are expected to hold unique digits, so every guess digit lands
 * in exactly one bucket:
 *  - green: same digit, same position
 *  - yellow: digit exists in the secret but in another position
 *  - red: digit is not in the secret at all
 */
export function evaluateGuess(
  guess: readonly number[],
  secret: readonly number[],
): FeedbackColor[] {
  const secretDigits = new Set(secret)

  return guess.map((digit, index) => {
    if (digit === secret[index]) return 'green'
    return secretDigits.has(digit) ? 'yellow' : 'red'
  })
}

/** Counts how many digits fall into each feedback bucket. */
export function countByColor(
  colors: readonly FeedbackColor[],
): Record<FeedbackColor, number> {
  const counts: Record<FeedbackColor, number> = {
    green: 0,
    yellow: 0,
    red: 0,
  }

  colors.forEach((color) => {
    counts[color] += 1
  })

  return counts
}
