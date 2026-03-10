<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import AttributeChoiceModal from './AttributeChoiceModal.vue'

const wizardStore = useCharacterCreationStore()

const showModal = ref(false)

const MAX_SELECTIONS = 5

const hasAdvantage = (id: string) =>
  wizardStore.selectedAdvantages.some((a) => a.id === id)

const hasDisadvantage = (id: string) =>
  wizardStore.selectedDisadvantages.some((d) => d.id === id)

const hasLahjakas = computed(() => hasAdvantage('lahjakas'))

watch(hasLahjakas, (newValue) => {
  if (newValue) {
    showModal.value = true
  }
})

const canSelectMoreAdvantages = computed(() =>
  wizardStore.selectedAdvantages.length < MAX_SELECTIONS
)

const canSelectMoreDisadvantages = computed(() =>
  wizardStore.selectedDisadvantages.length < MAX_SELECTIONS
)

const getAdvantageConflict = (id: string) =>
  wizardStore.hasConflictingAdvantage(id)

const getDisadvantageConflict = (id: string) =>
  wizardStore.hasConflictingDisadvantage(id)

const toggleAdvantage = (id: string) => {
  const advantage = wizardStore.availableAdvantages.find((a) => a.id === id)
  if (!advantage) return

  const isSelected = hasAdvantage(id)
  if (isSelected) {
    wizardStore.toggleAdvantage(advantage)
  } else {
    // Check for conflicts
    const conflict = getAdvantageConflict(id)
    if (conflict) {
      alert(`Et voi valita ${advantage.name}, koska sinulla on ${conflict}. Poista ${conflict} ensin.`)
      return
    }
    if (canSelectMoreAdvantages.value) {
      wizardStore.toggleAdvantage(advantage)
    }
  }
}

const toggleDisadvantage = (id: string) => {
  const disadvantage = wizardStore.availableDisadvantages.find((d) => d.id === id)
  if (!disadvantage) return

  const isSelected = hasDisadvantage(id)
  if (isSelected) {
    wizardStore.toggleDisadvantage(disadvantage)
  } else {
    // Check for conflicts
    const conflict = getDisadvantageConflict(id)
    if (conflict) {
      alert(`Et voi valita ${disadvantage.name}, koska sinulla on ${conflict}. Poista ${conflict} ensin.`)
      return
    }
    if (canSelectMoreDisadvantages.value) {
      wizardStore.toggleDisadvantage(disadvantage)
    }
  }
}

const selectionStatus = computed(() => {
  const advCount = wizardStore.selectedAdvantages.length
  const disCount = wizardStore.selectedDisadvantages.length
  const isBalanced = advCount === disCount

  if (advCount === 0 && disCount === 0) {
    return { text: 'Valitse edut ja haitat (määrän tulee olla sama)', class: 'info' }
  }
  if (!isBalanced) {
    const diff = Math.abs(advCount - disCount)
    if (advCount > disCount) {
      return { text: `Valitse ${diff} haittaa lisää`, class: 'warning' }
    } else {
      return { text: `Valitse ${diff} etua lisää`, class: 'warning' }
    }
  }
  return { text: `Tasapainossa (${advCount} etua, ${disCount} haittaa)`, class: 'ok' }
})
</script>

<template>
  <div class="adv-disadv">
    <div class="points-display">
      <span>Valittu: {{ wizardStore.selectedAdvantages.length }} etua / {{ wizardStore.selectedDisadvantages.length }} haittaa</span>
      <span :class="selectionStatus.class">
        {{ selectionStatus.text }}
      </span>
    </div>

    <div class="sections-container">
      <div class="section">
        <h3>Edut (max 5)</h3>
        <div class="options-grid">
          <div
            v-for="adv in wizardStore.availableAdvantages"
            :key="adv.id"
            class="option-card"
            :class="{
              selected: hasAdvantage(adv.id),
              'disabled': (!canSelectMoreAdvantages && !hasAdvantage(adv.id)) || getAdvantageConflict(adv.id),
              'has-conflict': getAdvantageConflict(adv.id),
            }"
            @click="toggleAdvantage(adv.id)"
          >
            <div class="option-header">
              <span class="option-name">{{ adv.name }}</span>
              <span v-if="getAdvantageConflict(adv.id)" class="conflict-badge">
                Ristiriita: {{ getAdvantageConflict(adv.id) }}
              </span>
            </div>
            <p class="option-description">{{ adv.description }}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Haitat (max 5)</h3>
        <div class="options-grid">
          <div
            v-for="dis in wizardStore.availableDisadvantages"
            :key="dis.id"
            class="option-card disadvantage"
            :class="{
              selected: hasDisadvantage(dis.id),
              'disabled': (!canSelectMoreDisadvantages && !hasDisadvantage(dis.id)) || getDisadvantageConflict(dis.id),
              'has-conflict': getDisadvantageConflict(dis.id),
            }"
            @click="toggleDisadvantage(dis.id)"
          >
            <div class="option-header">
              <span class="option-name">{{ dis.name }}</span>
              <span v-if="getDisadvantageConflict(dis.id)" class="conflict-badge">
                Ristiriita: {{ getDisadvantageConflict(dis.id) }}
              </span>
            </div>
            <p class="option-description">{{ dis.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <AttributeChoiceModal v-model="showModal" @close="showModal = false" />
  </div>
</template>

<style scoped>
.adv-disadv {
  padding: 1rem 0;
}

.points-display {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-weight: 600;
}

.points-display .ok {
  color: #27ae60;
}

.points-display .warning {
  color: #e74c3c;
}

.points-display .info {
  color: #3498db;
}

.option-card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.option-card.disabled:hover {
  border-color: #e0e0e0;
}

.option-card.has-conflict {
  border-color: #e74c3c;
  background-color: #fdedec;
}

.conflict-badge {
  display: block;
  font-size: 0.7rem;
  color: #e74c3c;
  font-weight: 600;
  margin-top: 0.25rem;
}

.sections-container {
  display: grid;
  gap: 2rem;
}

.section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}

.option-card {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-card:hover {
  border-color: #3498db;
}

.option-card.selected {
  border-color: #27ae60;
  background-color: #e8f8f5;
}

.option-card.disadvantage.selected {
  border-color: #e74c3c;
  background-color: #fdedec;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-name {
  font-weight: 600;
  color: #2c3e50;
}

.option-description {
  font-size: 0.85rem;
  color: #666;
}
</style>
