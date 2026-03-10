<script setup lang="ts">
import { useCharacterCreationStore } from '@/stores/characterCreation'

const wizardStore = useCharacterCreationStore()

const selectBackground = (id: string) => {
  const background = wizardStore.availableBackgrounds.find((b) => b.id === id)
  if (background) {
    wizardStore.setBackground(background)
  }
}
</script>

<template>
  <div class="choose-background">
    <p class="description">
      Valitse hahmollesi tausta. Tausta antaa bonuksia ominaisuuksiin ja taitoihin.
    </p>

    <div class="backgrounds-grid">
      <div
        v-for="bg in wizardStore.availableBackgrounds"
        :key="bg.id"
        class="background-card"
        :class="{ selected: wizardStore.draft.background?.id === bg.id }"
        @click="selectBackground(bg.id)"
      >
        <h3 class="background-name">{{ bg.name }}</h3>
        <p class="background-description">{{ bg.description }}</p>
        <div class="background-bonuses">
          <div v-if="Object.keys(bg.statBonuses).length > 0" class="bonus-section">
            <strong>Ominaisuusbonukset:</strong>
            <ul>
              <li v-for="(bonus, stat) in bg.statBonuses" :key="stat">
                +{{ bonus }} {{ stat }}
              </li>
            </ul>
          </div>
          <div v-if="Object.keys(bg.skillBonuses).length > 0" class="bonus-section">
            <strong>Taitobonukset:</strong>
            <ul>
              <li v-for="(bonus, skill) in bg.skillBonuses" :key="skill">
                +{{ bonus }} {{ skill }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.choose-background {
  padding: 1rem 0;
}

.description {
  margin-bottom: 1.5rem;
  color: #666;
}

.backgrounds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.background-card {
  padding: 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.background-card:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.background-card.selected {
  border-color: #27ae60;
  background-color: #e8f8f5;
}

.background-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.background-description {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.background-bonuses {
  font-size: 0.85rem;
}

.bonus-section {
  margin-bottom: 0.5rem;
}

.bonus-section ul {
  margin: 0.25rem 0 0 1rem;
  padding: 0;
}

.bonus-section li {
  color: #27ae60;
}
</style>
