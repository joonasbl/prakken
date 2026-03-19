<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useShoppingStore } from '@/stores/shopping'
import ShoppingItemCard from '@/components/ShoppingItemCard.vue'
import { formatPrice } from '@/utils/shopping'

const shoppingStore = useShoppingStore()

const selectedCategory = ref<string | null>(null)

onMounted(() => {
  shoppingStore.fetchAll()
})

const categories = computed(() => shoppingStore.categories)
const items = computed(() => {
  if (selectedCategory.value) {
    return shoppingStore.availableItemsByCategory(selectedCategory.value)
  }
  return shoppingStore.availableItems
})

const itemsWithCategories = computed(() => {
  return items.value.map((item) => ({
    item,
    category: shoppingStore.getCategoryById(item.categoryId),
  }))
})

const totalValue = computed(() => {
  return items.value.reduce((sum, item) => sum + item.currentPrice, 0)
})

const selectCategory = (categoryId: string | null) => {
  selectedCategory.value = categoryId
}
</script>

<template>
  <div class="shopping-list-view">
    <div class="view-header">
      <div class="header-content">
        <h1>
          <span class="icon"><i class="fas fa-store"></i></span>
          <span>Ihmeiden katu</span>
        </h1>
        <p class="view-subtitle">
          Saatavilla olevat esineet ja tarvikkeet
        </p>
      </div>

      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-icon"><i class="fas fa-box"></i></span>
          <span class="stat-value">{{ items.length }}</span>
          <span class="stat-label">esinettä</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon"><i class="fas fa-coins"></i></span>
          <span class="stat-value">{{ formatPrice(totalValue) }}</span>
          <span class="stat-label">yhteisarvo</span>
        </div>
      </div>
    </div>

    <!-- Category Filter -->
    <div v-if="categories.length > 0" class="category-filter">
      <button
        type="button"
        class="filter-chip"
        :class="{ active: selectedCategory === null }"
        @click="selectCategory(null)"
      >
        Kaikki
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        class="filter-chip"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Items Grid -->
    <div v-if="itemsWithCategories.length === 0" class="empty-state">
      <span class="empty-icon"><i class="fas fa-store-slash"></i></span>
      <p>Ei saatavilla olevia esineitä.</p>
      <p class="empty-hint">
        {{ selectedCategory ? 'Valitse toinen kategoria tai tule myöhemmin uudelleen.' : 'Tarkista myöhemmin uudelleen.' }}
      </p>
    </div>

    <div v-else class="items-grid">
      <ShoppingItemCard
        v-for="{ item, category } in itemsWithCategories"
        :key="item.id"
        :item="item"
        :category="category"
        :show-admin-actions="false"
      />
    </div>

    <!-- Info Footer -->
    <div class="info-footer">
      <p>
        <i class="fas fa-info-circle"></i>
        Hinnat ja saatavuus vaihtelevat. Tarkista hinnat usein!
      </p>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.shopping-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .shopping-list-view {
    padding: 2rem;
  }
}

/* View Header */
.view-header {
  margin-bottom: 2rem;
}

.header-content {
  margin-bottom: var(--space-lg);
}

.view-header h1 {
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
  .view-header h1 {
    font-size: 2rem;
  }
}

.view-header h1 .icon {
  color: var(--color-gold-primary);
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.5));
}

.view-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  margin-top: var(--space-xs);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
}

.stat-icon {
  color: var(--color-magic-blue);
  font-size: 1.2em;
}

.stat-value {
  font-weight: 600;
  color: var(--color-gold-primary);
  font-size: var(--font-size-lg);
}

.stat-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Category Filter */
.category-filter {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.filter-chip {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-family: var(--font-heading);
  font-size: var(--font-size-sm);
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 44px;
  display: flex;
  align-items: center;
}

.filter-chip:hover {
  background: var(--color-bg-hover);
  border-color: var(--border-gold);
  color: var(--color-gold-primary);
}

.filter-chip.active {
  background: var(--gradient-gold);
  color: var(--color-bg-primary);
  border-color: var(--color-gold-light);
  font-weight: 600;
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

.empty-state::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
  opacity: 0.5;
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
  margin-bottom: var(--space-sm);
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
}

/* Info Footer */
.info-footer {
  margin-top: 2rem;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
}

.info-footer p {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.info-footer .icon {
  color: var(--color-magic-blue);
}

/* Mobile: Stack stats */
@media (max-width: 576px) {
  .stats-bar {
    flex-direction: column;
  }

  .stat-item {
    width: 100%;
    justify-content: center;
  }

  .view-header h1 {
    flex-direction: column;
    text-align: center;
  }
}
</style>
