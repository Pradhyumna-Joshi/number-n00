<script setup lang="ts">
import type { DigitTuple, GameStatus } from '../domain/types'

const props = defineProps<{
  status: Extract<GameStatus, 'won' | 'lost'>
  secret: DigitTuple
  attemptsUsed: number
}>()

const emit = defineEmits<{
  playAgain: []
}>()
</script>

<template>
  <section class="banner" :class="`banner--${props.status}`" role="status" aria-live="polite">
    <p class="banner__headline">
      {{ props.status === 'won' ? '🎉 You cracked it!' : '💀 Out of attempts' }}
    </p>

    <p class="banner__summary">
      <template v-if="props.status === 'won'">
        Solved in {{ props.attemptsUsed }} {{ props.attemptsUsed === 1 ? 'attempt' : 'attempts' }}.
      </template>
      <template v-else> The number got away this time. </template>
    </p>

    <p class="banner__secret">
      <span class="banner__secret-label">The number was</span>
      <span class="banner__secret-digits">{{ props.secret.join('') }}</span>
    </p>

    <button type="button" class="banner__again" @click="emit('playAgain')">Play again</button>
  </section>
</template>

<style scoped>
.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 16px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  animation: pop 0.3s ease both;
}

.banner--won {
  border-color: color-mix(in srgb, var(--green) 60%, transparent);
  background: color-mix(in srgb, var(--green) 10%, var(--surface));
}

.banner--lost {
  border-color: color-mix(in srgb, var(--red) 55%, transparent);
  background: color-mix(in srgb, var(--red) 8%, var(--surface));
}

.banner__headline {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-h);
}

.banner__summary {
  font-size: 14px;
  color: var(--muted);
}

.banner__secret {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.banner__secret-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.banner__secret-digits {
  font-family: var(--mono);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--text-h);
}

.banner__again {
  margin-top: 8px;
  appearance: none;
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  background: var(--accent);
  color: #0d1020;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease;
}

.banner__again:active {
  transform: translateY(2px);
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
