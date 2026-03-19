/**
 * Shopping list utilities
 * Price rolling (dice formulas) and availability checking
 */

import type { PriceFormula } from '@/types/shopping'

/**
 * Roll a single die with given sides
 */
export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1
}

/**
 * Roll multiple dice and sum the result
 */
export const rollDice = (count: number, sides: number): number => {
  let total = 0
  for (let i = 0; i < count; i++) {
    total += rollDie(sides)
  }
  return total
}

/**
 * Parse a price formula string (e.g., "10+3d6") into components
 * Supports formats: "10+3d6", "50+2d10", "100", "3d6"
 */
export const parsePriceFormula = (formula: string): PriceFormula => {
  const trimmed = formula.trim().replace(/\s/g, '')
  
  // Match patterns like "10+3d6", "3d6", "100"
  const match = trimmed.match(/^(\d+)?(?:\+(\d+)d(\d+))?$/)
  
  if (!match) {
    // Invalid formula, return base 0
    return {
      base: 0,
      diceCount: 0,
      diceSides: 0,
      formula: '0',
    }
  }
  
  const [, baseStr, diceCountStr, diceSidesStr] = match
  const base = baseStr ? parseInt(baseStr, 10) : 0
  const diceCount = diceCountStr ? parseInt(diceCountStr, 10) : 0
  const diceSides = diceSidesStr ? parseInt(diceSidesStr, 10) : 0
  
  return {
    base,
    diceCount,
    diceSides,
    formula: trimmed,
  }
}

/**
 * Roll a price formula and return the result
 * Example: "10+3d6" → 10 + (3d6 result)
 */
export const rollPrice = (formula: string): number => {
  const parsed = parsePriceFormula(formula)
  
  if (parsed.diceCount === 0 || parsed.diceSides === 0) {
    return parsed.base
  }
  
  const diceResult = rollDice(parsed.diceCount, parsed.diceSides)
  return parsed.base + diceResult
}

/**
 * Roll availability based on percentage chance
 * Returns true if item is available
 */
export const rollAvailability = (chance: number): boolean => {
  const roll = Math.random() * 100
  return roll < chance
}

/**
 * Format price for display (kupariraha, hopearaha, kultaraha)
 * 1 hr = 10 kpr, 1 kr = 100 kpr
 */
export const formatPrice = (price: number): string => {
  if (price >= 100) {
    const kr = Math.floor(price / 100)
    const remainder = price % 100
    if (remainder === 0) {
      return `${kr} kr`
    }
    return `${kr} kr ${remainder} kpr`
  } else if (price >= 10) {
    const hr = Math.floor(price / 10)
    const remainder = price % 10
    if (remainder === 0) {
      return `${hr} hr`
    }
    return `${hr} hr ${remainder} kpr`
  } else {
    return `${price} kpr`
  }
}

/**
 * Validate a price formula string
 * Returns { valid: boolean, error?: string }
 */
export const validatePriceFormula = (formula: string): { valid: boolean; error?: string } => {
  const trimmed = formula.trim().replace(/\s/g, '')
  
  if (!trimmed) {
    return { valid: false, error: 'Formula cannot be empty' }
  }
  
  const match = trimmed.match(/^(\d+)?(?:\+(\d+)d(\d+))?$/)
  
  if (!match) {
    return { 
      valid: false, 
      error: 'Invalid format. Use formats like "10+3d6", "50+2d10", or "100"' 
    }
  }
  
  const [, , diceCountStr, diceSidesStr] = match
  
  // If dice are specified, validate them
  if (diceCountStr || diceSidesStr) {
    if (!diceCountStr || !diceSidesStr) {
      return { valid: false, error: 'Both dice count and sides must be specified' }
    }
    
    const diceCount = parseInt(diceCountStr, 10)
    const diceSides = parseInt(diceSidesStr, 10)
    
    if (diceCount < 1 || diceCount > 20) {
      return { valid: false, error: 'Dice count must be between 1 and 20' }
    }
    
    if (diceSides < 2 || diceSides > 100) {
      return { valid: false, error: 'Dice sides must be between 2 and 100' }
    }
  }
  
  return { valid: true }
}
