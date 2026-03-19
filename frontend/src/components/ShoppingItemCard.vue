<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ShoppingItem, ShoppingCategory } from '@/types/shopping'
import { formatPrice } from '@/utils/shopping'

const props = defineProps<{
  item: ShoppingItem
  category: ShoppingCategory | null
  showAdminActions?: boolean
}>()

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
  reroll: [id: string]
  updatePrice: [id: string, price: number]
  toggleAvailability: [id: string]
}>()

// Local price edit state
const isEditingPrice = ref(false)
const editPriceValue = ref(props.item.currentPrice)

// Reset edit state when item changes
watch(() => props.item, () => {
  editPriceValue.value = props.item.currentPrice
  isEditingPrice.value = false
}, { deep: true })

const handleEdit = () => {
  emit('edit', String(props.item.id))
}

const handleDelete = () => {
  emit('delete', String(props.item.id))
}

const handleReroll = () => {
  emit('reroll', String(props.item.id))
}

const startEditingPrice = () => {
  editPriceValue.value = props.item.currentPrice
  isEditingPrice.value = true
}

const savePrice = () => {
  if (editPriceValue.value >= 0) {
    emit('updatePrice', String(props.item.id), editPriceValue.value)
  }
  isEditingPrice.value = false
}

const cancelPriceEdit = () => {
  isEditingPrice.value = false
  editPriceValue.value = props.item.currentPrice
}

const handleToggleAvailability = () => {
  emit('toggleAvailability', String(props.item.id))
}
</script>

<template>
  <div class="shopping-item-card" :class="{ unavailable: !item.isAvailable }">
    <div class="card-header">
      <h3 class="item-name">{{ item.name }}</h3>
      <span class="availability-badge" :class="{ available: item.isAvailable }">
        <i :class="item.isAvailable ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
        {{ item.isAvailable ? 'Saatavilla' : 'Ei saatavilla' }}
      </span>
    </div>

    <div v-if="category" class="item-category">
      <i class="fas fa-tag"></i>
      {{ category.name }}
    </div>

    <p class="item-description">{{ item.description }}</p>

    <div class="item-details">
      <div class="price-section">
        <span class="price-label">Hinta:</span>
        <template v-if="isEditingPrice && showAdminActions">
          <input
            v-model.number="editPriceValue"
            type="number"
            min="0"
            class="price-input"
            @keyup.enter="savePrice"
            @keyup.escape="cancelPriceEdit"
          />
          <button type="button" class="btn-save-price" @click="savePrice" title="Tallenna">
            <span class="icon"><i class="fas fa-check"></i></span>
          </button>
          <button type="button" class="btn-cancel-price" @click="cancelPriceEdit" title="Peruuta">
            <span class="icon"><i class="fas fa-times"></i></span>
          </button>
        </template>
        <template v-else>
          <span class="price-value" :class="{ 'price-unavailable': !item.isAvailable }">
            {{ formatPrice(item.currentPrice) }}
          </span>
          <button
            v-if="showAdminActions"
            type="button"
            class="btn-edit-price"
            @click="startEditingPrice"
            title="Muokkaa hintaa"
          >
            <span class="icon"><i class="fas fa-edit"></i></span>
          </button>
        </template>
        <span class="price-formula" v-if="showAdminActions">
          ({{ item.priceFormula }})
        </span>
      </div>

      <div class="availability-section">
        <span v-if="showAdminActions" class="availability-label">Saatavuus:</span>
        <span v-if="showAdminActions" class="availability-value">{{ item.availabilityChance }}%</span>
        <button
          v-if="showAdminActions"
          type="button"
          class="btn-toggle-availability"
          :class="{ 'in-stock': item.isAvailable }"
          @click="handleToggleAvailability"
          :title="item.isAvailable ? 'Aseta ei saatavilla' : 'Aseta saatavilla'"
        >
          <span class="icon">
            <i :class="item.isAvailable ? 'fas fa-box-open' : 'fas fa-box-archive'"></i>
          </span>
        </button>
      </div>
    </div>

    <div v-if="item.lastRolledAt && showAdminActions" class="last-rolled">
      <i class="fas fa-clock"></i>
      Päivitetty: {{ new Date(item.lastRolledAt).toLocaleString('fi-FI') }}
    </div>

    <div v-if="showAdminActions" class="admin-actions">
      <button type="button" class="btn-reroll" @click="handleReroll" title="Reroll hinta ja saatavuus">
        <span class="icon"><i class="fas fa-dice"></i></span>
        <span>Reroll</span>
      </button>
      <button type="button" class="btn-edit" @click="handleEdit" title="Muokkaa">
        <span class="icon"><i class="fas fa-edit"></i></span>
        <span>Muokkaa</span>
      </button>
      <button type="button" class="btn-delete" @click="handleDelete" title="Poista">
        <span class="icon"><i class="fas fa-trash"></i></span>
        <span>Poista</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.shopping-item-card {
  background: var(--color-bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-base);
}

.shopping-item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-border);
  opacity: 0.5;
}

.shopping-item-card:hover {
  border-color: var(--border-gold);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  transform: translateY(-2px);
}

.shopping-item-card.unavailable {
  opacity: 0.6;
  filter: grayscale(0.3);
}

.shopping-item-card.unavailable:hover {
  opacity: 1;
  filter: grayscale(0);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
  flex-wrap: wrap;
}

.item-name {
  font-family: var(--font-heading);
  font-size: var(--font-size-xl);
  color: var(--color-gold-primary);
  margin: 0;
  letter-spacing: 0.05em;
}

.availability-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}

.availability-badge.available {
  background: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.availability-badge .icon {
  font-size: 0.9em;
}

.item-category {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}

.item-category .icon {
  color: var(--color-magic-blue);
}

.item-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.5;
  margin-bottom: var(--space-md);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.price-section,
.availability-section {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.price-section {
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-sm);
}

.price-label,
.availability-label {
  font-family: var(--font-heading);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  letter-spacing: 0.05em;
}

.price-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-gold-primary);
}

.price-value.price-unavailable {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.price-formula {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
}

.availability-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Price Editing */
.price-input {
  width: 100px;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-gold-primary);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.btn-save-price,
.btn-cancel-price,
.btn-edit-price {
  padding: var(--space-xs) var(--space-sm);
  min-width: 36px;
  min-height: 36px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.btn-save-price {
  background: var(--color-success);
  border: 1px solid var(--color-success);
  color: white;
}

.btn-save-price:hover {
  background: var(--color-success);
  box-shadow: 0 0 10px rgba(46, 160, 67, 0.5);
}

.btn-cancel-price {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--color-text-secondary);
}

.btn-cancel-price:hover {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: white;
}

.btn-edit-price {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--color-text-muted);
}

.btn-edit-price:hover {
  border-color: var(--color-gold-primary);
  color: var(--color-gold-primary);
  background: var(--color-bg-hover);
}

/* Toggle Availability Button */
.btn-toggle-availability {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-danger-bg);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 32px;
  min-height: 32px;
  flex-shrink: 0;
}

.btn-toggle-availability.in-stock {
  background: var(--color-success-bg);
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.btn-toggle-availability:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.btn-toggle-availability.in-stock:hover {
  box-shadow: 0 2px 8px rgba(46, 160, 67, 0.4);
}

.btn-toggle-availability:not(.in-stock):hover {
  box-shadow: 0 2px 8px rgba(218, 54, 51, 0.4);
}

.btn-toggle-availability .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
  line-height: 1;
}

.last-rolled {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color);
}

.last-rolled .icon {
  color: var(--color-magic-blue);
}

.admin-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.admin-actions button {
  flex: 1;
  min-width: 100px;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
}

.btn-reroll {
  background: var(--gradient-magic-blue);
  border: 1px solid var(--color-gold-primary);
  color: var(--color-text-primary);
}

.btn-reroll:hover {
  background: linear-gradient(135deg, #4d6a8a 0%, #3d5a6f 100%);
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.4);
}

.btn-edit {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color-light);
  color: var(--color-text-primary);
}

.btn-edit:hover {
  background: var(--color-bg-hover);
  border-color: var(--border-gold);
  color: var(--color-gold-primary);
}

.btn-delete {
  background: var(--gradient-crimson);
  border: 1px solid #a38b5d;
  color: var(--color-text-primary);
}

.btn-delete:hover {
  background: linear-gradient(135deg, #6c3b3b 0%, #5a3232 100%);
  box-shadow: 0 4px 16px rgba(218, 54, 51, 0.4);
}

/* Mobile: Stack buttons */
@media (max-width: 576px) {
  .admin-actions {
    flex-direction: column;
  }

  .admin-actions button {
    width: 100%;
  }
}
</style>
