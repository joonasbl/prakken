<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import type { SubStats } from '@/types/character'

const wizardStore = useCharacterCreationStore()

const calculateDerivedStats = () => {
  const attrs = wizardStore.draft.attributes
  const getAttr = (name: string) => attrs.find((a) => a.name === name)?.value || 10

  const voima = getAttr('Voima')
  const terveys = getAttr('Terveys')

  const subStats: SubStats = {
    veripisteet: terveys + voima,
    vauriobonus: Math.floor(voima / 2),
    syvaHaava: Math.floor(terveys / 2),
    kantokyky: voima * 2,
  }

  wizardStore.setSubStats(subStats)
}

const hasSubStats = computed(() => wizardStore.draft.subStats !== null)
</script>

<template>
  <div class="sub-stats">
    <p class="description">
      Johdannaiset arvot lasketaan ominaisuuksista. Nämä kuvaavat hahmosi peruskykyjä.
    </p>

    <button
      v-if="!hasSubStats"
      type="button"
      class="calculate-button"
      @click="calculateDerivedStats"
    >
      Laske johdannaiset
    </button>

    <div v-else class="stats-display">
      <div class="stat-card">
        <span class="stat-label">Veripisteet</span>
        <span class="stat-value">{{ wizardStore.draft.subStats?.veripisteet }}</span>
        <span class="stat-desc">Terveys + Voima</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Vauriobonus</span>
        <span class="stat-value">{{ wizardStore.draft.subStats?.vauriobonus }}</span>
        <span class="stat-desc">Voima / 2</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Syvä haava</span>
        <span class="stat-value">{{ wizardStore.draft.subStats?.syvaHaava }}</span>
        <span class="stat-desc">Terveys / 2</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Kantokyky</span>
        <span class="stat-value">{{ wizardStore.draft.subStats?.kantokyky }}</span>
        <span class="stat-desc">Voima × 2</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-stats {
  padding: 1rem 0;
}

.description {
  margin-bottom: 1.5rem;
  color: #666;
}

.calculate-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.calculate-button:hover {
  background-color: #2980b9;
}

.stats-display {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.25rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  border: 2px solid #e0e0e0;
}

.stat-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-desc {
  display: block;
  font-size: 0.75rem;
  color: #666;
}
</style>
