/**
 * Sample shopping list data
 * Pre-populated items for potions (Velhojen liemet) and alchemy products (Alkemistien keitokset)
 */

import type { ShoppingItemDraft, ShoppingCategory } from '@/types/shopping'

export const defaultCategories: ShoppingCategory[] = [
  {
    id: 'velhojen-liemet',
    name: 'Velhojen liemet',
    description: 'Taikajuomat ja potionit',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'alkemistien-keitokset',
    name: 'Alkemistien keitokset',
    description: 'Alkemistien valmistamat erikoisjuomat ja aineet',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'yrtit-ja-yrttiseokset',
    name: 'Yrtit ja yrttiseokset',
    description: 'Kuivatut yrtit ja valmiit seokset',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'erikoismateriaalit',
    name: 'Erikoismateriaalit',
    description: 'Harvinaiset materiaalit ja ainekset',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

export const defaultItems: ShoppingItemDraft[] = [
  // ===== VELHOJEN LIEMET =====
  {
    name: 'Parantava juoma',
    description: 'Palauttaa 1d6 veripistettä välittömästi.',
    categoryId: 'velhojen-liemet',
    basePrice: 10,
    priceFormula: '10+3d6',
    availabilityChance: 80,
  },
  {
    name: 'Suuri parantava juoma',
    description: 'Palauttaa 3d6 veripistettä välittömästi.',
    categoryId: 'velhojen-liemet',
    basePrice: 30,
    priceFormula: '30+6d6',
    availabilityChance: 50,
  },
  {
    name: 'Myrkynvastus',
    description: 'Antaa +2 bonuksen myrkkyjen vastustamiseen 1 tunnin ajaksi.',
    categoryId: 'velhojen-liemet',
    basePrice: 15,
    priceFormula: '15+2d10',
    availabilityChance: 60,
  },
  {
    name: 'Näkemisen juoma',
    description: 'Mahdollistaa näkemisen pimeässä 1 tunnin ajaksi.',
    categoryId: 'velhojen-liemet',
    basePrice: 20,
    priceFormula: '20+4d6',
    availabilityChance: 40,
  },
  {
    name: 'Nopeuden juoma',
    description: 'Antaa +2 bonuksen Ketteryystarkistuksiin 10 minuutin ajaksi.',
    categoryId: 'velhojen-liemet',
    basePrice: 25,
    priceFormula: '25+3d8',
    availabilityChance: 35,
  },
  {
    name: 'Voiman juoma',
    description: 'Antaa +2 bonuksen Voimatarkistuksiin 10 minuutin ajaksi.',
    categoryId: 'velhojen-liemet',
    basePrice: 25,
    priceFormula: '25+3d8',
    availabilityChance: 35,
  },
  {
    name: 'Näkymättömyysjuoma',
    description: 'Tekee juojasta näkymättömän 1d6 kierroksen ajaksi.',
    categoryId: 'velhojen-liemet',
    basePrice: 50,
    priceFormula: '50+10d6',
    availabilityChance: 20,
  },
  {
    name: 'Lennon juoma',
    description: 'Mahdollistaa lentämisen 10 minuutin ajaksi.',
    categoryId: 'velhojen-liemet',
    basePrice: 40,
    priceFormula: '40+8d6',
    availabilityChance: 25,
  },

  // ===== ALKEMISTIEN KEITOKSET =====
  {
    name: 'Alkemistinen happo',
    description: 'Syövyttävää nestettä. Aiheuttaa 2d6 vahinkoa osumasta.',
    categoryId: 'alkemistien-keitokset',
    basePrice: 15,
    priceFormula: '15+3d6',
    availabilityChance: 70,
  },
  {
    name: 'Pallopullo',
    description: 'Räjähtää osuessaan, aiheuttaen 1d6 tulivahinkoa alueelle.',
    categoryId: 'alkemistien-keitokset',
    basePrice: 20,
    priceFormula: '20+4d6',
    availabilityChance: 60,
  },
  {
    name: 'Savupullo',
    description: 'Luo 5 metrin säteisen savuverhon 1d6 kierrokseksi.',
    categoryId: 'alkemistien-keitokset',
    basePrice: 12,
    priceFormula: '12+2d6',
    availabilityChance: 75,
  },
  {
    name: 'Liimapullo',
    description: 'Sitoo kohteen paikoilleen 1d6 kierrokseksi (Voima-vastustus).',
    categoryId: 'alkemistien-keitokset',
    basePrice: 18,
    priceFormula: '18+3d8',
    availabilityChance: 55,
  },
  {
    name: 'Öljypullo',
    description: 'Leviää 3 metrin alueelle, syttyy tulesta.',
    categoryId: 'alkemistien-keitokset',
    basePrice: 8,
    priceFormula: '8+2d6',
    availabilityChance: 85,
  },
  {
    name: 'Kirkasmielisyysjuoma',
    description: 'Poistaa sekasorron ja pelon vaikutukset.',
    categoryId: 'alkemistien-keitokset',
    basePrice: 22,
    priceFormula: '22+4d6',
    availabilityChance: 45,
  },

  // ===== YRTIT =====
  {
    name: 'Kuivattu auringonkukka',
    description: 'Käytetään parantavien juomien valmistukseen.',
    categoryId: 'yrtit-ja-yrttiseokset',
    basePrice: 5,
    priceFormula: '5+1d6',
    availabilityChance: 90,
  },
  {
    name: 'Yövarjo',
    description: 'Myrkyllinen kasvi. Käytetään myrkkyjen valmistukseen.',
    categoryId: 'yrtit-ja-yrttiseokset',
    basePrice: 8,
    priceFormula: '8+2d6',
    availabilityChance: 50,
  },
  {
    name: 'Hopealehti',
    description: 'Harvinainen yrtti. Käytetään suojausrituaaleissa.',
    categoryId: 'yrtit-ja-yrttiseokset',
    basePrice: 15,
    priceFormula: '15+3d6',
    availabilityChance: 30,
  },
  {
    name: 'Parantava yrttiseos',
    description: 'Valmis seos haavojen hoitoon. Palauttaa 1d4 hp.',
    categoryId: 'yrtit-ja-yrttiseokset',
    basePrice: 10,
    priceFormula: '10+2d6',
    availabilityChance: 70,
  },

  // ===== ERIKOISMATERIAALIT =====
  {
    name: 'Lohikäärmeen kyynel',
    description: 'Erittäin harvinainen. Vahvistaa taikajuomia huomattavasti.',
    categoryId: 'erikoismateriaalit',
    basePrice: 100,
    priceFormula: '100+20d6',
    availabilityChance: 10,
  },
  {
    name: 'Yksisarvisen karva',
    description: 'Käytetään erityisen voimakkaiden parannusjuomien valmistukseen.',
    categoryId: 'erikoismateriaalit',
    basePrice: 80,
    priceFormula: '80+15d6',
    availabilityChance: 15,
  },
  {
    name: 'Feniksin tuhka',
    description: 'Uudelleensyntymisen voimaa sisältävä tuhka.',
    categoryId: 'erikoismateriaalit',
    basePrice: 150,
    priceFormula: '150+25d6',
    availabilityChance: 5,
  },
  {
    name: 'Kuunvalo-uute',
    description: 'Kerätty täysikuun yönä. Käytetään näkymättömyysjuomiin.',
    categoryId: 'erikoismateriaalit',
    basePrice: 35,
    priceFormula: '35+8d6',
    availabilityChance: 25,
  },
]
