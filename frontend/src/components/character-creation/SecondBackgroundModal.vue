<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import type { Background } from '@/types/character'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  cancel: []
}>()

const wizardStore = useCharacterCreationStore()

// Track if user has made a selection in this modal session
const hasMadeSelection = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const primaryBackground = computed(() => wizardStore.draft.background)

const availableBackgrounds = computed((): Background[] => {
  const primaryId = primaryBackground.value?.id
  return wizardStore.availableBackgrounds.filter((b) => b.id !== primaryId)
})

// Reset selection state when modal opens
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    hasMadeSelection.value = false
  }
})

const selectedBackgroundId = computed({
  get: () => wizardStore.draft.secondBackgroundId,
  set: (id) => wizardStore.setSecondBackground(id),
})

const isSelected = (backgroundId: string) => {
  return selectedBackgroundId.value === backgroundId
}

const selectBackground = (backgroundId: string) => {
  wizardStore.setSecondBackground(backgroundId)
  hasMadeSelection.value = true
}

const handleClose = () => {
  const hasSelection = selectedBackgroundId.value !== null
  isOpen.value = false
  if (!hasSelection || !hasMadeSelection.value) {
    // No selection made or user cancelled - remove Ottolapsi advantage
    emit('cancel')
  } else {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Ottolapsi - Valitse toinen tausta</h2>
            <button type="button" class="close-btn" @click="handleClose">×</button>
          </div>

          <div class="modal-body">
            <p class="instruction">
              Ottolapsi on kahden säädyn tai kulttuurin kasvatti.
              Hänellä on molempien aloitustaidot, mutta vain ensisijaisen taustan ominaisuusmuutokset.
            </p>

            <div class="background-info mb-4">
              <div class="info-row">
                <span class="info-label">Ensisijainen tausta (antaa ominaisuusmuutokset):</span>
                <span class="info-value">{{ primaryBackground?.name || 'Ei valittu' }}</span>
              </div>
            </div>

            <p class="subtitle mb-3">Valitse toissijainen tausta (antaa taidot):</p>

            <div class="background-grid">
              <div
                v-for="bg in availableBackgrounds"
                :key="bg.id"
                class="background-card"
                :class="{ selected: isSelected(bg.id) }"
                role="button"
                tabindex="0"
                @click="selectBackground(bg.id)"
                @keydown.enter="selectBackground(bg.id)"
                @keydown.space.prevent="selectBackground(bg.id)"
              >
                <div class="card-header">
                  <h3>{{ bg.name }}</h3>
                  <span v-if="isSelected(bg.id)" class="checkmark">✓</span>
                </div>
                <p class="description">{{ bg.description }}</p>
                <div class="skills-preview">
                  <span class="skills-label">Taidot:</span>
                  <span class="skills-list">{{ Object.keys(bg.skillBonuses).join(', ') }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-cancel" @click="handleClose">
              Peruuta
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!selectedBackgroundId"
              @click="handleClose"
            >
              Valitse
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background: var(--color-bg-secondary);
  border: 2px solid var(--border-gold);
  border-radius: var(--radius-lg);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl), 0 0 30px rgba(212, 175, 55, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--color-bg-tertiary);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-family: var(--font-heading);
  color: var(--color-gold-primary);
  letter-spacing: 0.05em;
}

@media (min-width: 768px) {
  .modal-header h2 {
    font-size: 1.5rem;
  }
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: var(--color-gold-primary);
}

.modal-body {
  padding: 1.5rem;
}

.instruction {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.background-info {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 576px) {
  .info-row {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.info-label {
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
}

.info-value {
  color: var(--color-magic-blue);
  font-weight: 700;
  text-shadow: 0 0 8px rgba(74, 144, 217, 0.4);
}

.subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  margin-bottom: 1rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.background-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

@media (min-width: 576px) {
  .background-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.background-card {
  background: var(--color-bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.background-card:hover {
  border-color: var(--border-gold);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
  transform: translateY(-2px);
}

.background-card.selected {
  border-color: var(--color-success);
  background: linear-gradient(135deg, rgba(46, 160, 67, 0.2) 0%, rgba(36, 138, 56, 0.1) 100%);
  box-shadow: 0 0 20px rgba(46, 160, 67, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-family: var(--font-heading);
  color: var(--color-gold-primary);
  letter-spacing: 0.03em;
}

.checkmark {
  color: var(--color-success);
  font-size: 1.25rem;
  font-weight: 700;
}

.description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.skills-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skills-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.skills-list {
  font-size: 0.8rem;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--color-bg-tertiary);
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  min-height: 44px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  letter-spacing: 0.03em;
}

.btn-cancel {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
  border: 1px solid var(--border-color);
}

.btn-cancel:hover {
  background: var(--color-bg-secondary);
  border-color: var(--border-gold);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-magic-blue) 0%, #357abd 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a9fe9 0%, #4589c9 100%);
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.5);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}
</style>
