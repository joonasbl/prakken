<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useShoppingStore } from '@/stores/shopping'
import type { ShoppingItem, ShoppingItemDraft } from '@/types/shopping'
import ShoppingItemCard from '@/components/ShoppingItemCard.vue'
import ShoppingItemModal from '@/components/ShoppingItemModal.vue'

const shoppingStore = useShoppingStore()

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<ShoppingItem | null>(null)

// Category management
const isCategoryModalOpen = ref(false)
const newCategoryName = ref('')
const newCategoryDescription = ref('')

onMounted(() => {
  shoppingStore.fetchAll()
})

const resetAllData = async () => {
  if (confirm('Haluatko varmasti tyhjentää KAIKKI kauppatiedot tietokannasta? Tätä ei voi perua.')) {
    // Delete all items
    for (const item of shoppingStore.items) {
      await shoppingStore.deleteItem(item.id.toString())
    }
    // Delete all categories
    for (const cat of shoppingStore.categories) {
      await shoppingStore.deleteCategory(cat.id)
    }
    // Refresh data
    await shoppingStore.fetchAll()
    alert('Kauppatiedot tyhjennetty.')
  }
}

const items = computed(() => shoppingStore.itemsSorted)
const categories = computed(() => shoppingStore.categories)

const itemsWithCategories = computed(() => {
  return items.value.map((item) => ({
    item,
    category: shoppingStore.getCategoryById(item.categoryId),
  }))
})

// ===== Item Actions =====
const openAddModal = () => {
  editingItem.value = null
  isModalOpen.value = true
}

const openEditModal = (id: string) => {
  editingItem.value = shoppingStore.getItemById(id)
  isModalOpen.value = true
}

const handleSaveItem = (draft: ShoppingItemDraft) => {
  if (editingItem.value) {
    shoppingStore.updateItem(String(editingItem.value.id), draft)
  } else {
    shoppingStore.addItem(draft)
  }
}

const handleDeleteItem = (id: string) => {
  if (confirm('Haluatko varmasti poistaa tämän esineen?')) {
    shoppingStore.deleteItem(id)
  }
}

const handleRerollItem = (id: string) => {
  shoppingStore.rerollItemBoth(id)
}

const handleUpdatePrice = (id: string, price: number) => {
  shoppingStore.updateItemPrice(id, price)
}

const handleToggleAvailability = (id: string) => {
  shoppingStore.toggleItemAvailability(id)
}

// ===== Bulk Actions =====
const handleRerollAll = () => {
  const count = shoppingStore.rerollAll()
  alert(`Kaikkien ${count} esineen hinnat ja saatavuus on päivitetty.`)
}

const handleRerollAllPrices = () => {
  const count = shoppingStore.rerollAllPrices()
  alert(`Kaikkien ${count} esineen hinnat on päivitetty.`)
}

const handleRerollAllAvailability = () => {
  const count = shoppingStore.rerollAllAvailability()
  alert(`Kaikkien ${count} esineen saatavuus on päivitetty.`)
}

// ===== Category Actions =====
const openCategoryModal = () => {
  newCategoryName.value = ''
  newCategoryDescription.value = ''
  isCategoryModalOpen.value = true
}

const handleAddCategory = () => {
  if (!newCategoryName.value.trim()) return
  
  shoppingStore.addCategory(newCategoryName.value.trim(), newCategoryDescription.value.trim())
  isCategoryModalOpen.value = false
}

const handleDeleteCategory = (id: string) => {
  try {
    shoppingStore.deleteCategory(id)
  } catch {
    alert('Kategoriaa ei voi poistaa, koska siinä on vielä esineitä.')
  }
}
</script>

<template>
  <div class="admin-shopping-view">
    <div class="view-header">
      <div class="header-content">
        <h1>
          <span class="icon"><i class="fas fa-tools"></i></span>
          <span>Kaupanhallinta</span>
        </h1>
        <p class="view-subtitle">
          Hallinnoi esineitä, hintoja ja saatavuutta
        </p>
      </div>

      <div class="header-actions">
        <button type="button" class="btn-add" @click="openAddModal">
          <span class="icon"><i class="fas fa-plus"></i></span>
          <span>Lisää esine</span>
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div class="bulk-actions">
      <div class="action-group">
        <h3>Päivitä kaikki</h3>
        <div class="action-buttons">
          <button type="button" class="btn-reroll-all" @click="handleRerollAll">
            <span class="icon"><i class="fas fa-dice-d20"></i></span>
            <span>Reroll kaikki</span>
          </button>
          <button type="button" class="btn-reroll-prices" @click="handleRerollAllPrices">
            <span class="icon"><i class="fas fa-coins"></i></span>
            <span>Vain hinnat</span>
          </button>
          <button type="button" class="btn-reroll-availability" @click="handleRerollAllAvailability">
            <span class="icon"><i class="fas fa-percent"></i></span>
            <span>Vain saatavuus</span>
          </button>
        </div>
      </div>

      <div class="action-group">
        <h3>Data</h3>
        <div class="action-buttons">
          <button type="button" class="btn-reroll-all" @click="handleRerollAll">
            <span class="icon"><i class="fas fa-dice-d20"></i></span>
            <span>Reroll kaikki</span>
          </button>
          <button type="button" class="btn-reset-data" @click="resetAllData">
            <span class="icon"><i class="fas fa-trash-restore"></i></span>
            <span>Tyhjennä kaikki</span>
          </button>
        </div>
      </div>

      <div class="action-group">
        <h3>Kategoriat</h3>
        <div class="category-list">
          <div v-for="cat in categories" :key="cat.id" class="category-item">
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-count">{{ items.filter(i => i.categoryId === cat.id).length }} esinettä</span>
            <button
              type="button"
              class="btn-delete-category"
              @click="handleDeleteCategory(cat.id)"
              title="Poista kategoria"
            >
              <span class="icon"><i class="fas fa-trash"></i></span>
            </button>
          </div>
          <button type="button" class="btn-add-category" @click="openCategoryModal">
            <span class="icon"><i class="fas fa-plus"></i></span>
            <span>Lisää kategoria</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">Yhteensä</span>
        <span class="stat-value">{{ items.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Saatavilla</span>
        <span class="stat-value success">{{ shoppingStore.availableItems.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Ei saatavilla</span>
        <span class="stat-value danger">{{ items.length - shoppingStore.availableItems.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Kategoriat</span>
        <span class="stat-value">{{ categories.length }}</span>
      </div>
    </div>

    <!-- Items Grid -->
    <div v-if="itemsWithCategories.length === 0" class="empty-state">
      <span class="empty-icon"><i class="fas fa-box-open"></i></span>
      <p>Ei vielä esineitä.</p>
      <button type="button" class="btn-create" @click="openAddModal">
        <span class="icon"><i class="fas fa-plus"></i></span>
        <span>Lisää ensimmäinen esine</span>
      </button>
    </div>

    <div v-else class="items-grid">
      <ShoppingItemCard
        v-for="{ item, category } in itemsWithCategories"
        :key="item.id"
        :item="item"
        :category="category"
        :show-admin-actions="true"
        @edit="openEditModal"
        @delete="handleDeleteItem"
        @reroll="handleRerollItem"
        @update-price="handleUpdatePrice"
        @toggle-availability="handleToggleAvailability"
      />
    </div>

    <!-- Item Modal -->
    <ShoppingItemModal
      v-model="isModalOpen"
      :item="editingItem"
      :categories="categories"
      @save="handleSaveItem"
    />

    <!-- Category Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isCategoryModalOpen" class="modal-overlay" @click.self="isCategoryModalOpen = false">
          <div class="modal-content modal-small">
            <h2 class="modal-title">Lisää kategoria</h2>
            
            <div class="form-group">
              <label for="cat-name">Nimi</label>
              <input
                id="cat-name"
                v-model="newCategoryName"
                type="text"
                placeholder="esim. Velhojen liemet"
              />
            </div>

            <div class="form-group">
              <label for="cat-desc">Kuvaus (valinnainen)</label>
              <textarea
                id="cat-desc"
                v-model="newCategoryDescription"
                rows="2"
                placeholder="esim. Taikajuomat ja potionit"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="isCategoryModalOpen = false">
                Peruuta
              </button>
              <button type="button" class="btn-save" @click="handleAddCategory">
                Lisää
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.admin-shopping-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .admin-shopping-view {
    padding: 2rem;
  }
}

/* View Header */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: 1.5rem;
  color: var(--color-gold-primary);
  margin: 0;
  font-family: var(--font-heading);
  letter-spacing: 0.08em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

@media (min-width: 768px) {
  .header-content h1 {
    font-size: 2rem;
  }
}

.header-content h1 .icon {
  color: var(--color-gold-primary);
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.5));
}

.view-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  margin-top: var(--space-xs);
}

.header-actions .btn-add {
  background: var(--gradient-gold);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-gold-light);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
  min-height: 44px;
}

.header-actions .btn-add:hover {
  box-shadow: var(--shadow-gold-strong);
  transform: translateY(-1px);
}

/* Bulk Actions */
.bulk-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .bulk-actions {
    grid-template-columns: 2fr 1fr;
  }
}

.action-group {
  background: var(--color-bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.action-group h3 {
  font-family: var(--font-heading);
  color: var(--color-gold-primary);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--space-md) 0;
  letter-spacing: 0.05em;
}

.action-buttons {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.action-buttons button {
  flex: 1;
  min-width: 140px;
}

.btn-init-data {
  background: var(--gradient-forest);
  border: 1px solid var(--color-gold-primary);
  color: var(--color-text-primary);
}

.btn-init-data:hover {
  background: linear-gradient(135deg, #3d5c41 0%, #2f4a34 100%);
  box-shadow: 0 4px 16px rgba(46, 160, 67, 0.4);
}

.btn-reset-data {
  background: var(--gradient-crimson);
  border: 1px solid #a38b5d;
  color: var(--color-text-primary);
}

.btn-reset-data:hover {
  background: linear-gradient(135deg, #6c3b3b 0%, #5a3232 100%);
  box-shadow: 0 4px 16px rgba(218, 54, 51, 0.4);
}

.btn-reroll-all {
  background: var(--gradient-magic-blue);
  border: 1px solid var(--color-gold-primary);
  color: var(--color-text-primary);
}

.btn-reroll-prices {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color-light);
  color: var(--color-text-primary);
}

.btn-reroll-prices:hover {
  background: var(--color-bg-hover);
  border-color: var(--border-gold);
  color: var(--color-gold-primary);
}

.btn-reroll-availability {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color-light);
  color: var(--color-text-primary);
}

.btn-reroll-availability:hover {
  background: var(--color-bg-hover);
  border-color: var(--border-gold);
  color: var(--color-gold-primary);
}

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.category-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}

.category-name {
  flex: 1;
  font-weight: 600;
  color: var(--color-text-primary);
}

.category-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.btn-delete-category {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-sm);
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.btn-delete-category:hover {
  color: var(--color-danger);
  background: var(--color-bg-hover);
}

.btn-add-category {
  background: var(--color-bg-tertiary);
  border: 1px dashed var(--border-color-light);
  color: var(--color-text-secondary);
  padding: var(--space-sm) var(--space-md);
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-add-category:hover {
  border-color: var(--border-gold);
  color: var(--color-gold-primary);
  background: var(--color-bg-hover);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: 2rem;
  padding: var(--space-md);
  background: var(--color-bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

@media (min-width: 576px) {
  .stats-bar {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  text-align: center;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-gold-primary);
}

.stat-value.success {
  color: var(--color-success);
}

.stat-value.danger {
  color: var(--color-danger);
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 576px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1.5rem;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
  display: block;
}

.empty-state p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-lg);
}

.btn-create {
  background: var(--gradient-gold);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-gold-light);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
}

.btn-create:hover {
  box-shadow: var(--shadow-gold-strong);
  transform: translateY(-1px);
}

/* Category Modal */
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
}

.modal-content {
  background: var(--color-bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  padding: var(--space-lg);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
}

.modal-content.modal-small {
  max-width: 400px;
}

.modal-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-xl);
  color: var(--color-gold-primary);
  margin: 0 0 var(--space-lg) 0;
  letter-spacing: 0.05em;
}

.form-group {
  margin-bottom: var(--space-md);
}

.form-group label {
  display: block;
  font-family: var(--font-heading);
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
  margin-bottom: var(--space-xs);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
}

.form-group textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
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

/* Mobile */
@media (max-width: 576px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-content {
    text-align: center;
  }

  .header-content h1 {
    justify-content: center;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn-add {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons button {
    width: 100%;
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
