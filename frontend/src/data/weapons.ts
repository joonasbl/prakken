/**
 * Weapon database (Praedor RPG)
 * 
 * Source: docs/varusteet.md
 * 
 * Currency: kpr (kupariraha), hr (hopearaha = 10 kpr), kr (kultaraha = 100 kpr)
 * Weight: naulaa (1 naula = 100g)
 * 
 * Length system:
 * - 1 = Long (attacks FIRST in combat)
 * - 2 = Medium
 * - 3 = Short (attacks LAST in combat)
 * 
 * Damage with "+" means it adds character's vauriobonus
 */

import type { Weapon } from '@/types/weapon'

export const weapons: Weapon[] = [
  // ===== HEITTOASEET (Throwing Weapons) =====
  {
    id: 'heittokeihas',
    name: 'Heittokeihäs',
    category: 'weapon',
    type: 'heitto',
    length: 2,
    damageBonus: true,
    weight: 10,
    price: 100,  // 1 hr
    modes: [{ hands: 1, damage: 4, minStrength: 5 }],
    special: { canThrow: true },
  },
  {
    id: 'linko',
    name: 'Linko',
    category: 'weapon',
    type: 'heitto',
    length: 3,
    damageBonus: false,
    range: 30,
    weight: 5,
    price: 200,  // 2 hr
    modes: [{ hands: 1, damage: 3, minStrength: 3 }],
  },
  {
    id: 'puhallusputki',
    name: 'Puhallusputki',
    category: 'weapon',
    type: 'heitto',
    length: 3,
    damageBonus: false,
    range: 10,
    weight: 5,
    price: 300,  // 3 hr
    modes: [{ hands: 2, damage: 1, minStrength: 3 }],
  },
  {
    id: 'ruoska',
    name: 'Ruoska',
    category: 'weapon',
    type: 'heitto',
    length: 2,
    damageBonus: true,
    weight: 10,
    price: 200,  // 2 hr
    modes: [{ hands: 1, damage: 0, minStrength: 5 }],
    special: { cannotBlock: true },
  },

  // ===== JOUSET (Bows) - All two-handed =====
  {
    id: 'jalkajousi',
    name: 'Jalkajousi',
    category: 'weapon',
    type: 'jousi',
    length: 2,
    damageBonus: false,
    range: 50,
    weight: 60,
    price: 1000,  // 10 kr
    modes: [{ hands: 2, damage: 10, minStrength: 11 }],
  },
  {
    id: 'kaarijousi',
    name: 'Kaarijousi',
    category: 'weapon',
    type: 'jousi',
    length: 2,
    damageBonus: false,
    range: 40,
    weight: 10,
    price: 300,  // 3 kr
    modes: [{ hands: 2, damage: 5, minStrength: 7 }],
  },
  {
    id: 'pitkajousi',
    name: 'Pitkäjousi',
    category: 'weapon',
    type: 'jousi',
    length: 2,
    damageBonus: false,
    range: 45,
    weight: 20,
    price: 800,  // 8 kr
    modes: [{ hands: 2, damage: 7, minStrength: 9 }],
  },
  {
    id: 'varsijousi',
    name: 'Varsijousi',
    category: 'weapon',
    type: 'jousi',
    length: 2,
    damageBonus: false,
    range: 35,
    weight: 40,
    price: 600,  // 6 kr
    modes: [{ hands: 2, damage: 8, minStrength: 7 }],
  },

  // ===== KEIHÄÄT (Spears) =====
  {
    id: 'hilpari',
    name: 'Hilpari',
    category: 'weapon',
    type: 'keihäs',
    length: 2,
    damageBonus: true,
    weight: 60,
    price: 100,  // 1 kr
    modes: [{ hands: 1, damage: 8, minStrength: 9 }],
  },
  {
    id: 'keihäs',
    name: 'Keihäs',
    category: 'weapon',
    type: 'keihäs',
    length: 1,
    damageBonus: true,
    weight: 20,
    price: 30,  // 3 hr
    modes: [
      { hands: 1, damage: 5, minStrength: 7 },
      { hands: 2, damage: 6, minStrength: 7 },
    ],
    special: { canThrow: true },
  },
  {
    id: 'peitsi',
    name: 'Peitsi',
    category: 'weapon',
    type: 'keihäs',
    length: 1,
    damageBonus: true,
    weight: 90,
    price: 200,  // 2 kr
    modes: [{ hands: 1, damage: 10, minStrength: 11 }],
    special: { horseback: true },
  },
  {
    id: 'sauva',
    name: 'Sauva',
    category: 'weapon',
    type: 'keihäs',
    length: 2,
    damageBonus: true,
    weight: 20,
    price: 3,  // 3 kpr
    modes: [
      { hands: 1, damage: 4, minStrength: 3 },
      { hands: 2, damage: 5, minStrength: 3 },
    ],
  },

  // ===== KILVET (Shields) - No armor, separate mechanics =====
  {
    id: 'kilpi',
    name: 'Kilpi',
    category: 'weapon',
    type: 'kilpi',
    length: 2,
    damageBonus: true,
    weight: 50,
    price: 200,  // 2 kr
    modes: [{ hands: 1, damage: 2, minStrength: 7 }],
  },
  {
    id: 'puukilpi',
    name: 'Puukilpi',
    category: 'weapon',
    type: 'kilpi',
    length: 2,
    damageBonus: true,
    weight: 30,
    price: 50,  // 5 hr
    modes: [{ hands: 1, damage: 2, minStrength: 5 }],
  },

  // ===== LYÖMÄASEET (Bludgeoning Weapons) =====
  {
    id: 'aamutähti',
    name: 'Aamutähti',
    category: 'weapon',
    type: 'lyömä',
    length: 2,
    damageBonus: true,
    weight: 40,
    price: 200,  // 2 kr
    modes: [{ hands: 1, damage: 7, minStrength: 9 }],
    special: { slow: 1 },
  },
  {
    id: 'kirves',
    name: 'Kirves',
    category: 'weapon',
    type: 'lyömä',
    length: 2,
    damageBonus: true,
    weight: 20,
    price: 100,  // 1 kr
    modes: [{ hands: 1, damage: 6, minStrength: 7 }],
    special: { canThrow: true },
  },
  {
    id: 'nuija',
    name: 'Nuija',
    category: 'weapon',
    type: 'lyömä',
    length: 2,
    damageBonus: true,
    weight: 20,
    price: 20,  // 2 hr
    modes: [{ hands: 1, damage: 4, minStrength: 5 }],
  },
  {
    id: 'sotanuija',
    name: 'Sotanuija',
    category: 'weapon',
    type: 'lyömä',
    length: 2,
    damageBonus: true,
    weight: 30,
    price: 50,  // 5 hr
    modes: [{ hands: 1, damage: 5, minStrength: 7 }],
  },
  {
    id: 'sotavasara',
    name: 'Sotavasara',
    category: 'weapon',
    type: 'lyömä',
    length: 2,
    damageBonus: true,
    weight: 40,
    price: 100,  // 1 kr
    modes: [{ hands: 1, damage: 7, minStrength: 9 }],
  },
  {
    id: 'suurtappara',
    name: 'Suurtappara',
    category: 'weapon',
    type: 'lyömä',
    length: 2,
    damageBonus: true,
    weight: 80,
    price: 1000,  // 10 kr
    modes: [{ hands: 2, damage: 11, minStrength: 11 }],
    special: { slow: 2 },
  },
  {
    id: 'tappara',
    name: 'Tappara',
    category: 'weapon',
    type: 'lyömä',
    length: 2,
    damageBonus: true,
    weight: 30,
    price: 300,  // 3 kr
    modes: [{ hands: 1, damage: 8, minStrength: 7 }],
    special: { canThrow: true },
  },

  // ===== MIEKAT (Swords) =====
  {
    id: 'lyhyt-miekka',
    name: 'Lyhyt miekka',
    category: 'weapon',
    type: 'miekka',
    length: 3,
    damageBonus: true,
    weight: 20,
    price: 300,  // 3 kr
    modes: [{ hands: 1, damage: 5, minStrength: 5 }],
  },
  {
    id: 'lyömämiekka',
    name: 'Lyömämiekka',
    category: 'weapon',
    type: 'miekka',
    length: 2,
    damageBonus: true,
    weight: 30,
    price: 600,  // 6 kr
    modes: [{ hands: 1, damage: 7, minStrength: 7 }],
  },
  {
    id: 'sapeli',
    name: 'Sapeli',
    category: 'weapon',
    type: 'miekka',
    length: 2,
    damageBonus: true,
    weight: 30,
    price: 600,  // 6 kr
    modes: [{ hands: 1, damage: 7, minStrength: 7 }],
  },
  {
    id: 'suurmiekka',
    name: 'Suurmiekka',
    category: 'weapon',
    type: 'miekka',
    length: 1,
    damageBonus: true,
    weight: 50,
    price: 1500,  // 15 kr
    modes: [{ hands: 2, damage: 10, minStrength: 9 }],
  },

  // ===== VEITSET (Knives) =====
  {
    id: 'puukko',
    name: 'Puukko',
    category: 'weapon',
    type: 'veitsi',
    length: 3,
    damageBonus: true,
    weight: 5,
    price: 10,  // 1 hr
    modes: [{ hands: 1, damage: 2, minStrength: 3 }],
  },
  {
    id: 'tikari',
    name: 'Tikari',
    category: 'weapon',
    type: 'veitsi',
    length: 3,
    damageBonus: true,
    weight: 5,
    price: 40,  // 4 hr
    modes: [{ hands: 1, damage: 3, minStrength: 3 }],
    special: { canThrow: true },
  },
  {
    id: 'sirppitikari',
    name: 'Sirppitikari',
    category: 'weapon',
    type: 'veitsi',
    length: 3,
    damageBonus: true,
    weight: 10,
    price: 70,  // 7 hr
    modes: [{ hands: 1, damage: 4, minStrength: 5 }],
    special: { canThrow: true },
  },

  // ===== TAPPELU (Brawling) =====
  {
    id: 'nyrkkirauta',
    name: 'Nyrkkirauta',
    category: 'weapon',
    type: 'tappelu',
    length: 3,
    damageBonus: true,
    weight: 0,
    price: 10,  // 1 hr
    modes: [{ hands: 1, damage: 2, minStrength: 3 }],
  },
]

export default weapons
