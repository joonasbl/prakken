<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import { armor as armorDatabase } from '@/data/armor'
import { weapons as weaponDatabase } from '@/data/weapons'
import type { Equipment, HitLocation } from '@/types/equipment'
import type { Weapon } from '@/types/weapon'

const wizardStore = useCharacterCreationStore()

// Type for combined items
type Item = Equipment | Weapon

// Filter state
type FilterCategory = 'armor' | 'weapon' | 'gear' | 'all'
const activeFilter = ref<FilterCategory>('all')

// Hit location display names and icons
const hitLocationInfo: Record<HitLocation, { name: string; icon: string }> = {
  head: { name: 'Pää', icon: 'fa-user' },
  chest: { name: 'Rinta', icon: 'fa-shield-halved' },
  stomach: { name: 'Vatsa', icon: 'fa-shield-halved' },
  left_arm: { name: 'V. käsi', icon: 'fa-hand' },
  right_arm: { name: 'O. käsi', icon: 'fa-hand' },
  left_leg: { name: 'V. jalka', icon: 'fa-person-walking' },
  right_leg: { name: 'O. jalka', icon: 'fa-person-walking' },
}

// Computed: Current equipped items
const equippedItems = computed(() => wizardStore.draft.equippedItems)

// Computed: Get equipped armor objects (for armor point calculation)
const equippedArmor = computed<Equipment[]>(() => {
  return equippedItems.value
    .map((id) => armorDatabase.find((item) => item.id === id))
    .filter((item): item is Equipment => item !== undefined)
})

// Computed: Get equipped equipment objects (armor + weapons for weight)
const equippedEquipment = computed<(Equipment | Weapon)[]>(() => {
  const armorItems = equippedItems.value
    .map((id) => armorDatabase.find((item) => item.id === id))
    .filter((item): item is Equipment => item !== undefined)

  const weaponItems = equippedItems.value
    .map((id) => weaponDatabase.find((item) => item.id === id))
    .filter((item): item is Weapon => item !== undefined)

  return [...armorItems, ...weaponItems]
})

// Computed: Total weight (armor + weapons)
const totalWeight = computed(() => {
  return equippedEquipment.value.reduce((sum, item) => sum + item.weight, 0)
})

// Computed: Max carrying capacity (kantokyky from substats)
const maxWeight = computed(() => {
  return wizardStore.draft.subStats?.kantokyky || 200
})

// Computed: Weight percentage
const weightPercentage = computed(() => {
  return Math.min(100, Math.round((totalWeight.value / maxWeight.value) * 100))
})

// Computed: Armor points by location
const armorPointsByLocation = computed(() => {
  const locations: HitLocation[] = [
    'head',
    'chest',
    'stomach',
    'left_arm',
    'right_arm',
    'left_leg',
    'right_leg',
  ]

  const result: Record<HitLocation, number> = {
    head: 0,
    chest: 0,
    stomach: 0,
    left_arm: 0,
    right_arm: 0,
    left_leg: 0,
    right_leg: 0,
  }

  for (const location of locations) {
    const locationArmor = equippedArmor.value.filter(
      (item) => item.hitLocations?.includes(location) && item.armorPoints
    )

    if (locationArmor.length === 0) {
      result[location] = 0
      continue
    }

    // Separate hard and soft armor
    const hardArmor = locationArmor.filter((item) => item.armorType === 'hard')
    const softArmor = locationArmor.filter((item) => item.armorType === 'soft')

    let totalArmor = 0

    if (hardArmor.length > 0) {
      // Hard armor: full value
      const highestHardArmor = Math.max(...hardArmor.map((item) => item.armorPoints || 0))
      totalArmor += highestHardArmor

      // Soft under hard: 50% value
      for (const armor of softArmor) {
        const reducedValue = Math.max(1, Math.floor((armor.armorPoints || 0) / 2))
        totalArmor += reducedValue
      }
    } else if (softArmor.length > 0) {
      // Only soft: outermost full, rest 50%
      const sortedSoftArmor = [...softArmor].sort(
        (a, b) => (b.armorPoints || 0) - (a.armorPoints || 0)
      )
      totalArmor += sortedSoftArmor[0].armorPoints || 0

      for (let i = 1; i < sortedSoftArmor.length; i++) {
        const reducedValue = Math.max(1, Math.floor((sortedSoftArmor[i].armorPoints || 0) / 2))
        totalArmor += reducedValue
      }
    }

    result[location] = totalArmor
  }

  return result
})

// Computed: Average armor points
const averageArmorPoints = computed(() => {
  const values = Object.values(armorPointsByLocation.value)
  const sum = values.reduce((a, b) => a + b, 0)
  return Math.round(sum / values.length)
})

// Computed: Filtered equipment list (armor + weapons)
const filteredEquipment = computed<Item[]>(() => {
  if (activeFilter.value === 'all') {
    return [...armorDatabase, ...weaponDatabase]
  }
  if (activeFilter.value === 'weapon') {
    return weaponDatabase
  }
  return armorDatabase.filter((item) => item.category === activeFilter.value)
})

// Type guard for weapons
const isWeapon = (item: Item): item is Weapon => {
  return item.category === 'weapon'
}

// Check if item is equipped
const isEquipped = (itemId: string) => {
  return equippedItems.value.includes(itemId)
}

// Toggle equipment (works for both armor and weapons)
const toggleEquipment = (item: Item) => {
  if (isEquipped(item.id)) {
    // Unequip
    wizardStore.toggleArmorEquipment(item.id)
  } else {
    // Try to equip
    wizardStore.toggleArmorEquipment(item.id)
  }
}

// Get items equipped to a specific location (armor only)
const getItemsAtLocation = (location: HitLocation) => {
  return equippedArmor.value.filter(
    (item) => item.hitLocations?.includes(location)
  )
}

// Filter tabs
const filterTabs: { id: FilterCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Kaikki', icon: 'fa-layer-group' },
  { id: 'armor', label: 'Panssarit', icon: 'fa-shield-halved' },
  { id: 'weapon', label: 'Aseet', icon: 'fa-khanda' },
  { id: 'gear', label: 'Varusteet', icon: 'fa-suitcase' },
]
</script>

<template>
  <div class="equipment-step">
    <!-- Summary Bar -->
    <div class="summary-bar">
      <!-- Weight Display -->
      <div class="weight-display">
        <div class="weight-label">
          <span class="icon"><i class="fas fa-scale-balanced"></i></span>
          <span>Paino:</span>
        </div>
        <div class="weight-bar-container">
          <div class="weight-bar" :style="{ width: weightPercentage + '%' }"></div>
        </div>
        <div class="weight-values">
          <span :class="{ 'warning': weightPercentage > 80, 'over': weightPercentage >= 100 }">
            {{ totalWeight }} naulaa
          </span>
          <span class="weight-max">/ {{ maxWeight }} naulaa</span>
        </div>
      </div>

      <!-- Armor Summary -->
      <div class="armor-summary">
        <div class="armor-label">
          <span class="icon"><i class="fas fa-shield-halved"></i></span>
          <span>Keskim. panssarointi:</span>
        </div>
        <div class="armor-value">{{ averageArmorPoints }}</div>
      </div>
    </div>

    <!-- Hit Location Display -->
    <div class="hit-locations-section">
      <h3 class="section-title">
        <span class="icon"><i class="fas fa-person"></i></span>
        Osumakohdat ja panssarointi
      </h3>
      <div class="hit-locations-grid">
        <div
          v-for="[location, info] of Object.entries(hitLocationInfo)"
          :key="location"
          class="hit-location-card"
          :class="{ 'has-armor': armorPointsByLocation[location as HitLocation] > 0 }"
        >
          <div class="location-header">
            <span class="location-icon">
              <i :class="'fas ' + info.icon"></i>
            </span>
            <span class="location-name">{{ info.name }}</span>
          </div>
          <div class="location-armor">
            <span class="armor-points">{{ armorPointsByLocation[location as HitLocation] }}</span>
            <span class="armor-label">AP</span>
          </div>
          <div v-if="getItemsAtLocation(location as HitLocation).length > 0" class="location-items">
            <div
              v-for="item in getItemsAtLocation(location as HitLocation)"
              :key="item.id"
              class="equipped-item-tag"
              :class="item.armorType"
            >
              {{ item.name }}
              <span v-if="item.armorType" class="armor-type-badge">{{ item.armorType === 'hard' ? 'K' : 'P' }}</span>
            </div>
          </div>
          <div v-else class="no-armor">
            Ei panssaria
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in filterTabs"
        :key="tab.id"
        type="button"
        class="filter-tab"
        :class="{ active: activeFilter === tab.id }"
        @click="activeFilter = tab.id"
      >
        <span class="icon"><i :class="'fas ' + tab.icon"></i></span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Equipment Grid -->
    <div class="equipment-grid">
      <div
        v-for="item in filteredEquipment"
        :key="item.id"
        class="equipment-card"
        :class="{
          selected: isEquipped(item.id),
          'is-armor': item.category === 'armor',
          'is-weapon': isWeapon(item),
          'is-gear': item.category === 'gear',
        }"
        @click="toggleEquipment(item)"
      >
        <div class="card-header">
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-category">{{ item.category }}</span>
          </div>
          <div v-if="'armorType' in item && item.armorType" class="armor-type-indicator" :class="item.armorType">
            {{ item.armorType === 'hard' ? 'Kova' : 'Pehmeä' }}
          </div>
        </div>

        <p v-if="'description' in item && item.description" class="item-description">{{ item.description }}</p>

        <!-- Hit locations for armor -->
        <div v-if="'hitLocations' in item && item.hitLocations && item.hitLocations.length > 0" class="hit-locations-preview">
          <span class="locations-label">Suojaa:</span>
          <div class="locations-list">
            <span
              v-for="loc in item.hitLocations"
              :key="loc"
              class="location-badge"
            >
              <i :class="'fas ' + hitLocationInfo[loc].icon"></i>
              {{ hitLocationInfo[loc].name }}
            </span>
          </div>
        </div>

        <!-- Weapon stats -->
        <div v-if="isWeapon(item)" class="weapon-stats">
          <div class="weapon-stat-row">
            <span class="stat-label">Vaurio:</span>
            <span class="stat-value">{{ item.modes[0].damage }}{{ item.damageBonus ? '+' : '' }}</span>
          </div>
          <div class="weapon-stat-row">
            <span class="stat-label">Pituus:</span>
            <span class="stat-value">{{ item.length }}</span>
          </div>
          <div v-if="item.range" class="weapon-stat-row">
            <span class="stat-label">Kantama:</span>
            <span class="stat-value">{{ item.range }}m</span>
          </div>
          <div class="weapon-stat-row">
            <span class="stat-label">Kädet:</span>
            <span class="stat-value">{{ item.modes.length > 1 ? '1/2' : (item.modes[0].hands === 2 ? '2' : '1') }}</span>
          </div>
        </div>

        <!-- Stats row -->
        <div class="item-stats">
          <div v-if="'armorPoints' in item && item.armorPoints" class="stat-item armor-stat">
            <span class="stat-icon"><i class="fas fa-shield-halved"></i></span>
            <span class="stat-value">{{ item.armorPoints }} AP</span>
          </div>
          <div class="stat-item weight-stat">
            <span class="stat-icon"><i class="fas fa-scale-balanced"></i></span>
            <span class="stat-value">{{ item.weight }} naulaa</span>
          </div>
        </div>

        <!-- Equip button -->
        <div class="card-footer">
          <button
            type="button"
            class="equip-button"
            :class="{ equipped: isEquipped(item.id) }"
          >
            <span class="icon">
              <i :class="isEquipped(item.id) ? 'fas fa-check' : 'fas fa-plus'"></i>
            </span>
            <span>{{ isEquipped(item.id) ? 'Varustettu' : 'Varusta' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.equipment-step {
  padding: 1rem 0;
}

/* ============================================
   Summary Bar
   ============================================ */
.summary-bar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .summary-bar {
    grid-template-columns: 2fr 1fr;
  }
}

/* Weight Display */
.weight-display {
  background: var(--color-bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.weight-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
}

.weight-label .icon {
  color: var(--color-magic-blue);
}

.weight-bar-container {
  height: 12px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.weight-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success) 0%, var(--color-magic-blue) 100%);
  transition: width 0.3s ease, background 0.3s ease;
}

.weight-display:has(.warning) .weight-bar {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.weight-display:has(.over) .weight-bar {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.weight-values {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.weight-values span:first-child {
  font-weight: 700;
  color: var(--color-magic-blue);
}

.weight-values span.warning {
  color: #f59e0b;
}

.weight-values span.over {
  color: #ef4444;
}

.weight-max {
  color: var(--color-text-muted) !important;
  font-weight: 400 !important;
}

/* Armor Summary */
.armor-summary {
  background: var(--color-bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.armor-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  font-size: 0.9rem;
}

.armor-label .icon {
  color: var(--color-success);
}

.armor-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-success);
  text-shadow: 0 0 10px rgba(46, 160, 67, 0.4);
  font-family: var(--font-heading);
}

/* ============================================
   Hit Locations Section
   ============================================ */
.hit-locations-section {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  margin-bottom: 1rem;
}

.section-title .icon {
  color: var(--color-magic-blue);
}

.hit-locations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
  min-width: 0;
}

@media (min-width: 576px) {
  .hit-locations-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
}

@media (min-width: 768px) {
  .hit-locations-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
  }
}

.hit-location-card {
  background: var(--color-bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  min-height: 120px;
  max-width: 100%;
  overflow: hidden;
}

.hit-location-card.has-armor {
  border-color: var(--color-success);
  background: linear-gradient(135deg, rgba(46, 160, 67, 0.1) 0%, rgba(36, 138, 56, 0.05) 100%);
  box-shadow: 0 0 10px rgba(46, 160, 67, 0.2);
}

.location-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.location-icon {
  font-size: 1.25rem;
  color: var(--color-text-muted);
}

.location-name {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  text-align: center;
}

.location-armor {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.armor-points {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-success);
  text-shadow: 0 0 8px rgba(46, 160, 67, 0.4);
}

.armor-label {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  font-family: var(--font-heading);
}

.location-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.equipped-item-tag {
  font-size: 0.55rem;
  padding: 0.2rem 0.3rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equipped-item-tag.hard {
  border: 1px solid var(--color-gold-primary);
  color: var(--color-gold-primary);
}

.equipped-item-tag.soft {
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.armor-type-badge {
  font-size: 0.5rem;
  padding: 0.1rem 0.2rem;
  border-radius: 2px;
  background: var(--color-bg-tertiary);
  flex-shrink: 0;
}

.no-armor {
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

/* ============================================
   Filter Tabs
   ============================================ */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  min-height: 44px;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-weight: 600;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab .icon {
  color: var(--color-text-muted);
}

.filter-tab:hover {
  border-color: var(--color-magic-blue);
  background: var(--color-bg-hover);
}

.filter-tab .icon:hover {
  color: var(--color-magic-blue);
}

.filter-tab.active {
  border-color: var(--color-magic-blue);
  background: linear-gradient(135deg, rgba(74, 144, 217, 0.2) 0%, rgba(53, 122, 189, 0.1) 100%);
}

.filter-tab.active .icon {
  color: var(--color-magic-blue);
}

/* ============================================
   Equipment Grid
   ============================================ */
.equipment-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 576px) {
  .equipment-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .equipment-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.equipment-card {
  background: var(--gradient-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.equipment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.equipment-card.is-armor::before {
  background: linear-gradient(90deg, var(--color-success), var(--color-gold-primary));
}

.equipment-card.is-weapon::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.equipment-card.is-gear::before {
  background: linear-gradient(90deg, var(--color-magic-blue), #3b82f6);
}

.equipment-card:hover {
  border-color: var(--color-magic-blue);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), 0 0 10px rgba(74, 144, 217, 0.2);
}

.equipment-card.selected {
  border-color: var(--color-success);
  background: linear-gradient(135deg, rgba(46, 160, 67, 0.15) 0%, rgba(36, 138, 56, 0.05) 100%);
  box-shadow: var(--shadow-md), 0 0 15px rgba(46, 160, 67, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 600;
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  font-size: 0.95rem;
}

.item-category {
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  text-transform: capitalize;
  align-self: flex-start;
}

.armor-type-indicator {
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  white-space: nowrap;
}

.armor-type-indicator.hard {
  background: rgba(212, 175, 55, 0.2);
  color: var(--color-gold-primary);
  border: 1px solid var(--color-gold-primary);
}

.armor-type-indicator.soft {
  background: rgba(46, 160, 67, 0.2);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.item-description {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0;
}

/* Hit locations preview */
.hit-locations-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.locations-label {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.location-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
}

.location-badge i {
  font-size: 0.6rem;
  color: var(--color-magic-blue);
}

/* Weapon stats */
.weapon-stats {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.5rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  margin: 0.5rem 0;
}

.weapon-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
}

.stat-label {
  color: var(--color-text-muted);
  font-weight: 600;
}

.stat-value {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* Item stats */
.item-stats {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
}

.stat-icon {
  font-size: 0.8rem;
}

.armor-stat .stat-icon,
.armor-stat .stat-value {
  color: var(--color-success);
}

.weight-stat .stat-icon,
.weight-stat .stat-value {
  color: var(--color-text-muted);
}

.stat-value {
  font-weight: 600;
}

/* Card footer */
.card-footer {
  margin-top: 0.5rem;
}

.equip-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  min-height: 44px;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-weight: 600;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all 0.3s ease;
}

.equip-button .icon {
  color: var(--color-magic-blue);
}

.equip-button:hover {
  border-color: var(--color-magic-blue);
  background: var(--color-bg-hover);
}

.equip-button.equipped {
  border-color: var(--color-success);
  background: linear-gradient(135deg, rgba(46, 160, 67, 0.2) 0%, rgba(36, 138, 56, 0.1) 100%);
}

.equip-button.equipped .icon {
  color: var(--color-success);
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .hit-location-card {
    min-height: 100px;
    padding: 0.4rem;
  }

  .location-name {
    font-size: 0.55rem;
  }

  .armor-points {
    font-size: 1.1rem;
  }

  .location-icon {
    font-size: 1rem;
  }

  .equipped-item-tag {
    font-size: 0.5rem;
    padding: 0.15rem 0.25rem;
  }

  .equipment-card {
    padding: 0.75rem;
  }

  .item-name {
    font-size: 0.9rem;
  }

  .equip-button {
    font-size: 0.85rem;
  }
}

/* Extra small screens */
@media (max-width: 374px) {
  .hit-locations-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hit-location-card {
    min-height: 90px;
    padding: 0.3rem;
  }

  .location-name {
    font-size: 0.5rem;
  }

  .armor-points {
    font-size: 1rem;
  }

  .filter-tab span:not(.icon) {
    display: none;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
