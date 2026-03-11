<script setup lang="ts">
defineProps<{
  modifier: number
  source: string
}>()
</script>

<template>
  <span class="modifier-badge" :class="modifier >= 0 ? 'positive' : 'negative'">
    {{ modifier >= 0 ? '+' : '' }}{{ modifier }}
    <span class="modifier-source">{{ source }}</span>
  </span>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.modifier-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
  border: 1px solid transparent;
}

.modifier-badge.positive {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-color: var(--color-success);
  box-shadow: 0 0 8px rgba(46, 160, 67, 0.3);
}

.modifier-badge.negative {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: var(--color-danger);
  box-shadow: 0 0 8px rgba(218, 54, 51, 0.3);
}

.modifier-source {
  font-size: 0.65rem;
  font-weight: 400;
  opacity: 0.9;
}
</style>
