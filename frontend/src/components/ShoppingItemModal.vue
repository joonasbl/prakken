<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ShoppingItem, ShoppingItemDraft, ShoppingCategory } from '@/types/shopping'
import { validatePriceFormula, rollPrice } from '@/utils/shopping'

const props = defineProps<{
  modelValue: boolean
  item?: ShoppingItem | null
  categories: ShoppingCategory[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [draft: ShoppingItemDraft]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditMode = computed(() => !!props.item)

// Form state
const name = ref('')
const description = ref('')
const categoryId = ref('')
const basePrice = ref(10)
const priceFormula = ref('10+3d6')
const availabilityChance = ref(50)

// Validation state
const errors = ref<Record<string, string>>({})
const previewPrice = ref(0)

// Reset form function (must be defined before watches that use it)
const resetForm = () => {
  name.value = ''
  description.value = ''
  categoryId.value = props.categories[0]?.id || ''
  basePrice.value = 10
  priceFormula.value = '10+3d6'
  availabilityChance.value = 50
  errors.value = {}
  previewPrice.value = rollPrice('10+3d6')
}

// Watch for price formula changes and update preview
watch(priceFormula, (newFormula) => {
  const result = validatePriceFormula(newFormula)
  if (result.valid) {
    previewPrice.value = rollPrice(newFormula)
  }
}, { immediate: true })

// Watch for item changes (edit mode)
watch(
  () => props.item,
  (item) => {
    if (item) {
      name.value = item.name
      description.value = item.description
      categoryId.value = item.categoryId
      basePrice.value = item.basePrice
      priceFormula.value = item.priceFormula
      availabilityChance.value = item.availabilityChance
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const validate = (): boolean => {
  errors.value = {}

  if (!name.value.trim()) {
    errors.value.name = 'Nimi on pakollinen'
  }

  if (!categoryId.value) {
    errors.value.categoryId = 'Kategoria on pakollinen'
  }

  const formulaValidation = validatePriceFormula(priceFormula.value)
  if (!formulaValidation.valid) {
    errors.value.priceFormula = formulaValidation.error || 'Virheellinen hintakaava'
  }

  if (availabilityChance.value < 0 || availabilityChance.value > 100) {
    errors.value.availabilityChance = 'Saatavuuden tulee olla 0-100%'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return

  const draft: ShoppingItemDraft = {
    name: name.value.trim(),
    description: description.value.trim(),
    categoryId: categoryId.value,
    basePrice: basePrice.value,
    priceFormula: priceFormula.value,
    availabilityChance: availabilityChance.value,
  }

  emit('save', draft)
  isOpen.value = false
  resetForm()
}

const handleClose = () => {
  isOpen.value = false
  resetForm()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ isEditMode ? 'Muokkaa esinettä' : 'Lisää uusi esine' }}
            </h2>
            <button type="button" class="btn-close" @click="handleClose">
              <span class="icon"><i class="fas fa-times"></i></span>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-form">
            <!-- Name -->
            <div class="form-group">
              <label for="name">Nimi</label>
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="esim. Parantava juoma"
                :class="{ error: errors.name }"
              />
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="description">Kuvaus</label>
              <textarea
                id="description"
                v-model="description"
                rows="3"
                placeholder="esim. Palauttaa 1d6 veripistettä"
              ></textarea>
            </div>

            <!-- Category -->
            <div class="form-group">
              <label for="category">Kategoria</label>
              <select
                id="category"
                v-model="categoryId"
                :class="{ error: errors.categoryId }"
              >
                <option value="">Valitse kategoria...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <span v-if="errors.categoryId" class="error-message">{{ errors.categoryId }}</span>
            </div>

            <!-- Base Price -->
            <div class="form-group">
              <label for="basePrice">Perushinta (kpr)</label>
              <input
                id="basePrice"
                v-model.number="basePrice"
                type="number"
                min="0"
                placeholder="10"
              />
              <small class="form-hint">Perushinta ennen nopanheittoa</small>
            </div>

            <!-- Price Formula -->
            <div class="form-group">
              <label for="priceFormula">Hintakaava</label>
              <input
                id="priceFormula"
                v-model="priceFormula"
                type="text"
                placeholder="10+3d6"
                :class="{ error: errors.priceFormula }"
              />
              <small class="form-hint">
                Formaatit: "10+3d6", "50+2d10", "100"
              </small>
              <div v-if="!errors.priceFormula" class="price-preview">
                <span class="preview-label">Esikatselu:</span>
                <span class="preview-value">{{ previewPrice }} kpr</span>
                <small class="preview-hint">(yksittäinen heitto)</small>
              </div>
              <span v-if="errors.priceFormula" class="error-message">{{ errors.priceFormula }}</span>
            </div>

            <!-- Availability Chance -->
            <div class="form-group">
              <label for="availabilityChance">Saatavuus (%)</label>
              <input
                id="availabilityChance"
                v-model.number="availabilityChance"
                type="number"
                min="0"
                max="100"
                :class="{ error: errors.availabilityChance }"
              />
              <small class="form-hint">
                {{ availabilityChance }}% mahdollisuus olla saatavilla
              </small>
              <span v-if="errors.availabilityChance" class="error-message">{{ errors.availabilityChance }}</span>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="handleClose">
                Peruuta
              </button>
              <button type="submit" class="btn-save">
                {{ isEditMode ? 'Tallenna muutokset' : 'Lisää esine' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-md);
  overflow-y: auto;
}

/* Modal Content */
.modal-content {
  background: var(--color-bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg), var(--shadow-gold);
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-border);
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--color-bg-secondary);
}

.modal-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-xl);
  color: var(--color-gold-primary);
  margin: 0;
  letter-spacing: 0.05em;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-sm);
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.btn-close:hover {
  color: var(--color-gold-primary);
  background: var(--color-bg-hover);
}

/* Modal Form */
.modal-form {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  font-family: var(--font-heading);
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
  font-size: var(--font-size-sm);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-magic-blue);
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.2);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: var(--color-danger);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.error-message {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  font-weight: 600;
}

.price-preview {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.preview-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.preview-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-gold-primary);
}

.preview-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: var(--space-md);
  padding-top: var(--space-md);
  margin-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}

.modal-actions button {
  flex: 1;
  min-height: 44px;
}

.btn-cancel {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color-light);
  color: var(--color-text-primary);
}

.btn-cancel:hover {
  background: var(--color-bg-hover);
  border-color: var(--border-gold);
}

.btn-save {
  background: var(--gradient-gold);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-gold-light);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
}

.btn-save:hover {
  box-shadow: var(--shadow-gold-strong);
  transform: translateY(-1px);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--transition-base);
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all var(--transition-base);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* Mobile: Full-width modal */
@media (max-width: 576px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal-content {
    max-width: 100%;
    max-height: 95vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
