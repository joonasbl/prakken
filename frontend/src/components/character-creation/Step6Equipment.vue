<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'

const wizardStore = useCharacterCreationStore()

const hasEquipment = (id: string) =>
  wizardStore.draft.equipment.some((e) => e.id === id)

const toggleEquipment = (id: string) => {
  const equipment = wizardStore.starterEquipment.find((e) => e.id === id)
  if (equipment) {
    wizardStore.toggleEquipment(equipment)
  }
}

const totalWeight = computed(() =>
  wizardStore.draft.equipment.reduce((sum, e) => sum + e.weight, 0)
)

const totalCost = computed(() =>
  wizardStore.draft.equipment.reduce((sum, e) => sum + e.cost, 0)
)
</script>

<template>
  <div class="equipment-step">
    <div class="equipment-summary">
      <span>Yhteispaino: <strong>{{ totalWeight }}</strong></span>
      <span>Yhteishinta: <strong>{{ totalCost }}</strong> gp</span>
    </div>

    <div class="equipment-grid">
      <div v-for="item in wizardStore.starterEquipment" :key="item.id" class="equipment-card"
        :class="{ selected: hasEquipment(item.id) }" @click="toggleEquipment(item.id)">
        <div class="equipment-header">
          <span class="equipment-name">{{ item.name }}</span>
          <span class="equipment-category">{{ item.category }}</span>
        </div>
        <p class="equipment-description">{{ item.description }}</p>
        <div class="equipment-stats">
          <span>Paino: {{ item.weight }}</span>
          <span>Hinta: {{ item.cost }} gp</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.equipment-step {
  padding: 1rem 0;
}

.equipment-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  font-size: 1rem;
}

.equipment-summary strong {
  color: var(--color-magic-blue);
  text-shadow: 0 0 8px rgba(74, 144, 217, 0.4);
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.equipment-card {
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--gradient-card);
  box-shadow: var(--shadow-sm);
}

.equipment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
  opacity: 0.5;
}

.equipment-card:hover {
  border-color: var(--color-magic-blue);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), 0 0 10px rgba(74, 144, 217, 0.2);
}

.equipment-card.selected {
  border-color: var(--color-success);
  background: linear-gradient(135deg, rgba(46, 160, 67, 0.15) 0%, rgba(36, 138, 56, 0.05) 100%);
  box-shadow: var(--shadow-md), 0 0 15px rgba(46, 160, 67, 0.3);
}

.equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.equipment-name {
  font-weight: 600;
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.equipment-category {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  border: 1px solid var(--border-color);
}

.equipment-description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
}

.equipment-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-success);
}
</style>
