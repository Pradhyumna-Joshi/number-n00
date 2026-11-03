<script setup lang="ts">
const props = defineProps<{
  usedDigits: Set<number>
  playing: boolean
}>()

const emit = defineEmits<{
  digit: [value: number]
  moveForward: []
  backspace: []
  enter: []
}>()

const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const
</script>

<template>
  <div class="keypad" :class="{ 'keypad--disabled': !props.playing }">
    <button
      v-for="key in keys"
      :key="key"
      type="button"
      class="key"
      :class="{ 'key--used': props.usedDigits.has(key) }"
      :aria-disabled="!props.playing || props.usedDigits.has(key)"
      @click="emit('digit', key)"
    >
      {{ key }}
    </button>

    <button
      type="button"
      class="key key--action key--cursor"
      aria-label="Move to the next block"
      :aria-disabled="!props.playing"
      @click="emit('moveForward')"
    >
      _
    </button>

    <button
      type="button"
      class="key key--action"
      aria-label="Delete last digit"
      :aria-disabled="!props.playing"
      @click="emit('backspace')"
    >
      ⌫
    </button>

    <button
      type="button"
      class="key key--action key--enter"
      aria-label="Submit guess"
      :aria-disabled="!props.playing"
      @click="emit('enter')"
    >
      ⏎
    </button>
  </div>
</template>

<style scoped>
.keypad {
  display: none;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
}

/* Touch devices and narrow screens only — desktop uses the physical keyboard. */
@media (max-width: 720px), (pointer: coarse) {
  .keypad {
    display: grid;
  }
}

.key {
  appearance: none;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--surface-2);
  color: var(--text);
  font-family: var(--mono);
  font-size: 20px;
  font-weight: 700;
  padding: 12px 0;
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.3);
  transition:
    transform 0.1s ease,
    background 0.15s ease,
    opacity 0.15s ease;
  touch-action: manipulation;
}

.key:active {
  transform: translateY(2px);
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.3);
}

.key--used {
  opacity: 0.32;
}

.key--action {
  grid-column: span 3;
}

.key--cursor {
  grid-column: span 2;
  font-size: 22px;
}

.key--enter {
  background: var(--accent);
  border-color: var(--accent);
  color: #0d1020;
}

.keypad--disabled .key {
  opacity: 0.3;
  pointer-events: none;
}
</style>
