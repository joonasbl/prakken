/**
 * Equipment store with armor layering logic
 * 
 * Layering rules:
 * - Only ONE layer of hard armor per hit location
 * - Multiple soft armor layers allowed
 * - Soft armor under hard armor: 50% value (rounded down, min 1)
 * - Soft armor under soft armor: 50% value (rounded down, min 1)
 * - Shields provide separate armor points (not tied to hit locations)
 */

import { defineStore } from 'pinia'
import type { Equipment, HitLocation } from '@/types/equipment'
import { armor as armorDatabase } from '@/data/armor'

export const useEquipmentStore = defineStore('equipment', {
  state: (): {
    equippedItems: string[]  // Array of equipment IDs
  } => {
    return {
      equippedItems: [],
    }
  },

  getters: {
    /** Get all equipped equipment objects */
    equippedEquipment: (state): Equipment[] => {
      return state.equippedItems
        .map((id) => armorDatabase.find((item) => item.id === id))
        .filter((item): item is Equipment => item !== undefined)
    },

    /** Calculate total weight of all equipped items */
    totalWeight: function(): number {
      return this.equippedItems
        .map((id) => armorDatabase.find((item) => item.id === id)?.weight || 0)
        .reduce((sum: number, weight: number) => sum + weight, 0)
    },

    /** Calculate armor points per hit location with layering rules */
    armorPointsByLocation: function(): Record<HitLocation, number> {
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
        const armorAtLocation = this.equippedEquipment.filter(
          (item: Equipment) => item.hitLocations?.includes(location)
        )
        result[location] = calculateArmorForLocation(armorAtLocation, location)
      }

      return result
    },

    /** Get total armor points summary */
    totalArmorPoints: function(): {
      byLocation: Record<HitLocation, number>
      average: number
    } {
      const byLocation = this.armorPointsByLocation

      const values = Object.values(byLocation) as number[]
      const average = Math.round(values.reduce((sum: number, val: number) => sum + val, 0) / values.length)

      return { byLocation, average }
    },
  },

  actions: {
    /**
     * Toggle equipment (equip or unequip)
     * Returns true if successful, false if validation failed
     */
    toggleEquipment(equipmentId: string): { success: boolean; error?: string } {
      const item = armorDatabase.find((item) => item.id === equipmentId)
      if (!item) {
        return { success: false, error: 'Item not found' }
      }

      const isEquipped = this.equippedItems.includes(equipmentId)

      if (isEquipped) {
        // Unequip
        this.equippedItems = this.equippedItems.filter((id) => id !== equipmentId)
        return { success: true }
      } else {
        // Equip - validate first
        const validation = this.canEquip(item)
        if (!validation.canEquip) {
          return { success: false, error: validation.error }
        }

        this.equippedItems.push(equipmentId)
        return { success: true }
      }
    },

    /**
     * Check if an item can be equipped based on layering rules
     */
    canEquip(item: Equipment): { canEquip: boolean; error?: string } {
      if (!item.hitLocations || item.armorType === undefined) {
        // Non-armor items can always be equipped
        return { canEquip: true }
      }

      // Check each hit location this item would cover
      for (const location of item.hitLocations) {
        const locationValidation = this.canEquipAtLocation(item, location)
        if (!locationValidation.canEquip) {
          return locationValidation
        }
      }

      return { canEquip: true }
    },

    /**
     * Check if item can be equipped at a specific hit location
     */
    canEquipAtLocation(item: Equipment, location: HitLocation): { canEquip: boolean; error?: string } {
      if (!item.hitLocations || !item.hitLocations.includes(location)) {
        return { canEquip: false, error: 'Tämä varuste ei suojaa tätä osumakohtaa.' }
      }

      // Get all armor currently equipped to this location
      const locationArmor = this.equippedEquipment.filter(
        (equipped) =>
          equipped.hitLocations?.includes(location) &&
          equipped.category === 'armor'
      )

      // If trying to equip hard armor
      if (item.armorType === 'hard') {
        const hasHardArmor = locationArmor.some((armor) => armor.armorType === 'hard')
        if (hasHardArmor) {
          return {
            canEquip: false,
            error: 'Tähän osumakohtaan on jo varustettu kova panssari. Vain yksi kova panssari sallittu.',
          }
        }
      }

      return { canEquip: true }
    },

    /**
     * Clear all equipped items
     */
    clearEquipment() {
      this.equippedItems = []
    },

    /**
     * Set equipped items (for loading saved characters)
     */
    setEquippedItems(itemIds: string[]) {
      this.equippedItems = itemIds
    },
  },
})

/**
 * Calculate armor points for a specific hit location
 * 
 * Rules:
 * - Hard armor: full value (only one allowed)
 * - Soft armor under hard: 50% value (rounded down, min 1)
 * - Soft armor under soft: 50% value (rounded down, min 1)
 * - Multiple soft armors: outermost full value, others 50%
 */
function calculateArmorForLocation(equippedItems: Equipment[], location: HitLocation): number {
  // Get all armor pieces covering this location
  const locationArmor = equippedItems.filter(
    (item) =>
      item.category === 'armor' &&
      item.hitLocations?.includes(location) &&
      item.armorPoints !== undefined
  )

  if (locationArmor.length === 0) {
    return 0
  }

  // Separate hard and soft armor
  const hardArmor = locationArmor.filter((item) => item.armorType === 'hard')
  const softArmor = locationArmor.filter((item) => item.armorType === 'soft')

  let totalArmor = 0

  // Hard armor: use highest value (should only be one due to validation)
  if (hardArmor.length > 0) {
    const highestHardArmor = Math.max(...hardArmor.map((item) => item.armorPoints || 0))
    totalArmor += highestHardArmor

    // Soft armor under hard: 50% value each
    for (const armor of softArmor) {
      const reducedValue = Math.max(1, Math.floor((armor.armorPoints || 0) / 2))
      totalArmor += reducedValue
    }
  } else {
    // Only soft armor: outermost full value, rest 50%
    if (softArmor.length > 0) {
      // Sort by armor points (highest first = outermost)
      const sortedSoftArmor = [...softArmor].sort(
        (a, b) => (b.armorPoints || 0) - (a.armorPoints || 0)
      )

      // First (outermost) gets full value
      totalArmor += sortedSoftArmor[0].armorPoints || 0

      // Rest get 50% value
      for (let i = 1; i < sortedSoftArmor.length; i++) {
        const reducedValue = Math.max(1, Math.floor((sortedSoftArmor[i].armorPoints || 0) / 2))
        totalArmor += reducedValue
      }
    }
  }

  return totalArmor
}
