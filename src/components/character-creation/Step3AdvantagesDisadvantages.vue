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
    <div class="notification mb-4" :class="{
      'is-success': selectionStatus.class === 'ok',
      'is-warning': selectionStatus.class === 'warning',
      'is-info': selectionStatus.class === 'info',
    }">
      <p class="has-text-weight-semibold">
        Valittu: {{ wizardStore.selectedAdvantages.length }} etua / {{ wizardStore.selectedDisadvantages.length }} haittaa
      </p>
      <p>{{ selectionStatus.text }}</p>
    </div>

    <div class="columns is-desktop">
      <div class="column">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Edut (max 5)</div>
        <div class="options-grid">
          <div
            v-for="adv in wizardStore.availableAdvantages"
            :key="adv.id"
            class="card option-card mb-2"
            :class="{
              'is-selected': hasAdvantage(adv.id),
              'is-disabled': (!canSelectMoreAdvantages && !hasAdvantage(adv.id)) || getAdvantageConflict(adv.id),
              'has-conflict': getAdvantageConflict(adv.id),
            }"
            @click="toggleAdvantage(adv.id)"
          >
            <div class="card-content p-3">
              <div class="is-size-7 has-text-weight-bold mb-1">{{ adv.name }}</div>
              <p class="is-size-7 has-text-grey">{{ adv.description }}</p>
              <p v-if="getAdvantageConflict(adv.id)" class="is-size-7 has-text-danger has-text-weight-bold mt-1">
                Ristiriita: {{ getAdvantageConflict(adv.id) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Haitat (max 5)</div>
        <div class="options-grid">
          <div
            v-for="dis in wizardStore.availableDisadvantages"
            :key="dis.id"
            class="card option-card disadvantage mb-2"
            :class="{
              'is-selected': hasDisadvantage(dis.id),
              'is-disabled': (!canSelectMoreDisadvantages && !hasDisadvantage(dis.id)) || getDisadvantageConflict(dis.id),
              'has-conflict': getDisadvantageConflict(dis.id),
            }"
            @click="toggleDisadvantage(dis.id)"
          >
            <div class="card-content p-3">
              <div class="is-size-7 has-text-weight-bold mb-1">{{ dis.name }}</div>
              <p class="is-size-7 has-text-grey">{{ dis.description }}</p>
              <p v-if="getDisadvantageConflict(dis.id)" class="is-size-7 has-text-danger has-text-weight-bold mt-1">
                Ristiriita: {{ getDisadvantageConflict(dis.id) }}
              </p>
            </div>
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

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.option-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.option-card:hover:not(.is-disabled) {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.option-card.is-selected {
  border-color: #27ae60;
  background-color: #e8f8f5;
}

.option-card.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-card.is-disabled:hover {
  transform: none;
  box-shadow: none;
}

.option-card.has-conflict {
  border-color: #e74c3c;
  background-color: #fdedec;
}

.option-card.disadvantage.is-selected {
  border-color: #e74c3c;
  background-color: #fdedec;
}
</style>
