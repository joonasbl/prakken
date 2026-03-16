<script setup lang="ts">
import { computed, ref } from 'vue'
import { weapons as weaponsDatabase } from '@/data/weapons'
import { armor as armorDatabase } from '@/data/armor'
import type { Weapon } from '@/types/weapon'
import type { Equipment, HitLocation } from '@/types/equipment'

const props = defineProps<{
  itemIds: string[]
  showFilter?: boolean
  showWeight?: boolean
  maxWeight?: number
}>()

// Filter state
const activeFilter = ref<'all' | 'weapon' | 'armor' | 'gear'>('all')

// Weapon mode state (1H or 2H)
const weaponModes = ref<Record<string, 1 | 2>>({})

// Hit location info (reused from Step6Equipment)
const hitLocationInfo: Record<HitLocation, { name: string; icon: string }> = {
  head: { name: 'Pää', icon: 'fa-user' },
  chest: { name: 'Rinta', icon: 'fa-shield-halved' },
  stomach: { name: 'Vatsa', icon: 'fa-shield-halved' },
  left_arm: { name: 'V. käsi', icon: 'fa-hand' },
  right_arm: { name: 'O. käsi', icon: 'fa-hand' },
  left_leg: { name: 'V. jalka', icon: 'fa-person-walking' },
  right_leg: { name: 'O. jalka', icon: 'fa-person-walking' },
}

// Roman numerals for length
const romanNumerals: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
}

// Get all equipped items
const allEquippedItems = computed<(Weapon | Equipment)[]>(() => {
  const weaponItems = props.itemIds
    .map((id) => weaponsDatabase.find((w) => w.id === id))
    .filter((item): item is Weapon => item !== undefined)

  const armorItems = props.itemIds
    .map((id) => armorDatabase.find((a) => a.id === id))
    .filter((item): item is Equipment => item !== undefined)

  return [...weaponItems, ...armorItems]
})

// Filter items by category
const weapons = computed(() =>
  allEquippedItems.value.filter((item): item is Weapon => item.category === 'weapon')
)

const armorItems = computed(() =>
  allEquippedItems.value.filter((item): item is Equipment => item.category === 'armor')
)

const gear = computed(() =>
  allEquippedItems.value.filter((item): item is Equipment => item.category === 'gear')
)

const allItems = computed(() => allEquippedItems.value)

// Total weight
const totalWeight = computed(() => {
  return allEquippedItems.value.reduce((sum, item) => sum + item.weight, 0)
})

// Armor grouped by hit location
const armorByLocation = computed(() => {
  const grouped: Partial<Record<HitLocation, Equipment[]>> = {}

  for (const item of armorItems.value) {
    if (item.hitLocations) {
      for (const location of item.hitLocations) {
        if (!grouped[location]) {
          grouped[location] = []
        }
        grouped[location]!.push(item)
      }
    }
  }

  return grouped
})

// Get armor points for a location
const getArmorPointsForLocation = (location: HitLocation): number => {
  const items = armorByLocation.value[location] || []
  if (items.length === 0) return 0

  // Separate hard and soft armor
  const hardArmor = items.filter((item) => item.armorType === 'hard')
  const softArmor = items.filter((item) => item.armorType === 'soft')

  let totalArmor = 0

  if (hardArmor.length > 0) {
    // Hard armor: full value (highest)
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

  return totalArmor
}

// Toggle weapon mode
const toggleWeaponMode = (weaponId: string) => {
  const weapon = weapons.value.find((w) => w.id === weaponId)
  if (!weapon) return

  const currentMode = weaponModes.value[weaponId] || 1
  const availableModes = weapon.modes.length

  // Toggle between available modes
  weaponModes.value[weaponId] = currentMode === 1 && availableModes > 1 ? 2 : 1
}

// Get current damage based on selected mode
const getCurrentDamage = (weapon: Weapon): number => {
  const modeIndex = (weaponModes.value[weapon.id] || 1) - 1
  return weapon.modes[modeIndex]?.damage || weapon.modes[0].damage
}

// Get alternate damage (for display in parentheses)
const getAlternateDamage = (weapon: Weapon): number | null => {
  if (weapon.modes.length <= 1) return null
  const currentMode = weaponModes.value[weapon.id] || 1
  const altMode = currentMode === 1 ? 2 : 1
  const modeIndex = altMode - 1
  return weapon.modes[modeIndex]?.damage || null
}

// Get current hands based on selected mode
const getCurrentHands = (weapon: Weapon): string => {
  const modeIndex = (weaponModes.value[weapon.id] || 1) - 1
  const hands = weapon.modes[modeIndex]?.hands || weapon.modes[0].hands
  return hands === 1 ? '1' : '2'
}

// Check if weapon has special properties
const hasSpecialProperties = (weapon: Weapon): boolean => {
  return !!(
    weapon.special?.horseback ||
    weapon.special?.slow ||
    weapon.special?.cannotBlock ||
    weapon.special?.canThrow
  )
}

// Show sections based on filter
const showWeapons = computed(() => {
  return activeFilter.value === 'all' || activeFilter.value === 'weapon'
})

const showArmor = computed(() => {
  return activeFilter.value === 'all' || activeFilter.value === 'armor'
})

const showGear = computed(() => {
  return activeFilter.value === 'all' || activeFilter.value === 'gear'
})
</script>

<template>
  <div class="equipment-list-component">
    <!-- Filter Tabs -->
    <div v-if="showFilter" class="filter-tabs">
      <button
        type="button"
        :class="{ active: activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >
        Kaikki ({{ allItems.length }})
      </button>
      <button
        type="button"
        :class="{ active: activeFilter === 'weapon' }"
        @click="activeFilter = 'weapon'"
      >
        Aseet ({{ weapons.length }})
      </button>
      <button
        type="button"
        :class="{ active: activeFilter === 'armor' }"
        @click="activeFilter = 'armor'"
      >
        Panssarit ({{ armorItems.length }})
      </button>
      <button
        type="button"
        :class="{ active: activeFilter === 'gear' }"
        @click="activeFilter = 'gear'"
      >
        Varusteet ({{ gear.length }})
      </button>
    </div>

    <!-- Weight Summary -->
    <div v-if="showWeight && maxWeight" class="weight-summary">
      Paino: <strong>{{ totalWeight }}</strong> / {{ maxWeight }} naulaa
    </div>

    <!-- Weapons Section -->
    <div v-if="showWeapons && weapons.length > 0" class="equipment-category">
      <h3 class="category-title">Aseet</h3>
      <ul class="item-list">
        <li v-for="weapon in weapons" :key="weapon.id" class="item-row weapon-row">
          <div class="item-main">
            <span class="item-name">{{ weapon.name }}</span>
            <span class="item-type">{{ weapon.type }}</span>
          </div>
          <div class="item-details">
            <!-- Damage with mode toggle -->
            <div class="damage-control">
              <span class="stat-label">Vaurio:</span>
              <button
                v-if="weapon.modes.length > 1"
                type="button"
                class="mode-toggle"
                @click="toggleWeaponMode(weapon.id)"
              >
                {{ weaponModes[weapon.id] === 1 ? '1H' : '2H' }}
              </button>
              <span class="damage-value">
                {{ getCurrentDamage(weapon) }}
                <span
                  v-if="getAlternateDamage(weapon)"
                  class="alternate-damage"
                >
                  ({{ getAlternateDamage(weapon) }})
                </span>
                <span v-if="weapon.damageBonus" class="damage-bonus">+</span>
              </span>
            </div>
            <!-- Other properties -->
            <div class="item-properties">
              <span>Pituus: <span class="roman-numeral">{{ romanNumerals[weapon.length] }}</span></span>
              <span>Kädet: {{ getCurrentHands(weapon) }}</span>
              <span v-if="weapon.range">Kantama: {{ weapon.range }}m</span>
            </div>
            <!-- Special properties -->
            <div v-if="hasSpecialProperties(weapon)" class="special-properties">
              <span v-if="weapon.special?.horseback" class="special-tag" title="Vain ratsailta">🐴</span>
              <span v-if="weapon.special?.slow" class="special-tag" title="Hidas">⚡</span>
              <span v-if="weapon.special?.cannotBlock" class="special-tag" title="Ei voi torjua">🚫</span>
              <span v-if="weapon.special?.canThrow" class="special-tag" title="Heittoase">🎯</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Armor Section (grouped by hit location) -->
    <div v-if="showArmor && armorItems.length > 0" class="equipment-category">
      <h3 class="category-title">Panssarit</h3>
      <div
        v-for="(items, location) in armorByLocation"
        :key="location"
        class="location-group"
      >
        <div class="location-header">
          <i :class="'fas ' + hitLocationInfo[location].icon"></i>
          <span>{{ hitLocationInfo[location].name }}</span>
          <span class="location-ap">{{ getArmorPointsForLocation(location) }} AP</span>
        </div>
        <ul class="item-list location-items">
          <li v-for="item in items" :key="item.id" class="item-row armor-row">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-stats">
              {{ item.armorPoints }} AP
              <span class="armor-type-badge" :class="item.armorType">
                {{ item.armorType === 'hard' ? 'Kova' : 'Pehmeä' }}
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Gear Section -->
    <div v-if="showGear && gear.length > 0" class="equipment-category">
      <h3 class="category-title">Muut varusteet</h3>
      <ul class="item-list">
        <li v-for="item in gear" :key="item.id" class="item-row gear-row">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-weight">{{ item.weight }} naulaa</span>
        </li>
      </ul>
    </div>

    <!-- Empty State -->
    <div v-if="allEquippedItems.length === 0" class="empty-state">
      Ei varusteita
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.equipment-list-component {
  padding: 0.5rem;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.filter-tabs button {
  padding: 0.5rem 1rem;
  min-height: 44px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-weight: 600;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.filter-tabs button:hover {
  background: var(--color-bg-hover);
  border-color: var(--border-gold);
}

.filter-tabs button.active {
  background: linear-gradient(135deg, var(--color-magic-blue) 0%, #357abd 100%);
  border-color: var(--color-magic-blue);
  color: white;
  box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3);
}

/* Weight Summary */
.weight-summary {
  padding: 0.75rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.weight-summary strong {
  color: var(--color-magic-blue);
}

/* Categories */
.equipment-category {
  margin-bottom: 1.5rem;
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

/* Item List */
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.3s ease;
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:hover {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
}

.item-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.item-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
}

.item-type {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  text-transform: capitalize;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
}

/* Weapon Specific */
.damage-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stat-label {
  color: var(--color-text-muted);
  font-weight: 600;
}

.mode-toggle {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 32px;
}

.mode-toggle:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-magic-blue);
}

.damage-value {
  font-weight: 700;
  color: var(--color-success);
}

.alternate-damage {
  color: var(--color-text-muted);
  font-weight: 400;
  font-size: 0.9em;
}

.damage-bonus {
  color: var(--color-gold-primary);
  font-weight: bold;
}

.item-properties {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: var(--color-text-secondary);
}

.roman-numeral {
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

/* Special Properties */
.special-properties {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.special-tag {
  font-size: 1rem;
  cursor: help;
}

/* Armor Specific */
.location-group {
  margin-bottom: 1rem;
}

.location-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}

.location-header i {
  color: var(--color-magic-blue);
}

.location-ap {
  margin-left: auto;
  font-weight: 700;
  color: var(--color-success);
  font-size: 0.9rem;
}

.location-items {
  margin-left: 0.5rem;
  border-left: 2px solid var(--border-color);
  padding-left: 0.75rem;
}

.armor-type-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-sm);
  margin-left: 0.25rem;
  font-weight: 600;
}

.armor-type-badge.hard {
  background: rgba(212, 175, 55, 0.2);
  color: var(--color-gold-primary);
  border: 1px solid var(--color-gold-primary);
}

.armor-type-badge.soft {
  background: rgba(46, 160, 67, 0.2);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

/* Gear Specific */
.item-weight {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

/* Empty State */
.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .filter-tabs {
    gap: 0.35rem;
  }

  .filter-tabs button {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }

  .item-row {
    padding: 0.5rem;
  }

  .item-properties {
    font-size: 0.8rem;
    gap: 0.5rem;
  }

  .location-header {
    padding: 0.4rem 0.5rem;
    font-size: 0.9rem;
  }
}
</style>
