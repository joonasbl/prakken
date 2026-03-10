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
                {{ bonus >= 0 ? '+' : '' }}{{ bonus }} {{ stat }}
              </li>
            </ul>
          </div>
          <div v-if="Object.keys(bg.skillBonuses).length > 0" class="bonus-section">
            <strong>Taidot:</strong>
            <ul>
              <li v-for="(bonus, skill) in bg.skillBonuses" :key="skill">
                {{ skill }}
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
  color: #34495e;
  font-weight: 500;
}

.backgrounds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.background-card {
  padding: 1.25rem;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #ffffff;
}

.background-card:hover {
  border-color: #3498db;
  background-color: #ecf0f1;
}

.background-card.selected {
  border-color: #27ae60;
  background-color: #e8f8f5;
}

.background-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1a252f;
}

.background-description {
  color: #34495e;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.background-bonuses {
  font-size: 0.9rem;
  color: #2c3e50;
}

.bonus-section {
  margin-bottom: 0.5rem;
}

.bonus-section strong {
  color: #1a252f;
  font-weight: 600;
}

.bonus-section ul {
  margin: 0.25rem 0 0 1rem;
  padding: 0;
}

.bonus-section li {
  color: #1a252f;
  padding: 0.2rem 0;
}
</style>
