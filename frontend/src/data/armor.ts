/**
 * Medieval Finnish armor database (Praedor RPG)
 * 
 * Armor types:
 * - soft: Huopa, Nahka, Gambeson, Ketju (chainmail)
 * - hard: Levy (plate), Teräs (steel), Avokypärä, Täyskypärä
 * 
 * Weight is in naulaa (1 naula = 100g)
 * Currency: kpr (kupariraha), hr (hopearaha = 10 kpr), kr (kultaraha = 100 kpr)
 * 
 * Source: docs/varusteet.md
 */

import type { Equipment } from '@/types/equipment'

export const armor: Equipment[] = [
  // ===== HEAD (Kypärät) =====
  {
    id: 'huopahuppu',
    name: 'Huopahuppu',
    category: 'armor',
    hitLocations: ['head'],
    armorPoints: 1,
    armorType: 'soft',
    weight: 10,
    cost: 5,  // 5 kpr
    description: 'Yksinkertainen huopahuppu.',
  },
  {
    id: 'nahkahuppu',
    name: 'Nahkahuppu',
    category: 'armor',
    hitLocations: ['head'],
    armorPoints: 2,
    armorType: 'soft',
    weight: 10,
    cost: 10,  // 1 hr
    description: 'Nahkainen suojahuppu.',
  },
  {
    id: 'nahkakypara',
    name: 'Nahkakypärä',
    category: 'armor',
    hitLocations: ['head'],
    armorPoints: 3,
    armorType: 'soft',
    weight: 10,
    cost: 40,  // 4 hr
    description: 'Kova nahkakypärä.',
  },
  {
    id: 'avokypara',
    name: 'Avokypärä',
    category: 'armor',
    hitLocations: ['head'],
    armorPoints: 4,
    armorType: 'hard',
    weight: 20,
    cost: 200,  // 2 kr
    description: 'Avoin kypärä kasvosuojalla.',
  },
  {
    id: 'ketjuhuppu',
    name: 'Ketjuhuppu',
    category: 'armor',
    hitLocations: ['head'],
    armorPoints: 5,
    armorType: 'soft',
    weight: 40,
    cost: 300,  // 3 kr
    description: 'Ketjusilmäkokoinen huppu.',
  },
  {
    id: 'tayssikypara',
    name: 'Täyskypärä',
    category: 'armor',
    hitLocations: ['head'],
    armorPoints: 6,
    armorType: 'hard',
    weight: 60,
    cost: 500,  // 5 kr
    description: 'Kasvot peittävä täyskypärä.',
  },

  // ===== CHEST + STOMACH (Takit) =====
  {
    id: 'huopanutu',
    name: 'Huopanutu',
    category: 'armor',
    hitLocations: ['chest', 'stomach'],
    armorPoints: 1,
    armorType: 'soft',
    weight: 20,
    cost: 100,  // 1 kr
    description: 'Huopainen päällystakki.',
  },
  {
    id: 'nahkanuttu',
    name: 'Nahkanuttu',
    category: 'armor',
    hitLocations: ['chest', 'stomach'],
    armorPoints: 2,
    armorType: 'soft',
    weight: 40,
    cost: 30,  // 3 hr
    description: 'Nahkainen suojatakki.',
  },
  {
    id: 'gambeson',
    name: 'Gambeson',
    category: 'armor',
    hitLocations: ['chest', 'stomach'],
    armorPoints: 3,
    armorType: 'soft',
    weight: 50,
    cost: 400,  // 4 kr
    description: 'Topattu panssaritakki.',
  },
  {
    id: 'ketjuhauberkki',
    name: 'Ketjuhauberkki',
    category: 'armor',
    hitLocations: ['chest', 'stomach', 'left_arm', 'right_arm'],
    armorPoints: 7,
    armorType: 'soft',
    weight: 120,
    cost: 2500,  // 25 kr
    description: 'Ketjusilmäpaita, joka suojaa vartaloa ja käsiä.',
  },

  // ===== CHEST + STOMACH (Liivit) =====
  {
    id: 'nahkaliivit',
    name: 'Nahkaliivit',
    category: 'armor',
    hitLocations: ['chest', 'stomach'],
    armorPoints: 2,
    armorType: 'soft',
    weight: 20,
    cost: 50,  // 5 hr
    description: 'Nahkainen rintaliivi.',
  },
  {
    id: 'nahkakyrrassi',
    name: 'Nahkakyrrassi',
    category: 'armor',
    hitLocations: ['chest', 'stomach'],
    armorPoints: 4,
    armorType: 'soft',
    weight: 30,
    cost: 200,  // 2 kr
    description: 'Kova nahkakyrrassi.',
  },
  {
    id: 'rautanahka',
    name: 'Rautanahka',
    category: 'armor',
    hitLocations: ['chest', 'stomach'],
    armorPoints: 5,
    armorType: 'soft',
    weight: 50,
    cost: 300,  // 3 kr
    description: 'Rautalevyillä vahvistettu nahkapanssari.',
  },
  {
    id: 'ketjuliivit',
    name: 'Ketjuliivit',
    category: 'armor',
    hitLocations: ['chest', 'stomach'],
    armorPoints: 7,
    armorType: 'soft',
    weight: 80,
    cost: 1000,  // 10 kr
    description: 'Ketjusilmäliivit.',
  },
  {
    id: 'levykyrassi',
    name: 'Levykyrassi',
    category: 'armor',
    hitLocations: ['chest', 'stomach'],
    armorPoints: 9,
    armorType: 'hard',
    weight: 100,
    cost: 5000,  // 50 kr
    description: 'Levyrintapanssari.',
  },

  // ===== ARMS (Käsisuojat) =====
  {
    id: 'nahkasuojat',
    name: 'Nahkasuojat',
    category: 'armor',
    hitLocations: ['left_arm', 'right_arm'],
    armorPoints: 3,
    armorType: 'soft',
    weight: 10,
    cost: 100,  // 1 kr
    description: 'Nahkaiset käsivarsisuojat.',
  },
  {
    id: 'terassuojat',
    name: 'Terässuojat',
    category: 'armor',
    hitLocations: ['left_arm', 'right_arm'],
    armorPoints: 6,
    armorType: 'hard',
    weight: 30,
    cost: 1000,  // 10 kr
    description: 'Teräksiset käsivarsisuojat.',
  },

  // ===== LEGS (Jalkasuojat) =====
  {
    id: 'huopahousut',
    name: 'Huopahousut',
    category: 'armor',
    hitLocations: ['left_leg', 'right_leg'],
    armorPoints: 1,
    armorType: 'soft',
    weight: 20,
    cost: 50,  // 5 hr
    description: 'Huopaiset suojahousut.',
  },
  {
    id: 'reisisaappaat',
    name: 'Reisisaappaat',
    category: 'armor',
    hitLocations: ['left_leg', 'right_leg'],
    armorPoints: 1,
    armorType: 'soft',
    weight: 20,
    cost: 60,  // 6 hr
    description: 'Reisiin ulottuvat saappaat.',
  },
  {
    id: 'nahkalahkeet',
    name: 'Nahkalahkeet',
    category: 'armor',
    hitLocations: ['left_leg', 'right_leg'],
    armorPoints: 2,
    armorType: 'soft',
    weight: 40,
    cost: 200,  // 2 kr
    description: 'Nahkaiset jalkasuojat.',
  },
  {
    id: 'nahkasaarystimet',
    name: 'Nahkasäärystimet',
    category: 'armor',
    hitLocations: ['left_leg', 'right_leg'],
    armorPoints: 3,
    armorType: 'soft',
    weight: 20,
    cost: 200,  // 2 kr
    description: 'Nahkaiset säärisuojat.',
  },
  {
    id: 'terassaarystimet',
    name: 'Terässäärystimet',
    category: 'armor',
    hitLocations: ['left_leg', 'right_leg'],
    armorPoints: 6,
    armorType: 'hard',
    weight: 50,
    cost: 1500,  // 15 kr
    description: 'Teräksiset säärisuojat.',
  },
  {
    id: 'ketjuhousut',
    name: 'Ketjuhousut',
    category: 'armor',
    hitLocations: ['left_leg', 'right_leg'],
    armorPoints: 7,
    armorType: 'soft',
    weight: 80,
    cost: 2000,  // 20 kr
    description: 'Ketjusilmähousut.',
  },

  // ===== GEAR (Keep existing) =====
  {
    id: 'backpack',
    name: 'Reppu',
    category: 'gear',
    weight: 1,
    cost: 5,
    description: 'Tavallinen reppu tavaroiden kantamiseen.',
  },
  {
    id: 'waterskin',
    name: 'Juomaleili',
    category: 'gear',
    weight: 1,
    cost: 2,
    description: 'Nahkainen juomaleili.',
  },
  {
    id: 'rations',
    name: 'Annos ruokaa',
    category: 'gear',
    weight: 1,
    cost: 1,
    description: 'Yhden päivän annos ruokaa.',
  },
  {
    id: 'torch',
    name: 'Soihtu',
    category: 'gear',
    weight: 1,
    cost: 1,
    description: 'Valonlähde pimeään.',
  },
  {
    id: 'rope',
    name: 'Köysi',
    category: 'gear',
    weight: 2,
    cost: 3,
    description: '10 metriä vahvaa köyttä.',
  },
  {
    id: 'bedroll',
    name: 'Makuualusta',
    category: 'gear',
    weight: 3,
    cost: 8,
    description: 'Makuualusta ja peite.',
  },
  {
    id: 'flint_steel',
    name: 'Tulukset',
    category: 'gear',
    weight: 0.5,
    cost: 3,
    description: 'Tulukset tulen sytyttämiseen.',
  },
  {
    id: 'pouch',
    name: 'Pussi',
    category: 'gear',
    weight: 0.5,
    cost: 3,
    description: 'Pieni laukku kolikoille.',
  },
]

export default armor
