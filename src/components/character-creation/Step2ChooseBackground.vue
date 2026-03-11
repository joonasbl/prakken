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
    <p class="subtitle is-5 mb-5">
      Valitse hahmollesi tausta. Tausta antaa bonuksia ominaisuuksiin ja taitoihin.
    </p>

    <div class="columns is-multiline">
      <div class="column is-4" v-for="bg in wizardStore.availableBackgrounds" :key="bg.id">
        <div 
          class="card background-card"
          :class="{ 'is-selected': wizardStore.draft.background?.id === bg.id }"
          @click="selectBackground(bg.id)"
        >
          <div class="card-content">
            <div class="content">
              <h3 class="title is-4 mb-2">{{ bg.name }}</h3>
              <p class="is-size-7 mb-3">{{ bg.description }}</p>
              
              <div v-if="Object.keys(bg.statBonuses).length > 0" class="mb-3">
                <strong class="is-size-7 has-text-dark">Ominaisuusbonukset:</strong>
                <ul class="is-size-7 mt-1 mb-0">
                  <li v-for="(bonus, stat) in bg.statBonuses" :key="stat">
                    <span class="tag is-info is-light is-small mr-1">{{ bonus >= 0 ? '+' : '' }}{{ bonus }} {{ stat }}</span>
                  </li>
                </ul>
              </div>
              
              <div v-if="Object.keys(bg.skillBonuses).length > 0">
                <strong class="is-size-7 has-text-dark">Taidot:</strong>
                <div class="tags are-small mt-1">
                  <span class="tag is-success is-light" v-for="(bonus, skill) in bg.skillBonuses" :key="skill">
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
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

.background-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  border: 2px solid transparent;
}

.background-card:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.background-card.is-selected {
  border-color: #27ae60;
  background-color: #e8f8f5;
}
</style>
