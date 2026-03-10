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
.roll-stats {
  padding: 1rem 0;
}

.description {
  margin-bottom: 1.5rem;
  color: #666;
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
  background-color: #f8f9fa;
  border-radius: 4px;
}

.stat-name {
  font-weight: 600;
  color: #2c3e50;
}

.stat-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.2rem;
}

.stat-btn:hover {
  background-color: #2980b9;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  min-width: 2rem;
  text-align: center;
}

.stats-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.roll-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #27ae60;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.roll-button:hover {
  background-color: #229954;
}
</style>
