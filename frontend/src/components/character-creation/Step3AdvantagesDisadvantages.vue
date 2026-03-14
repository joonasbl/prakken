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

const handleModalCancel = () => {
  const lahjakasAdvantage = wizardStore.availableAdvantages.find((a) => a.id === 'lahjakas')
  if (lahjakasAdvantage && hasAdvantage('lahjakas')) {
    wizardStore.toggleAdvantage(lahjakasAdvantage)
  }
}

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
        Valittu: {{ wizardStore.selectedAdvantages.length }} etua / {{ wizardStore.selectedDisadvantages.length }}
        haittaa
      </p>
      <p>{{ selectionStatus.text }}</p>
    </div>

    <div class="columns is-desktop">
      <div class="column">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Edut (max 5)
        </div>
        <div class="options-grid">
          <div v-for="adv in wizardStore.availableAdvantages" :key="adv.id" class="card option-card mb-2" :class="{
            'is-selected': hasAdvantage(adv.id),
            'is-disabled': (!canSelectMoreAdvantages && !hasAdvantage(adv.id)) || getAdvantageConflict(adv.id),
            'has-conflict': getAdvantageConflict(adv.id),
          }" @click="toggleAdvantage(adv.id)">
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
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Haitat (max 5)
        </div>
        <div class="options-grid">
          <div v-for="dis in wizardStore.availableDisadvantages" :key="dis.id"
            class="card option-card disadvantage mb-2" :class="{
              'is-selected': hasDisadvantage(dis.id),
              'is-disabled': (!canSelectMoreDisadvantages && !hasDisadvantage(dis.id)) || getDisadvantageConflict(dis.id),
              'has-conflict': getDisadvantageConflict(dis.id),
            }" @click="toggleDisadvantage(dis.id)">
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

    <AttributeChoiceModal v-model="showModal" @close="showModal = false" @cancel="handleModalCancel" />
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.adv-disadv {
  padding: 1rem 0;
}

/* Notification styling */
.notification {
  background: var(--color-bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.notification.is-success {
  border-color: var(--color-success);
  background: linear-gradient(135deg, rgba(46, 160, 67, 0.2) 0%, rgba(36, 138, 56, 0.1) 100%);
  box-shadow: var(--shadow-md), 0 0 15px rgba(46, 160, 67, 0.3);
}

.notification.is-success .has-text-weight-semibold,
.notification.is-success p {
  color: var(--color-text-primary);
}

.notification.is-warning {
  border-color: var(--color-gold-primary);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(153, 102, 21, 0.1) 100%);
  box-shadow: var(--shadow-md), 0 0 12px rgba(212, 175, 55, 0.3);
}

.notification.is-warning .has-text-weight-semibold,
.notification.is-warning p {
  color: var(--color-text-primary);
}

.notification.is-info {
  border-color: var(--color-magic-blue);
  background: linear-gradient(135deg, rgba(74, 144, 217, 0.15) 0%, rgba(53, 122, 189, 0.1) 100%);
  box-shadow: var(--shadow-md), 0 0 12px rgba(74, 144, 217, 0.3);
}

.notification.is-info .has-text-weight-semibold,
.notification.is-info p {
  color: var(--color-text-primary);
}

.notification .has-text-weight-semibold {
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  font-size: 1rem;
}

.notification p {
  font-family: var(--font-body);
  font-size: 0.95rem;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

@media (min-width: 576px) {
  .options-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

.option-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--border-color);
  background: var(--gradient-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.option-card:hover:not(.is-disabled) {
  border-color: var(--color-magic-blue);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), 0 0 10px rgba(74, 144, 217, 0.2);
}

.option-card.is-selected {
  border-color: var(--color-success);
  background: linear-gradient(135deg, rgba(46, 160, 67, 0.2) 0%, rgba(36, 138, 56, 0.1) 100%);
  box-shadow: var(--shadow-md), 0 0 15px rgba(46, 160, 67, 0.3);
}

.option-card.is-selected .has-text-weight-bold {
  color: var(--color-gold-light);
}

.option-card.is-selected .is-size-7 {
  color: var(--color-text-primary);
}

.option-card.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.option-card.is-disabled:hover {
  transform: none;
  box-shadow: none;
}

.option-card.has-conflict {
  border-color: var(--color-danger);
  background: linear-gradient(135deg, rgba(218, 54, 51, 0.2) 0%, rgba(194, 40, 37, 0.1) 100%);
  box-shadow: var(--shadow-md), 0 0 10px rgba(218, 54, 51, 0.2);
}

.option-card.disadvantage.is-selected {
  border-color: var(--color-danger);
  background: linear-gradient(135deg, rgba(218, 54, 51, 0.2) 0%, rgba(194, 40, 37, 0.1) 100%);
  box-shadow: var(--shadow-md), 0 0 15px rgba(218, 54, 51, 0.3);
}

.option-card.disadvantage.is-selected .has-text-weight-bold {
  color: var(--color-gold-light);
}

.option-card .is-size-7 {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
}

.option-card .has-text-weight-bold {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  font-size: 0.9rem;
}

.option-card.has-conflict .has-text-weight-bold {
  color: #ff6b6b;
}

/* Mobile: Stack columns */
@media (max-width: 767px) {
  .columns.is-desktop {
    display: flex;
    flex-direction: column;
  }

  .column {
    width: 100%;
    padding: 0;
    margin-bottom: 1.5rem;
  }

  .is-size-5 {
    font-size: 1.2rem !important;
    margin-bottom: 1rem !important;
  }

  .options-grid {
    gap: 0.4rem;
    padding: 0.25rem;
  }

  .option-card {
    padding: 0.5rem;
  }

  .option-card .card-content {
    padding: 0.25rem !important;
  }

  .option-card .has-text-weight-bold {
    font-size: 0.85rem;
    margin-bottom: 0.25rem !important;
  }

  .option-card .is-size-7 {
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .notification {
    padding: 0.75rem 1rem;
  }

  .notification .has-text-weight-semibold {
    font-size: 0.9rem;
  }

  .notification p {
    font-size: 0.85rem;
  }
}

/* Extra small screens */
@media (max-width: 374px) {
  .options-grid {
    gap: 0.25rem;
  }

  .option-card {
    padding: 0.4rem;
  }

  .option-card .has-text-weight-bold {
    font-size: 0.8rem;
  }

  .option-card .is-size-7 {
    font-size: 0.7rem;
  }

  .is-size-5 {
    font-size: 1.1rem !important;
  }
}
</style>
