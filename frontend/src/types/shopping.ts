/**
 * Shopping list types for admin-managed item marketplace
 * 
 * Features:
 * - Dynamic pricing with dice formulas (e.g., "10+3d6")
 * - Availability chance (%-based)
 * - Categories (potions, alchemy products, etc.)
 */

export type ShoppingCategory = {
  id: string
  name: string
  description: string
  createdAt: number | string
  updatedAt: number | string
}

export type PriceFormula = {
  base: number      // Base price (e.g., 10 in "10+3d6")
  diceCount: number // Number of dice (e.g., 3 in "10+3d6")
  diceSides: number // Dice type (e.g., 6 in "10+3d6")
  formula: string   // Original formula string (e.g., "10+3d6")
}

export type ShoppingItem = {
  id: number | string
  name: string
  description: string
  categoryId: string
  basePrice: number           // Base price before roll
  priceFormula: string        // e.g., "10+3d6", "50+2d10"
  currentPrice: number        // Result of last price roll
  availabilityChance: number  // 0-100, percentage chance item is available
  isAvailable: boolean        // Current availability status
  lastRolledAt: number | string | null // When price/availability was last rolled
  createdAt: number | string
  updatedAt: number | string
}

export type ShoppingItemDraft = {
  name: string
  description: string
  categoryId: string
  basePrice: number
  priceFormula: string
  availabilityChance: number
}
