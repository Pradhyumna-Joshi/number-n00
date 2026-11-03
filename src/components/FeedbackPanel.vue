<script setup lang="ts">
import type { FeedbackColor } from '../domain/types'

const props = defineProps<{
  color: FeedbackColor
  label: string
  count: number | null
}>()

const description = (): string =>
  props.count === null ? `${props.label}: waiting for a guess` : `${props.label}: ${props.count}`
</script>

<template>
  <div
    class="panel"
    :class="[`panel--${props.color}`, { 'panel--pending': props.count === null }]"
    role="img"
    :aria-label="description()"
    :title="description()"
  >
    <span class="panel__count">{{ props.count ?? '–' }}</span>
  </div>
</template>

<style scoped>
.panel {
  --panel-color: var(--border);
  display: grid;
  place-items: center;
  width: var(--tile-size);
  height: var(--tile-size);
  border: 1px solid transparent;
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--panel-color) 88%, white),
    var(--panel-color)
  );
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.22);
}

.panel--green {
  --panel-color: var(--green);
}

.panel--yellow {
  --panel-color: var(--yellow);
}

.panel--red {
  --panel-color: var(--red);
}

.panel--pending {
  background: color-mix(in srgb, var(--panel-color) 8%, var(--surface));
  border: 1px dashed color-mix(in srgb, var(--panel-color) 32%, transparent);
  box-shadow: none;
}

.panel__count {
  color: #0d1020;
  font-family: var(--mono);
  font-size: clamp(16px, calc(var(--tile-size) * 0.42), 22px);
  font-weight: 800;
  line-height: 1;
}

.panel--pending .panel__count {
  color: var(--muted);
  font-weight: 600;
}
</style>
