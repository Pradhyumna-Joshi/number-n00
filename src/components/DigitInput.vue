<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '../domain/types'

const props = defineProps<{
  value: number | null
  active: boolean
  note: Note
  annotatable: boolean
}>()

const emit = defineEmits<{
  annotate: []
}>()

const ariaLabel = computed(
  () => `Digit ${props.value}, note: ${props.note ?? 'none'} — click to cycle note`,
)
</script>

<template>
  <component
    :is="props.annotatable ? 'button' : 'div'"
    class="digit-input"
    :class="{
      'digit-input--active': props.active,
      'digit-input--filled': props.value !== null,
      'digit-input--annotatable': props.annotatable,
      ['digit-input--note-' + props.note]: props.note !== null,
    }"
    :type="props.annotatable ? 'button' : undefined"
    :aria-label="props.annotatable ? ariaLabel : undefined"
    :title="props.annotatable ? 'Click to cycle your note' : undefined"
    @click="props.annotatable && emit('annotate')"
  >
    {{ props.value ?? '' }}
  </component>
</template>

<style scoped>
.digit-input {
  display: grid;
  place-items: center;
  width: var(--tile-size);
  height: var(--tile-size);
  padding: 0;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-family: var(--mono);
  font-size: clamp(16px, calc(var(--tile-size) * 0.42), 22px);
  font-weight: 700;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    filter 0.15s ease,
    transform 0.1s ease;
}

.digit-input--filled {
  border-color: #3d4359;
}

.digit-input--active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}

.digit-input--annotatable {
  cursor: pointer;
}

.digit-input--annotatable:active {
  transform: translateY(1px);
}

@media (hover: hover) {
  .digit-input--annotatable:hover {
    filter: brightness(1.18);
  }
}

.digit-input--note-red {
  background: var(--red);
  border-color: var(--red);
  color: #0d1020;
}

.digit-input--note-yellow {
  background: var(--yellow);
  border-color: var(--yellow);
  color: #0d1020;
}

.digit-input--note-green {
  background: var(--green);
  border-color: var(--green);
  color: #0d1020;
}
</style>
