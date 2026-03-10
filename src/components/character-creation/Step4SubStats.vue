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

  // Vauriobonus table based on Voima
  const calculateVauriobonus = (voima: number): number => {
    if (voima <= 5) return -2
    if (voima <= 9) return -1
    if (voima <= 14) return 0
    if (voima <= 17) return 1
    if (voima <= 19) return 2
    return 3 // voima 20
  }

  // Veripisteet table based on Terveys
  const calculateVeripisteet = (terveys: number): number => {
    if (terveys === 1) return 10
    if (terveys <= 3) return 11
    if (terveys <= 5) return 12
    if (terveys <= 7) return 13
    if (terveys <= 9) return 14
    if (terveys <= 11) return 15
    if (terveys <= 13) return 16
    if (terveys <= 15) return 17
    if (terveys <= 17) return 18
    if (terveys <= 19) return 19
    return 20 // terveys 20
  }

  // Syvä haava table based on Voima + Terveys
  const calculateSyvaHaava = (voima: number, terveys: number): number => {
    const sum = voima + terveys
    if (sum <= 10) return 5
    if (sum <= 17) return 6
    if (sum <= 24) return 7
    if (sum <= 31) return 8
    if (sum <= 38) return 9
    return 10 // 39-40
  }

  const subStats: SubStats = {
    veripisteet: calculateVeripisteet(terveys),
    vauriobonus: calculateVauriobonus(voima),
    syvaHaava: calculateSyvaHaava(voima, terveys),
    kantokyky: voima * 20,
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
