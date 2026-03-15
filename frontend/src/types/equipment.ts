/**
 * Equipment types for the armor and hit location system
 */

import type { BaseItem } from './weapon'

export type HitLocation =
  | 'head'
  | 'chest'
  | 'stomach'
  | 'left_arm'
  | 'right_arm'
  | 'left_leg'
  | 'right_leg'

export type ArmorType = 'soft' | 'hard'

export type EquipmentCategory = 'armor' | 'gear'

export interface Equipment extends BaseItem {
  category: 'armor' | 'gear'
  hitLocations?: HitLocation[]  // For armor
  armorPoints?: number  // For armor
  armorType?: ArmorType  // For armor layering
  cost: number
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
}
