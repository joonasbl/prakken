<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'

const wizardStore = useCharacterCreationStore()

const MAX_SELECTIONS = 5

const hasAdvantage = (id: string) =>
  wizardStore.selectedAdvantages.some((a) => a.id === id)

const hasDisadvantage = (id: string) =>
  wizardStore.selectedDisadvantages.some((d) => d.id === id)

const canAddAdvantage = computed(() => {
  const advCount = wizardStore.selectedAdvantages.length
  const disCount = wizardStore.selectedDisadvantages.length
  // Can add advantage if under max and won't exceed disadvantages by more than 1
  return advCount < MAX_SELECTIONS && advCount <= disCount
})

const canAddDisadvantage = computed(() => {
  const advCount = wizardStore.selectedAdvantages.length
  const disCount = wizardStore.selectedDisadvantages.length
  // Can add disadvantage if under max and haven't exceeded advantages
  return disCount < MAX_SELECTIONS && disCount < advCount
})

const canRemoveAdvantage = computed(() => {
  const advCount = wizardStore.selectedAdvantages.length
  const disCount = wizardStore.selectedDisadvantages.length
  // Can remove if we have more advantages than disadvantages
  return advCount > disCount
})

const canRemoveDisadvantage = computed(() => {
  const advCount = wizardStore.selectedAdvantages.length
  const disCount = wizardStore.selectedDisadvantages.length
  // Can remove if we have more disadvantages than needed to match advantages
  return disCount > advCount
})

const toggleAdvantage = (id: string) => {
  const advantage = wizardStore.availableAdvantages.find((a) => a.id === id)
  if (!advantage) return

  const isSelected = hasAdvantage(id)
  if (isSelected) {
    if (canRemoveAdvantage.value) {
      wizardStore.toggleAdvantage(advantage)
    }
  } else {
    if (canAddAdvantage.value) {
      wizardStore.toggleAdvantage(advantage)
    }
  }
}

const toggleDisadvantage = (id: string) => {
  const disadvantage = wizardStore.availableDisadvantages.find((d) => d.id === id)
  if (!disadvantage) return

  const isSelected = hasDisadvantage(id)
  if (isSelected) {
    if (canRemoveDisadvantage.value) {
      wizardStore.toggleDisadvantage(disadvantage)
    }
  } else {
    if (canAddDisadvantage.value) {
      wizardStore.toggleDisadvantage(disadvantage)
    }
  }
}

const selectionStatus = computed(() => {
  const advCount = wizardStore.selectedAdvantages.length
  const disCount = wizardStore.selectedDisadvantages.length
  if (advCount === 0 && disCount === 0) {
    return { text: 'Valitse vähintään yksi etu ja yksi haitta', class: 'info' }
  }
  if (disCount < advCount) {
    return { text: `Valitse ${advCount - disCount} haittaa lisää`, class: 'warning' }
  }
  if (disCount === advCount) {
    return { text: 'Edut ja haitat tasapainossa', class: 'ok' }
  }
  return { text: 'Liikaa haittoja', class: 'warning' }
})
</script>

<template>
  <div class="adv-disadv">
    <div class="points-display">
      <span>Valittu: {{ wizardStore.selectedAdvantages.length }} etua / {{ wizardStore.selectedDisadvantages.length }} haittaa</span>
      <span :class="selectionStatus.class">
        {{ selectionStatus.text }}
      </span>
    </div>

    <div class="sections-container">
      <div class="section">
        <h3>Edut (max 5)</h3>
        <div class="options-grid">
          <div
            v-for="adv in wizardStore.availableAdvantages"
            :key="adv.id"
            class="option-card"
            :class="{
              selected: hasAdvantage(adv.id),
              'disabled': !canAddAdvantage && !hasAdvantage(adv.id),
            }"
            @click="toggleAdvantage(adv.id)"
          >
            <div class="option-header">
              <span class="option-name">{{ adv.name }}</span>
            </div>
            <p class="option-description">{{ adv.description }}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Haitat (max 5)</h3>
        <div class="options-grid">
          <div
            v-for="dis in wizardStore.availableDisadvantages"
            :key="dis.id"
            class="option-card disadvantage"
            :class="{ 
              selected: hasDisadvantage(dis.id),
              'disabled': !canAddDisadvantage && !hasDisadvantage(dis.id),
            }"
            @click="toggleDisadvantage(dis.id)"
          >
            <div class="option-header">
              <span class="option-name">{{ dis.name }}</span>
            </div>
            <p class="option-description">{{ dis.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adv-disadv {
  padding: 1rem 0;
}

.points-display {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-weight: 600;
}

.points-display .ok {
  color: #27ae60;
}

.points-display .warning {
  color: #e74c3c;
}

.points-display .info {
  color: #3498db;
}

.option-card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.option-card.disabled:hover {
  border-color: #e0e0e0;
}

.sections-container {
  display: grid;
  gap: 2rem;
}

.section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}

.option-card {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-card:hover {
  border-color: #3498db;
}

.option-card.selected {
  border-color: #27ae60;
  background-color: #e8f8f5;
}

.option-card.disadvantage.selected {
  border-color: #e74c3c;
  background-color: #fdedec;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-name {
  font-weight: 600;
  color: #2c3e50;
}

.option-description {
  font-size: 0.85rem;
  color: #666;
}
</style>
