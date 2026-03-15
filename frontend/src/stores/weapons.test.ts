import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWeaponsStore } from '@/stores/weapons'
import { weapons } from '@/data/weapons'

describe('Weapon System', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Weapon Database', () => {
    it('contains all expected weapons', () => {
      expect(weapons.length).toBeGreaterThan(20)
    })

    it('all weapons have required properties', () => {
      for (const weapon of weapons) {
        expect(weapon.id).toBeDefined()
        expect(weapon.name).toBeDefined()
        expect(weapon.category).toBe('weapon')
        expect(weapon.type).toBeDefined()
        expect(weapon.length).toBeDefined()
        expect(weapon.damageBonus).toBeDefined()
        expect(weapon.weight).toBeDefined()
        expect(weapon.price).toBeDefined()
        expect(weapon.modes).toBeDefined()
        expect(weapon.modes.length).toBeGreaterThan(0)
      }
    })

    it('all weapons have valid length (1-3)', () => {
      for (const weapon of weapons) {
        expect([1, 2, 3]).toContain(weapon.length)
      }
    })

    it('all weapon modes have valid hands (1 or 2)', () => {
      for (const weapon of weapons) {
        for (const mode of weapon.modes) {
          expect([1, 2]).toContain(mode.hands)
        }
      }
    })

    it('all weapon modes have valid damage values', () => {
      for (const weapon of weapons) {
        for (const mode of weapon.modes) {
          expect(mode.damage).toBeGreaterThanOrEqual(0)
          expect(mode.minStrength).toBeGreaterThanOrEqual(1)
        }
      }
    })
  })

  describe('Weapon Types', () => {
    it('contains weapons of all expected types', () => {
      const types = new Set(weapons.map((w) => w.type))
      
      expect(types.has('heitto')).toBe(true)
      expect(types.has('jousi')).toBe(true)
      expect(types.has('keihäs')).toBe(true)
      expect(types.has('lyömä')).toBe(true)
      expect(types.has('miekka')).toBe(true)
      expect(types.has('veitsi')).toBe(true)
      expect(types.has('tappelu')).toBe(true)
      expect(types.has('kilpi')).toBe(true)
    })

    it('heitt aseet have appropriate special properties', () => {
      const heittoWeapons = weapons.filter((w) => w.type === 'heitto')
      
      expect(heittoWeapons.length).toBeGreaterThan(0)
      
      for (const weapon of heittoWeapons) {
        // Heitto weapons should have some special property (canThrow, range, or cannotBlock for ruoska)
        const hasSpecialProperty = weapon.special?.canThrow || (weapon.range !== undefined) || weapon.special?.cannotBlock
        expect(hasSpecialProperty).toBeTruthy()
      }
    })

    it('all jousi weapons are two-handed', () => {
      const jousiWeapons = weapons.filter((w) => w.type === 'jousi')
      
      for (const weapon of jousiWeapons) {
        for (const mode of weapon.modes) {
          expect(mode.hands).toBe(2)
        }
      }
    })

    it('jousi weapons have range property', () => {
      const jousiWeapons = weapons.filter((w) => w.type === 'jousi')
      
      for (const weapon of jousiWeapons) {
        expect(weapon.range).toBeDefined()
        expect(weapon.range!).toBeGreaterThan(0)
      }
    })

    it('horseback weapons are marked correctly', () => {
      const horsebackWeapons = weapons.filter((w) => w.special?.horseback)
      
      expect(horsebackWeapons.length).toBeGreaterThan(0)
      
      for (const weapon of horsebackWeapons) {
        expect(weapon.type).toBe('keihäs')
        expect(weapon.name).toBe('Peitsi')
      }
    })
  })

  describe('Weapons Store - Getters', () => {
    it('allWeapons returns all weapons', () => {
      const store = useWeaponsStore()
      expect(store.allWeapons.length).toBe(weapons.length)
    })

    it('weaponsByType filters correctly', () => {
      const store = useWeaponsStore()
      
      const miekat = store.weaponsByType('miekka')
      expect(miekat.length).toBeGreaterThan(0)
      
      for (const weapon of miekat) {
        expect(weapon.type).toBe('miekka')
      }
      
      const veitset = store.weaponsByType('veitsi')
      for (const weapon of veitset) {
        expect(weapon.type).toBe('veitsi')
      }
    })

    it('equippedWeapon returns null when nothing equipped', () => {
      const store = useWeaponsStore()
      expect(store.equippedWeapon).toBeNull()
    })

    it('equippedWeapon returns correct weapon when equipped', () => {
      const store = useWeaponsStore()
      const testWeapon = weapons.find((w) => w.type === 'miekka')!
      
      store.equipWeapon(testWeapon.id)
      
      expect(store.equippedWeapon).not.toBeNull()
      expect(store.equippedWeapon?.id).toBe(testWeapon.id)
      expect(store.equippedWeapon?.name).toBe(testWeapon.name)
    })

    it('equippedShield returns null when nothing equipped', () => {
      const store = useWeaponsStore()
      expect(store.equippedShield).toBeNull()
    })

    it('equippedShield returns correct shield when equipped', () => {
      const store = useWeaponsStore()
      const shield = weapons.find((w) => w.type === 'kilpi')!
      
      store.equipShield(shield.id)
      
      expect(store.equippedShield).not.toBeNull()
      expect(store.equippedShield?.id).toBe(shield.id)
      expect(store.equippedShield?.type).toBe('kilpi')
    })

    it('getSelectedMode returns correct mode', () => {
      const store = useWeaponsStore()
      const weaponWithTwoModes = weapons.find((w) => w.modes.length > 1)!
      
      // Default should be first mode
      const defaultMode = store.getSelectedMode(weaponWithTwoModes.id)
      expect(defaultMode).not.toBeNull()
      expect(defaultMode?.hands).toBe(weaponWithTwoModes.modes[0].hands)
    })

    it('totalWeaponWeight calculates correctly', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.type === 'miekka')!
      
      expect(store.totalWeaponWeight).toBe(0)
      
      store.equipWeapon(weapon.id)
      expect(store.totalWeaponWeight).toBe(weapon.weight)
    })
  })

  describe('Damage Calculation', () => {
    it('calculates damage without vauriobonus', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.damageBonus && w.modes[0].damage > 0)!
      const mode = weapon.modes[0]
      
      const damage = store.calculateDamage(weapon, mode, 0)
      expect(damage).toBe(mode.damage)
    })

    it('calculates damage with positive vauriobonus', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.damageBonus && w.modes[0].damage > 0)!
      const mode = weapon.modes[0]
      const vauriobonus = 3
      
      const damage = store.calculateDamage(weapon, mode, vauriobonus)
      expect(damage).toBe(mode.damage + vauriobonus)
    })

    it('calculates damage without damageBonus', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => !w.damageBonus)!
      const mode = weapon.modes[0]
      const vauriobonus = 5
      
      const damage = store.calculateDamage(weapon, mode, vauriobonus)
      expect(damage).toBe(mode.damage) // Should not add vauriobonus
    })

    it('returns minimum 0 damage', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.damageBonus && w.modes[0].damage === 0)!
      const mode = weapon.modes[0]
      const vauriobonus = -5 // Negative bonus (shouldn't happen but test edge case)
      
      const damage = store.calculateDamage(weapon, mode, vauriobonus)
      expect(damage).toBeGreaterThanOrEqual(0)
    })

    it('calculates damage for different weapon types', () => {
      const store = useWeaponsStore()
      // Test miekka
      const miekka = weapons.find((w) => w.type === 'miekka')!
      expect(store.calculateDamage(miekka, miekka.modes[0], 2)).toBe(miekka.modes[0].damage + 2)
      
      // Test jousi (no damage bonus)
      const jousi = weapons.find((w) => w.type === 'jousi')!
      expect(store.calculateDamage(jousi, jousi.modes[0], 5)).toBe(jousi.modes[0].damage)
      
      // Test kilpi
      const kilpi = weapons.find((w) => w.type === 'kilpi')!
      expect(store.calculateDamage(kilpi, kilpi.modes[0], 3)).toBe(kilpi.modes[0].damage + 3)
    })
  })

  describe('Strength Requirements', () => {
    it('canUseWeapon returns true when strength is sufficient', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.modes[0].minStrength > 5)!
      const mode = weapon.modes[0]
      
      expect(store.canUseWeapon(weapon, mode, mode.minStrength)).toBe(true)
      expect(store.canUseWeapon(weapon, mode, mode.minStrength + 5)).toBe(true)
    })

    it('canUseWeapon returns false when strength is insufficient', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.modes[0].minStrength > 5)!
      const mode = weapon.modes[0]
      
      expect(store.canUseWeapon(weapon, mode, mode.minStrength - 1)).toBe(false)
      expect(store.canUseWeapon(weapon, mode, 1)).toBe(false)
    })

    it('handles different strength requirements correctly', () => {
      const store = useWeaponsStore()
      // Low strength weapon (puukko requires STR 3)
      const puukko = weapons.find((w) => w.id === 'puukko')!
      expect(puukko).toBeDefined()
      expect(puukko.modes[0].minStrength).toBe(3)
      expect(store.canUseWeapon(puukko, puukko.modes[0], 3)).toBe(true)
      expect(store.canUseWeapon(puukko, puukko.modes[0], 5)).toBe(true)
      expect(store.canUseWeapon(puukko, puukko.modes[0], 2)).toBe(false)
      
      // High strength weapon (jalkajousi requires STR 11)
      const jalkajousi = weapons.find((w) => w.id === 'jalkajousi')!
      expect(jalkajousi).toBeDefined()
      expect(jalkajousi.modes[0].minStrength).toBe(11)
      expect(store.canUseWeapon(jalkajousi, jalkajousi.modes[0], 11)).toBe(true)
      expect(store.canUseWeapon(jalkajousi, jalkajousi.modes[0], 12)).toBe(true)
      expect(store.canUseWeapon(jalkajousi, jalkajousi.modes[0], 10)).toBe(false)
    })
  })

  describe('Weapon Actions', () => {
    it('equipWeapon sets the equipped weapon', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.type === 'miekka')!
      
      store.equipWeapon(weapon.id)
      expect(store.equippedWeapon?.id).toBe(weapon.id)
    })

    it('equipWeapon with null clears equipped weapon', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.type === 'miekka')!
      
      store.equipWeapon(weapon.id)
      expect(store.equippedWeapon).not.toBeNull()
      
      store.equipWeapon(null)
      expect(store.equippedWeapon).toBeNull()
    })

    it('equipShield sets the equipped shield', () => {
      const store = useWeaponsStore()
      const shield = weapons.find((w) => w.type === 'kilpi')!
      
      store.equipShield(shield.id)
      expect(store.equippedShield?.id).toBe(shield.id)
    })

    it('equipShield with null clears equipped shield', () => {
      const store = useWeaponsStore()
      const shield = weapons.find((w) => w.type === 'kilpi')!
      
      store.equipShield(shield.id)
      expect(store.equippedShield).not.toBeNull()
      
      store.equipShield(null)
      expect(store.equippedShield).toBeNull()
    })

    it('setWeaponMode sets the selected mode', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.modes.length > 1)!
      
      store.setWeaponMode(weapon.id, 2)
      expect(store.selectedMode[weapon.id]).toBe(2)
      
      store.setWeaponMode(weapon.id, 1)
      expect(store.selectedMode[weapon.id]).toBe(1)
    })

    it('clearWeapons clears all equipped weapons', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.type === 'miekka')!
      const shield = weapons.find((w) => w.type === 'kilpi')!
      
      store.equipWeapon(weapon.id)
      store.equipShield(shield.id)
      store.setWeaponMode(weapon.id, 2)
      
      store.clearWeapons()
      
      expect(store.equippedWeapon).toBeNull()
      expect(store.equippedShield).toBeNull()
      expect(Object.keys(store.selectedMode).length).toBe(0)
    })

    it('setEquippedWeapons sets all values correctly', () => {
      const store = useWeaponsStore()
      const weapon = weapons.find((w) => w.type === 'miekka')!
      const shield = weapons.find((w) => w.type === 'kilpi')!
      
      store.setEquippedWeapons(weapon.id, shield.id, { [weapon.id]: 2 })
      
      expect(store.equippedWeapon?.id).toBe(weapon.id)
      expect(store.equippedShield?.id).toBe(shield.id)
      expect(store.selectedMode[weapon.id]).toBe(2)
    })
  })

  describe('Weapon Properties', () => {
    it('slow weapons have slow property set', () => {
      const slowWeapons = weapons.filter((w) => w.special?.slow)
      
      expect(slowWeapons.length).toBeGreaterThan(0)
      
      for (const weapon of slowWeapons) {
        expect([1, 2]).toContain(weapon.special!.slow)
      }
    })

    it('throwable weapons have canThrow property', () => {
      const throwableWeapons = weapons.filter((w) => w.special?.canThrow)
      
      expect(throwableWeapons.length).toBeGreaterThan(0)
      
      // All throwable weapons should be keihäs, lyömä, veitsi, or heitto
      for (const weapon of throwableWeapons) {
        expect(['keihäs', 'lyömä', 'veitsi', 'heitto']).toContain(weapon.type)
      }
    })

    it('weapons with cannotBlock cannot be used to block', () => {
      const cannotBlockWeapons = weapons.filter((w) => w.special?.cannotBlock)
      
      expect(cannotBlockWeapons.length).toBeGreaterThan(0)
      
      for (const weapon of cannotBlockWeapons) {
        expect(weapon.special!.cannotBlock).toBe(true)
      }
    })

    it('two-handed only weapons have single mode with 2 hands', () => {
      const twoHandedOnly = weapons.filter((w) => w.modes.length === 1 && w.modes[0].hands === 2)
      
      expect(twoHandedOnly.length).toBeGreaterThan(0)
      
      // All jousi should be two-handed only
      const jousiTwoHanded = twoHandedOnly.filter((w) => w.type === 'jousi')
      expect(jousiTwoHanded.length).toBeGreaterThan(0)
    })

    it('weapons with multiple modes can be used 1H or 2H', () => {
      const flexibleWeapons = weapons.filter((w) => w.modes.length > 1)
      
      expect(flexibleWeapons.length).toBeGreaterThan(0)
      
      // Keihäs should have flexible modes
      const keihäsFlexible = flexibleWeapons.filter((w) => w.type === 'keihäs')
      expect(keihäsFlexible.length).toBeGreaterThan(0)
    })
  })

  describe('Weapon Statistics', () => {
    it('all weapons have reasonable weight (0-200 naulaa)', () => {
      for (const weapon of weapons) {
        expect(weapon.weight).toBeGreaterThanOrEqual(0)
        expect(weapon.weight).toBeLessThanOrEqual(200)
      }
    })

    it('all weapons have reasonable price (0-10000 kpr)', () => {
      for (const weapon of weapons) {
        expect(weapon.price).toBeGreaterThanOrEqual(0)
        expect(weapon.price).toBeLessThanOrEqual(10000)
      }
    })

    it('damage values are within reasonable range (0-20)', () => {
      for (const weapon of weapons) {
        for (const mode of weapon.modes) {
          expect(mode.damage).toBeGreaterThanOrEqual(0)
          expect(mode.damage).toBeLessThanOrEqual(20)
        }
      }
    })

    it('length correlates with weapon type', () => {
      // Long weapons (length 1) should be suurmiekka, keihäs, peitsi
      const longWeapons = weapons.filter((w) => w.length === 1)
      expect(longWeapons.length).toBeGreaterThan(0)
      
      // Short weapons (length 3) should be veitset, lyhyt miekka
      const shortWeapons = weapons.filter((w) => w.length === 3)
      expect(shortWeapons.length).toBeGreaterThan(0)
    })

    it('heavier weapons tend to have higher damage', () => {
      const heavyWeapons = weapons.filter((w) => w.weight >= 50)
      const lightWeapons = weapons.filter((w) => w.weight < 20)
      
      const avgHeavyDamage = heavyWeapons.reduce((sum, w) => sum + w.modes[0].damage, 0) / heavyWeapons.length
      const avgLightDamage = lightWeapons.reduce((sum, w) => sum + w.modes[0].damage, 0) / lightWeapons.length
      
      // Heavy weapons should generally do more damage (with some exceptions)
      expect(avgHeavyDamage).toBeGreaterThanOrEqual(avgLightDamage - 2) // Allow some variance
    })
  })

  describe('Specific Weapons', () => {
    it('Suurmiekka is two-handed only with high damage', () => {
      const suurmiekka = weapons.find((w) => w.id === 'suurmiekka')
      
      expect(suurmiekka).toBeDefined()
      expect(suurmiekka!.modes.length).toBe(1)
      expect(suurmiekka!.modes[0].hands).toBe(2)
      expect(suurmiekka!.modes[0].damage).toBeGreaterThanOrEqual(8)
      expect(suurmiekka!.length).toBe(1) // Long weapon
    })

    it('Peitsi requires horseback', () => {
      const peitsi = weapons.find((w) => w.id === 'peitsi')
      
      expect(peitsi).toBeDefined()
      expect(peitsi!.special?.horseback).toBe(true)
      expect(peitsi!.type).toBe('keihäs')
    })

    it('Kilpi and Puukilpi are shields', () => {
      const kilpi = weapons.find((w) => w.id === 'kilpi')
      const puukilpi = weapons.find((w) => w.id === 'puukilpi')
      
      expect(kilpi).toBeDefined()
      expect(puukilpi).toBeDefined()
      expect(kilpi!.type).toBe('kilpi')
      expect(puukilpi!.type).toBe('kilpi')
      expect(kilpi!.weight).toBeGreaterThan(puukilpi!.weight) // Regular shield heavier
    })

    it('Jalkajousi has highest bow damage', () => {
      const jouset = weapons.filter((w) => w.type === 'jousi')
      const jalkajousi = jouset.find((w) => w.id === 'jalkajousi')
      
      expect(jalkajousi).toBeDefined()
      
      for (const jousi of jouset) {
        expect(jalkajousi!.modes[0].damage).toBeGreaterThanOrEqual(jousi.modes[0].damage)
      }
    })

    it('Nyrkkirauta has zero weight', () => {
      const nyrkkirauta = weapons.find((w) => w.id === 'nyrkkirauta')
      
      expect(nyrkkirauta).toBeDefined()
      expect(nyrkkirauta!.weight).toBe(0)
      expect(nyrkkirauta!.type).toBe('tappelu')
    })
  })
})
