<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useGame } from '../composables/useGame'
import { MAX_ATTEMPTS } from '../domain/types'
import GameResultBanner from './GameResultBanner.vue'
import GuessRow from './GuessRow.vue'
import Keypad from './Keypad.vue'

const {
  state,
  attemptsUsed,
  activeRowIndex,
  activeSlotIndex,
  usedDigits,
  addDigit,
  moveCursor,
  removeDigit,
  submitGuess,
  cycleNote,
  resetGame,
} = useGame()

const hint = ref('')
const shakeKey = ref(0)
let hintTimer: ReturnType<typeof setTimeout> | undefined

function nudge(message: string): void {
  hint.value = message
  shakeKey.value += 1

  if (hintTimer) clearTimeout(hintTimer)
  hintTimer = setTimeout(() => {
    hint.value = ''
  }, 1800)
}

function handleDigit(digit: number): void {
  if (state.status !== 'playing') return

  if (usedDigits.value.has(digit)) {
    nudge(`${digit} is already in this guess`)
    return
  }

  addDigit(digit)
}

function handleBackspace(): void {
  removeDigit()
}

function handleEnter(): void {
  const result = submitGuess()

  if (result === 'incomplete') {
    nudge('Fill all 4 blocks first')
  } else if (result === 'accepted') {
    hint.value = ''
    shakeKey.value = 0
  }
}

function handleAnnotate(rowIndex: number, tileIndex: number): void {
  cycleNote(rowIndex, tileIndex)
}

function handlePlayAgain(): void {
  hint.value = ''
  shakeKey.value = 0
  resetGame()
}

/** Native buttons keep their keyboard activation (Enter must not be hijacked). */
function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest('button, a, input, select, textarea, [role="button"]'))
  )
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.metaKey || event.ctrlKey || event.altKey) return

  if (/^\d$/.test(event.key)) {
    event.preventDefault()
    handleDigit(Number(event.key))
    return
  }

  if (event.key === 'Backspace') {
    event.preventDefault()
    handleBackspace()
    return
  }

  if (event.key === '_') {
    event.preventDefault()
    moveCursor()
    return
  }

  if (event.key === 'Enter') {
    if (isInteractiveTarget(event.target)) return
    event.preventDefault()
    handleEnter()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (hintTimer) clearTimeout(hintTimer)
})
</script>

<template>
  <section class="game">
    <div class="status">
      <div class="status__row">
        <span v-if="state.status === 'playing'" class="status__label">
          Attempt {{ attemptsUsed + 1 }} / {{ MAX_ATTEMPTS }}
        </span>
        <span v-else class="status__label">
          Used {{ attemptsUsed }} / {{ MAX_ATTEMPTS }} attempts
        </span>
        <span class="status__dot" :class="`status__dot--${state.status}`" />
      </div>
      <div class="status__track">
        <div class="status__fill" :style="{ width: `${(attemptsUsed / MAX_ATTEMPTS) * 100}%` }" />
      </div>
    </div>

    <div class="board" aria-label="Guess board">
      <GuessRow
        v-for="(row, index) in state.rows"
        :key="row.index"
        :row="row"
        :row-number="index + 1"
        :active="state.status === 'playing' && index === activeRowIndex"
        :active-slot="activeSlotIndex"
        :shake-key="index === activeRowIndex ? shakeKey : 0"
        @annotate="handleAnnotate"
      />
    </div>

    <p v-if="state.status === 'playing'" class="hint" aria-live="polite">{{ hint || '\u00a0' }}</p>

    <GameResultBanner
      v-if="state.status !== 'playing'"
      :status="state.status"
      :secret="state.secret"
      :attempts-used="attemptsUsed"
      @play-again="handlePlayAgain"
    />

    <Keypad
      v-if="state.status === 'playing'"
      :used-digits="usedDigits"
      :playing="state.status === 'playing'"
      @digit="handleDigit"
      @move-forward="moveCursor"
      @backspace="handleBackspace"
      @enter="handleEnter"
    />
  </section>
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status__label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--muted);
}

.status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.status__dot--won {
  background: var(--green);
  box-shadow: 0 0 10px var(--green);
}

.status__dot--lost {
  background: var(--red);
  box-shadow: 0 0 10px var(--red);
}

.status__track {
  height: 6px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}

.status__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), #a78bfa);
  transition: width 0.3s ease;
}

.board {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hint {
  min-height: 20px;
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: var(--yellow);
}
</style>
