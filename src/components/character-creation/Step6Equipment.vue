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
      <div
        v-for="item in wizardStore.starterEquipment"
        :key="item.id"
        class="equipment-card"
        :class="{ selected: hasEquipment(item.id) }"
        @click="toggleEquipment(item.id)"
      >
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
.equipment-step {
  padding: 1rem 0;
}

.equipment-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 1rem;
}

.equipment-summary strong {
  color: #3498db;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.equipment-card {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.equipment-card:hover {
  border-color: #3498db;
}

.equipment-card.selected {
  border-color: #27ae60;
  background-color: #e8f8f5;
}

.equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.equipment-name {
  font-weight: 600;
  color: #2c3e50;
}

.equipment-category {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background-color: #ecf0f1;
  border-radius: 4px;
  color: #666;
}

.equipment-description {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.75rem;
}

.equipment-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #27ae60;
}
</style>
