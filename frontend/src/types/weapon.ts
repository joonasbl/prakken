/**
 * Weapon types for the Praedor RPG weapon system
 */

export type WeaponType =
  | 'heitto'      // Throwing weapons
  | 'jousi'       // Bows
  | 'keihäs'      // Spears
  | 'lyömä'       // Bludgeoning weapons
  | 'miekka'      // Swords
  | 'veitsi'      // Knives
  | 'tappelu'     // Brawling
  | 'kilpi'       // Shields

// Length: 1 = Long (attacks FIRST in combat), 2 = Medium, 3 = Short (attacks LAST)
export type WeaponLength = 1 | 2 | 3

export type WeaponMode = {
  hands: 1 | 2
  damage: number
  minStrength: number
}

// Base item interface shared by Equipment and Weapon
export interface BaseItem {
  id: string
  name: string
  category: 'armor' | 'weapon' | 'gear'
  weight: number  // naulaa
  description?: string
}

export interface Weapon extends BaseItem {
  category: 'weapon'
  type: WeaponType
  length: WeaponLength
  damageBonus: boolean  // Uses character's vauriobonus
  range?: number  // For ranged weapons only (in meters)
  price: number  // in kpr (kupariraha)
  modes: WeaponMode[]  // One or two modes (1-hand / 2-hand)
  special?: {
    fragile?: boolean
    cannotBlock?: boolean
    slow?: 1 | 2  // Attack penalty
    canThrow?: boolean
    horseback?: boolean  // Can ONLY be used on horseback
  }
}
