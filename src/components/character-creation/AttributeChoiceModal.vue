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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #95a5a6;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.instruction {
  color: #666;
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
  background-color: #f8f9fa;
  border-radius: 6px;
}

.attr-name {
  font-weight: 600;
  color: #2c3e50;
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
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.2rem;
}

.attr-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.attr-btn:not(:disabled):hover {
  background-color: #2980b9;
}

.attr-value {
  font-size: 1.1rem;
  font-weight: 700;
  min-width: 2rem;
  text-align: center;
  color: #3498db;
}

.selection-summary {
  margin-top: 1.5rem;
  text-align: center;
}

.selection-summary .complete {
  color: #27ae60;
  font-weight: 600;
}

.selection-summary .pending {
  color: #e74c3c;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.done-btn {
  padding: 0.75rem 2rem;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
}

.done-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.done-btn:not(:disabled):hover {
  background-color: #229954;
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
