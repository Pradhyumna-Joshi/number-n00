export const CODE_LENGTH = 4
export const MAX_ATTEMPTS = 7

export type FeedbackColor = 'green' | 'yellow' | 'red'

/** A player-drawn annotation on a submitted digit tile. `null` = uncolored. */
export type Note = FeedbackColor | null

export type DigitTuple = [number, number, number, number]

export interface GuessRow {
  index: number
  guess: (number | null)[]
  colors: FeedbackColor[] | null
  notes: Note[]
  cursor: number
}

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  secret: DigitTuple
  rows: GuessRow[]
  status: GameStatus
}
