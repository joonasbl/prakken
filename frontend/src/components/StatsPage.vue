<script setup lang="ts">
import { useStatsStore } from '@/stores/stats'
import NameComponent from './NameComponent.vue'
import SkillsList from './SkillsList.vue'

const statsStore = useStatsStore()

const setNewAttr = (name: string, event: InputEvent) => {
  const target = event.target as HTMLInputElement | null
  if (!target) return

  const parsed = Number.parseInt(target.value, 10)
  if (Number.isNaN(parsed)) return

  statsStore.setVal(name, parsed)
}
</script>

<template>
  <NameComponent />
  <div class="container">
    <div class="stats-skills-layout">
      <div class="attributes-section">
        <div class="attributes-grid">
          <template v-for="attr in statsStore.attList" :key="attr.name">
            <div class="attribute-row">
              <p class="attr-label">{{ attr.name }}</p>
              <input
                class="stat-input"
                type="number"
                :value="attr.value"
                @input="(event) => setNewAttr(attr.name, event as InputEvent)"
              />
            </div>
          </template>
        </div>
      </div>
      <div class="skills-section">
        <SkillsList />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.stats-skills-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  margin: var(--space-lg) 0;
}

@media (min-width: 768px) {
  .stats-skills-layout {
    grid-template-columns: 1fr 1fr;
  }
}

.attributes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-sm);
}

@media (min-width: 576px) {
  .attributes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.attribute-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  gap: var(--space-md);
}

.attr-label {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  min-width: 80px;
  text-align: left;
}

.stat-input {
  width: 100%;
  max-width: 80px;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  color: var(--color-text-primary);
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
  transition: all var(--transition-base);
}

.stat-input:focus {
  border-color: var(--color-magic-blue);
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.2);
  outline: none;
}

.stat-input:hover {
  border-color: var(--border-gold);
}

.skills-section {
  width: 100%;
}

@media (max-width: 767px) {
  .attr-label {
    font-size: var(--font-size-base);
    min-width: 70px;
  }
  
  .stat-input {
    max-width: 70px;
    font-size: var(--font-size-base);
  }
  
  .attribute-row {
    padding: var(--space-md);
  }
}
</style>

