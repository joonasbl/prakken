/**
 * Weapons store with utility functions
 */

import { defineStore } from 'pinia'
import { weapons as weaponDatabase } from '@/data/weapons'
import type { Weapon, WeaponType, WeaponMode } from '@/types/weapon'

export const useWeaponsStore = defineStore('weapons', {
  state: (): {
    equippedWeaponId: string | null
    equippedShieldId: string | null
    selectedMode: Record<string, 1 | 2>  // Weapon ID -> selected mode (1H or 2H)
  } => {
    return {
      equippedWeaponId: null,
      equippedShieldId: null,
      selectedMode: {},
    }
  },

  getters: {
    /** Get all weapons */
    allWeapons: (): Weapon[] => weaponDatabase,

    /** Get weapons by type */
    weaponsByType: (): ((type: WeaponType) => Weapon[]) => {
      return (type: WeaponType): Weapon[] => weaponDatabase.filter((weapon) => weapon.type === type)
    },

    /** Get equipped weapon */
    equippedWeapon: (state): Weapon | null => {
      if (!state.equippedWeaponId) return null
      return weaponDatabase.find((w) => w.id === state.equippedWeaponId) || null
    },

    /** Get equipped shield */
    equippedShield: (state): Weapon | null => {
      if (!state.equippedShieldId) return null
      return weaponDatabase.find((w) => w.id === state.equippedShieldId) || null
    },

    /** Get selected mode for a weapon */
    getSelectedMode: (state) => (weaponId: string): WeaponMode | null => {
      const weapon = weaponDatabase.find((w) => w.id === weaponId)
      if (!weapon) return null

      const modeIndex = state.selectedMode[weaponId] ? state.selectedMode[weaponId] - 1 : 0
      return weapon.modes[modeIndex] || weapon.modes[0] || null
    },

    /** Calculate damage with character's vauriobonus */
    calculateDamage: () => (weapon: Weapon, mode: WeaponMode, vauriobonus: number): number => {
      let damage = mode.damage
      if (weapon.damageBonus) {
        damage += vauriobonus
      }
      return Math.max(0, damage)
    },

    /** Check if character can use weapon (meets strength requirement) */
    canUseWeapon: () => (weapon: Weapon, mode: WeaponMode, strength: number): boolean => {
      return strength >= mode.minStrength
    },

    /** Get total weight of equipped weapons */
    totalWeaponWeight: (state): number => {
      let weight = 0
      if (state.equippedWeaponId) {
        const weapon = weaponDatabase.find((w) => w.id === state.equippedWeaponId)
        if (weapon) weight += weapon.weight
      }
      if (state.equippedShieldId) {
        const shield = weaponDatabase.find((w) => w.id === state.equippedShieldId)
        if (shield) weight += shield.weight
      }
      return weight
    },
  },

  actions: {
    /** Equip a weapon */
    equipWeapon(weaponId: string | null) {
      this.equippedWeaponId = weaponId
    },

    /** Equip a shield */
    equipShield(shieldId: string | null) {
      this.equippedShieldId = shieldId
    },

    /** Set weapon mode (1H or 2H) */
    setWeaponMode(weaponId: string, hands: 1 | 2) {
      this.selectedMode[weaponId] = hands
    },

    /** Clear all equipped weapons */
    clearWeapons() {
      this.equippedWeaponId = null
      this.equippedShieldId = null
      this.selectedMode = {}
    },

    /** Set equipped weapons (for loading saved characters) */
    setEquippedWeapons(weaponId: string | null, shieldId: string | null, modes: Record<string, 1 | 2>) {
      this.equippedWeaponId = weaponId
      this.equippedShieldId = shieldId
      this.selectedMode = modes
    },
  },
})
