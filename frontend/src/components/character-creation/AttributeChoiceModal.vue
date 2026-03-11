<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const wizardStore = useCharacterCreationStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const attributeNames = ['Voima', 'Terveys', 'Ketteryys', 'Valppaus', 'Sisukkuus', 'Karisma']

const pendingChoices = computed(() => wizardStore.pendingAttributeChoices)

const getChoiceValue = (attrName: string) => {
  return wizardStore.attributeChoices[attrName] || 0
}

const incrementChoice = (attrName: string) => {
  const current = getChoiceValue(attrName)
  if (current < 2 && pendingChoices.value > 0) {
    wizardStore.setAttributeChoice(attrName, current + 1)
  }
}

const decrementChoice = (attrName: string) => {
  const current = getChoiceValue(attrName)
  if (current > 0) {
    wizardStore.setAttributeChoice(attrName, current - 1)
  }
}

const handleClose = () => {
  isOpen.value = false
  emit('close')
}

const isComplete = computed(() => pendingChoices.value === 0)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Lahjakas - Valitse ominaisuudet</h2>
            <button type="button" class="close-btn" @click="handleClose">×</button>
          </div>

          <div class="modal-body">
            <p class="instruction">
              Valitse {{ pendingChoices }} ominaisuutta, joihin saat +1 bonuksen.
              Sama ominaisuus voidaan valita kahdesti.
            </p>

            <div class="attribute-selections">
              <div
                v-for="attrName in attributeNames"
                :key="attrName"
                class="attribute-row"
              >
                <span class="attr-name">{{ attrName }}</span>
                <div class="attr-controls">
                  <button
                    type="button"
                    class="attr-btn"
                    :disabled="getChoiceValue(attrName) === 0"
                    @click="decrementChoice(attrName)"
                  >
                    -
                  </button>
                  <span class="attr-value">{{ getChoiceValue(attrName) }}</span>
                  <button
                    type="button"
                    class="attr-btn"
                    :disabled="getChoiceValue(attrName) >= 2 || pendingChoices === 0"
                    @click="incrementChoice(attrName)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div class="selection-summary">
              <span :class="isComplete ? 'complete' : 'pending'">
                {{ isComplete ? 'Valinta valmis!' : `Valittava vielä: ${pendingChoices}` }}
              </span>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="done-btn"
              :disabled="!isComplete"
              @click="handleClose"
            >
              Valmis
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
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--gradient-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-lg), 0 0 30px rgba(212, 175, 55, 0.2);
  border: 1px solid var(--border-gold);
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  color: var(--color-gold-primary);
  margin: 0;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: var(--color-gold-primary);
}

.modal-body {
  margin-bottom: 1.5rem;
}

.instruction {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.attribute-selections {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attribute-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.attribute-row:hover {
  border-color: var(--border-gold);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.attr-name {
  font-weight: 600;
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.attr-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attr-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3);
}

.attr-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.attr-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #5a9fe9 0%, #4589c9 100%);
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.5);
  transform: translateY(-1px);
}

.attr-value {
  font-size: 1.1rem;
  font-weight: 700;
  min-width: 2rem;
  text-align: center;
  color: var(--color-magic-blue);
  text-shadow: 0 0 8px rgba(74, 144, 217, 0.4);
}

.selection-summary {
  margin-top: 1.5rem;
  text-align: center;
}

.selection-summary .complete {
  color: var(--color-success);
  font-weight: 600;
  text-shadow: 0 0 8px rgba(46, 160, 67, 0.4);
}

.selection-summary .pending {
  color: var(--color-gold-primary);
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.done-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #2ea043 0%, #248a38 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(46, 160, 67, 0.3);
}

.done-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.done-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #3eb053 0%, #2e9a48 100%);
  box-shadow: 0 4px 16px rgba(46, 160, 67, 0.5);
  transform: translateY(-1px);
}

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
  transform: scale(0.9);
}
</style>
