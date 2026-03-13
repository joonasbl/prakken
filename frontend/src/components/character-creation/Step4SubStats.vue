<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import type { SubStats } from '@/types/character'
import ModifierBadge from './ModifierBadge.vue'

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

const substatModifiers = computed(() => wizardStore.substatModifiers)
</script>

<template>
  <div class="sub-stats">
    <p class="subtitle is-6 mb-5 has-text-grey">
      Johdannaiset arvot lasketaan ominaisuuksista. Nämä kuvaavat hahmosi peruskykyjä.
    </p>

    <div v-if="!hasSubStats" class="has-text-centered py-6">
      <button type="button" class="button is-info is-medium is-rounded" @click="calculateDerivedStats">
        <span class="icon"><i class="fas fa-calculator"></i></span>
        <span>Laske johdannaiset</span>
      </button>
    </div>

    <div v-else class="columns is-multiline">
      <div class="column is-3">
        <div class="card has-text-centered">
          <div class="card-content">
            <p class="is-size-7 has-text-grey mb-2">Veripisteet</p>
            <div class="is-flex is-justify-content-center is-align-items-center gap-2 mb-2">
              <p class="is-size-2 has-text-weight-bold has-text-info">{{ wizardStore.draft.subStats?.veripisteet }}</p>
              <ModifierBadge v-if="substatModifiers.veripisteet !== 0" :modifier="substatModifiers.veripisteet"
                source="etu/haitta" />
            </div>
            <p class="is-size-7 has-text-grey">Terveys + Voima</p>
          </div>
        </div>
      </div>
      <div class="column is-3">
        <div class="card has-text-centered">
          <div class="card-content">
            <p class="is-size-7 has-text-grey mb-2">Vauriobonus</p>
            <p class="is-size-2 has-text-weight-bold has-text-info mb-2">{{ wizardStore.draft.subStats?.vauriobonus }}
            </p>
            <p class="is-size-7 has-text-grey">Voima</p>
          </div>
        </div>
      </div>
      <div class="column is-3">
        <div class="card has-text-centered">
          <div class="card-content">
            <p class="is-size-7 has-text-grey mb-2">Syvä haava</p>
            <div class="is-flex is-justify-content-center is-align-items-center gap-2 mb-2">
              <p class="is-size-2 has-text-weight-bold has-text-info">{{ wizardStore.draft.subStats?.syvaHaava }}</p>
              <ModifierBadge v-if="substatModifiers.syvaHaava !== 0" :modifier="substatModifiers.syvaHaava"
                source="etu/haitta" />
            </div>
            <p class="is-size-7 has-text-grey">Voima + Terveys</p>
          </div>
        </div>
      </div>
      <div class="column is-3">
        <div class="card has-text-centered">
          <div class="card-content">
            <p class="is-size-7 has-text-grey mb-2">Kantokyky</p>
            <p class="is-size-2 has-text-weight-bold has-text-info mb-2">{{ wizardStore.draft.subStats?.kantokyky }}</p>
            <p class="is-size-7 has-text-grey">Voima × 20</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.sub-stats {
  padding: 1rem 0;
}

.gap-2 {
  gap: 0.5rem;
}

.subtitle {
  font-size: 0.95rem;
}

@media (min-width: 768px) {
  .subtitle {
    font-size: 1.1rem;
  }
}

.columns.is-multiline {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  flex-wrap: unset;
  margin: 0;
}

@media (min-width: 576px) {
  .columns.is-multiline {
    grid-template-columns: repeat(4, 1fr);
  }
}

.column.is-3 {
  padding: 0;
  flex: unset !important;
  width: unset !important;
}

.card {
  background: var(--gradient-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  min-height: 44px;
}

.card:hover {
  border-color: var(--border-gold);
  box-shadow: var(--shadow-lg), 0 0 15px rgba(212, 175, 55, 0.2);
  transform: translateY(-2px);
}

.card .is-size-2 {
  color: var(--color-magic-blue);
  text-shadow: 0 0 12px rgba(74, 144, 217, 0.5);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  font-size: 1.5rem;
}

@media (min-width: 768px) {
  .card .is-size-2 {
    font-size: 2rem;
  }
}

.card .is-size-7 {
  color: var(--color-text-muted);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  font-size: 0.7rem;
}

@media (min-width: 768px) {
  .card .is-size-7 {
    font-size: 0.8rem;
  }
}

/* Button styling */
.button.is-info {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
}
</style>
