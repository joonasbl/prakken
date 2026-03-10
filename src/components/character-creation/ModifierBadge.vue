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
.modifier-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.modifier-badge.positive {
  background-color: #d5f5e3;
  color: #27ae60;
}

.modifier-badge.negative {
  background-color: #fadbd8;
  color: #e74c3c;
}

.modifier-source {
  font-size: 0.65rem;
  font-weight: 400;
  opacity: 0.8;
}
</style>
