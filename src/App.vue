<script setup lang="ts">
import { ref } from 'vue'
import GameBoard from './components/GameBoard.vue'

const rulesOpen = ref(true)
</script>

<template>
  <main class="shell">
    <header class="shell__header">
      <h1 class="shell__title">Number <span>400</span></h1>
      <p class="shell__subtitle">
        Guess the secret 4-digit number in 7 attempts. Every digit is unique.
      </p>
    </header>

    <section class="rules" :class="{ 'rules--open': rulesOpen }" aria-label="How to play">
      <button
        type="button"
        class="rules__toggle"
        :aria-expanded="rulesOpen"
        aria-controls="rules-content"
        @click="rulesOpen = !rulesOpen"
      >
        <span class="rules__icon" aria-hidden="true">ℹ</span>
        <span class="rules__title">How to play</span>
        <span
          class="rules__chevron"
          :class="{ 'rules__chevron--open': rulesOpen }"
          aria-hidden="true"
          >⌄</span
        >
      </button>

      <div v-show="rulesOpen" id="rules-content" class="rules__body">
        <ul class="rules__list">
          <li>
            Guess a 4-digit number — all four digits are unique (0–9, leading zero
            allowed).
          </li>
          <li>
            You get 7 attempts. Press Enter to submit a full row; incomplete rows are
            blocked.
          </li>
          <li>
            Count blocks:
            <span class="rules__legend"
              ><span class="rules__swatch rules__swatch--green" />right spot</span
            >
            <span class="rules__legend"
              ><span class="rules__swatch rules__swatch--yellow" />wrong spot</span
            >
            <span class="rules__legend"
              ><span class="rules__swatch rules__swatch--red" />not in secret</span
            >
          </li>
          <li>Click any submitted digit to cycle your own notes: red → yellow → green → none.</li>
          <li><kbd>_</kbd> moves to the next block; <kbd>⌫</kbd> deletes the current one.</li>
        </ul>
      </div>
    </section>

    <GameBoard />

    <footer class="shell__footer">
      <p>Type with your keyboard · tap the keypad on mobile</p>
    </footer>
  </main>
</template>

<style scoped>
.shell {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 44px 20px 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  min-height: 100svh;
}

.shell__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shell__title {
  margin: 0;
  font-size: clamp(40px, 12vw, 58px);
  line-height: 1;
  letter-spacing: -1.5px;
  font-weight: 800;
  color: var(--text-h);
}

.shell__title span {
  background: linear-gradient(135deg, var(--accent), #c084fc);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.shell__subtitle {
  margin: 4px auto 0;
  max-width: 380px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
}

.rules {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--surface) 75%, transparent);
  overflow: hidden;
}

.rules__toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  cursor: pointer;
}

.rules__icon {
  font-size: 15px;
  line-height: 1;
  color: var(--accent);
}

.rules__title {
  flex: 1;
  text-align: left;
}

.rules__chevron {
  font-size: 14px;
  color: var(--muted);
  transition: transform 0.2s ease;
}

.rules__chevron--open {
  transform: rotate(180deg);
}

.rules__body {
  padding: 0 14px 12px;
}

.rules__list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted);
}

.rules__list li::marker {
  color: var(--accent);
}

.rules__legend {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 10px;
  white-space: nowrap;
}

.rules__swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}

.rules__swatch--green {
  background: var(--green);
}

.rules__swatch--yellow {
  background: var(--yellow);
}

.rules__swatch--red {
  background: var(--red);
}

.rules__list kbd {
  font-family: var(--mono);
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
}

.shell__footer {
  margin-top: auto;
  padding-top: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--muted);
}

.shell__footer p {
  margin: 0;
}
</style>
