<script setup lang="ts">
import { computed } from 'vue'
import { countByColor } from '../domain/feedback'
import type { GuessRow } from '../domain/types'
import DigitInput from './DigitInput.vue'
import FeedbackPanel from './FeedbackPanel.vue'

const props = defineProps<{
  row: GuessRow
  rowNumber: number
  active: boolean
  activeSlot: number
  shakeKey: number
}>()

const emit = defineEmits<{
  annotate: [rowIndex: number, tileIndex: number]
}>()

const counts = computed(() => (props.row.colors ? countByColor(props.row.colors) : null))
</script>

<template>
  <div class="row" :class="{ 'row--active': props.active }">
    <span class="row__number">{{ props.rowNumber }}</span>

    <div
      :key="props.active ? props.shakeKey : 'locked'"
      class="row__digits"
      :class="{ 'row__digits--shake': props.active && props.shakeKey > 0 }"
    >
      <DigitInput
        v-for="(digit, index) in props.row.guess"
        :key="index"
        :value="digit"
        :active="props.active && index === props.activeSlot"
        :note="props.row.notes[index] ?? null"
        :annotatable="props.row.colors !== null"
        @annotate="emit('annotate', props.row.index, index)"
      />
    </div>

    <div class="row__panels">
      <FeedbackPanel color="green" label="Right spot" :count="counts?.green ?? null" />
      <FeedbackPanel color="yellow" label="Wrong spot" :count="counts?.yellow ?? null" />
      <FeedbackPanel color="red" label="Not in secret" :count="counts?.red ?? null" />
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 6px;
  border-radius: 12px;
  border: 1px solid transparent;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.row--active {
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  border-color: color-mix(in srgb, var(--accent) 28%, transparent);
}

.row__number {
  flex: 0 0 14px;
  text-align: right;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
}

.row__digits {
  display: flex;
  gap: var(--tile-gap);
}

.row__digits--shake {
  animation: shake 0.35s ease;
}

.row__panels {
  display: flex;
  gap: var(--tile-gap);
  margin-left: auto;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(7px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(3px);
  }
}
</style>
