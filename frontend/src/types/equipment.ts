/**
 * Equipment types for the armor and hit location system
 */

export type HitLocation =
  | 'head'
  | 'chest'
  | 'stomach'
  | 'left_arm'
  | 'right_arm'
  | 'left_leg'
  | 'right_leg'

export type ArmorType = 'soft' | 'hard'

export type EquipmentCategory = 'armor' | 'weapon' | 'gear'

export interface Equipment {
  id: string
  name: string
  category: EquipmentCategory
  hitLocations?: HitLocation[]  // For armor
  armorPoints?: number  // For armor
  armorType?: ArmorType  // For armor layering
  weight: number  // naulaa (100g units)
  cost: number
  description: string
}

export interface EquippedItem {
  itemId: string
  equippedAt: number
}

export interface ArmorCalculation {
  head: number
  chest: number
  stomach: number
  left_arm: number
  right_arm: number
  left_leg: number
  right_leg: number
  shield: number  // Separate from hit locations
}
