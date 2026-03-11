<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import type { Attr } from '@/types/attributes'

const wizardStore = useCharacterCreationStore()

// Roll 4d6 and drop the lowest die
const roll4d6DropLowest = (): number => {
  const rolls: number[] = []
  for (let i = 0; i < 4; i++) {
    rolls.push(Math.floor(Math.random() * 6) + 1)
  }
  // Sort and remove the lowest
  rolls.sort((a, b) => a - b)
  return rolls[1] + rolls[2] + rolls[3]
}

const rollStats = () => {
  const newAttributes: Attr[] = wizardStore.draft.attributes.map((attr) => ({
    ...attr,
    value: roll4d6DropLowest(),
  }))
  wizardStore.setAttributes(newAttributes)
}

const totalPoints = computed(() =>
  wizardStore.draft.attributes.reduce((sum, attr) => sum + attr.value, 0)
)

const updateAttribute = (name: string, delta: number) => {
  const attr = wizardStore.draft.attributes.find((a) => a.name === name)
  if (!attr) return
  const newValue = attr.value + delta
  if (newValue >= 3 && newValue <= 18) {
    wizardStore.setAttribute(name, newValue)
  }
}
</script>

<template>
  <div class="roll-stats">
    <p class="description">
      Heitä ominaisuusluvut tai määritä ne manuaalisisesti. Arvot välillä 3-18.
    </p>

    <div class="stats-grid">
      <div
        v-for="attr in wizardStore.draft.attributes"
        :key="attr.name"
        class="stat-row"
      >
        <span class="stat-name">{{ attr.name }}</span>
        <div class="stat-controls">
          <button
            type="button"
            class="stat-btn"
            @click="updateAttribute(attr.name, -1)"
          >
            -
          </button>
          <span class="stat-value">{{ attr.value }}</span>
          <button
            type="button"
            class="stat-btn"
            @click="updateAttribute(attr.name, 1)"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <div class="stats-summary">
      <span>Yhteensä: {{ totalPoints }}</span>
      <button type="button" class="roll-button" @click="rollStats">
        Heitä uudelleen
      </button>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.roll-stats {
  padding: 1rem 0;
}

.description {
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-row:hover {
  border-color: var(--border-gold);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.stat-name {
  font-weight: 600;
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.stat-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.stat-btn:hover {
  background: linear-gradient(135deg, #5a9fe9 0%, #4589c9 100%);
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.5);
  transform: translateY(-1px);
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  min-width: 2rem;
  text-align: center;
  color: var(--color-magic-blue);
  text-shadow: 0 0 8px rgba(74, 144, 217, 0.4);
}

.stats-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.roll-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #2ea043 0%, #248a38 100%);
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(46, 160, 67, 0.3);
}

.roll-button:hover {
  background: linear-gradient(135deg, #3eb053 0%, #2e9a48 100%);
  box-shadow: 0 4px 16px rgba(46, 160, 67, 0.5);
  transform: translateY(-1px);
}
</style>
