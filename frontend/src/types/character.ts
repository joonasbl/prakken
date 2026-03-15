import type { Attr } from './attributes'
import type { LearnedSkill } from './skills'

export type Background = {
  id: string
  name: string
  description: string
  statBonuses: Partial<Record<string, number>>
  skillBonuses: Partial<Record<string, number>>
}

export type AdvantageEffect =
  | { type: 'skillPoints'; value: number }
  | { type: 'substat'; stat: 'veripisteet' | 'syvaHaava'; value: number }
  | { type: 'attributeChoice'; count: number; value: number }

export type Advantage = {
  id: string
  name: string
  description: string
  cost: number
  effect?: AdvantageEffect
  conflicts?: string[]
}

export type DisadvantageEffect =
  | { type: 'skillPoints'; value: number }
  | { type: 'substat'; stat: 'veripisteet' | 'syvaHaava'; value: number }

export type Disadvantage = {
  id: string
  name: string
  description: string
  benefit: number
  effect?: DisadvantageEffect
  conflicts?: string[]
}

export type SubStats = {
  veripisteet: number
  vauriobonus: number
  syvaHaava: number
  kantokyky: number
}

export type Equipment = {
  id: string
  name: string
  category: string
  weight: number
  cost: number
  description: string
}

export type Character = {
  id: string
  name: string
  attributes: Attr[]
  learnedSkills: LearnedSkill[]  // Only learned skills (stored)
  background: Background | null
  secondBackgroundId: string | null  // For Ottolapsi advantage
  advantages: Advantage[]
  disadvantages: Disadvantage[]
  subStats: SubStats
  equipment: Equipment[]
  createdAt: number
  updatedAt: number
  version: string
}

export type CharacterDraft = {
  name: string
  attributes: Attr[]
  learnedSkills: LearnedSkill[]  // Only learned skills (stored)
  background: Background | null
  secondBackgroundId: string | null  // For Ottolapsi advantage
  advantages: Advantage[]
  disadvantages: Disadvantage[]
  subStats: SubStats | null
  equipment: Equipment[]
}

export type CharacterCreationStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
