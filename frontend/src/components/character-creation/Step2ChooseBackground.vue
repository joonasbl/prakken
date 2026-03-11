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
      Valitse hahmollesi syntyperä. Syntyperä antaa bonuksia ominaisuuksiin ja taitoihin.
    </p>

    <div class="columns is-multiline">
      <div class="column is-4" v-for="bg in wizardStore.availableBackgrounds" :key="bg.id">
        <div class="card background-card" :class="{ 'is-selected': wizardStore.draft.background?.id === bg.id }"
          @click="selectBackground(bg.id)">
          <div class="card-content">
            <div class="content">
              <h3 class="title is-4 mb-2">{{ bg.name }}</h3>
              <p class="is-size-7 mb-3">{{ bg.description }}</p>

              <div v-if="Object.keys(bg.statBonuses).length > 0" class="mb-3">
                <strong class="is-size-7">Ominaisuusbonukset:</strong>
                <ul class="is-size-7 mt-1 mb-0">
                  <li v-for="(bonus, stat) in bg.statBonuses" :key="stat">
                    <span class="tag is-info is-light is-small mr-1">{{ bonus != null && bonus >= 0 ? '+' : '' }}{{
                      bonus }} {{ stat }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="Object.keys(bg.skillBonuses).length > 0">
                <strong class="is-size-7">Taidot:</strong>
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
@import '@/assets/fantasy-theme.css';

.choose-background {
  padding: 1rem 0;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.background-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  border: 2px solid var(--border-color);
  background: linear-gradient(180deg, #242b36 0%, #1a2028 100%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.background-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
  opacity: 0.5;
}

.background-card:hover {
  border-color: var(--color-magic-blue);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), 0 0 15px rgba(74, 144, 217, 0.3);
}

.background-card.is-selected {
  border-color: var(--color-gold-primary);
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, rgba(153, 102, 21, 0.08) 100%);
  box-shadow: var(--shadow-lg), 0 0 20px rgba(212, 175, 55, 0.3);
}

.background-card .title {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-size: 1.3rem;
  margin-bottom: 0.5rem !important;
}

.background-card .content {
  color: #b8c5d6;
  font-size: 0.9rem;
  line-height: 1.5;
}

.background-card .content p {
  color: #c5d4e8 !important;
  font-size: 0.95rem;
  line-height: 1.6;
}

.background-card strong {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

/* Override Bulma tag styles for dark theme */
.background-card .tag {
  background: linear-gradient(135deg, #2d3a4d 0%, #1f2a38 100%) !important;
  color: #c5d4e8 !important;
  border: 1px solid var(--border-color) !important;
  font-weight: 600;
  font-size: 0.75rem;
}

.background-card .tag.is-info {
  background: linear-gradient(135deg, #2d3a4d 0%, #1f2a38 100%) !important;
  color: #a8c5e8 !important;
  border-color: #3a4a5d !important;
}

.background-card .tag.is-success {
  background: linear-gradient(135deg, #2d3a35 0%, #1f2a25 100%) !important;
  color: #8fd4a8 !important;
  border-color: #3a5d4a !important;
}

.background-card ul {
  padding-left: 1.2rem;
  margin: 0.5rem 0;
}

.background-card ul li {
  color: #b8c5d6;
  margin-bottom: 0.25rem;
}
</style>
