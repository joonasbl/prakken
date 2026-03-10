import type { Attr } from './attributes'
import type { Skill } from './skills'

export type Background = {
  id: string
  name: string
  description: string
  statBonuses: Partial<Record<string, number>>
  skillBonuses: Partial<Record<string, number>>
}

export type Advantage = {
  id: string
  name: string
  description: string
  cost: number
}

export type Disadvantage = {
  id: string
  name: string
  description: string
  benefit: number
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
  skills: Skill[]
  background: Background | null
  advantages: Advantage[]
  disadvantages: Disadvantage[]
  subStats: SubStats
  equipment: Equipment[]
  createdAt: number
}

export type CharacterDraft = {
  name: string
  attributes: Attr[]
  skills: Skill[]
  background: Background | null
  advantages: Advantage[]
  disadvantages: Disadvantage[]
  subStats: SubStats | null
  equipment: Equipment[]
}

export type CharacterCreationStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
