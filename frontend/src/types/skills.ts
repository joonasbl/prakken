export type SkillBaseCode = 'voi' | 'val' | 'kar' | 'ket' | 'sis' | 'ei' | 'erikois'

// Full skill definition (used in skills store)
export type Skill = {
  name: string
  baseCode: SkillBaseCode
  bonus: number
  learned: boolean
  backgroundSkill: boolean
}

// Stored skill reference (only for learned skills in character data)
export type LearnedSkill = {
  name: string
  bonus: number
}

// Display skill (calculated with level for UI)
export type SkillWithLevel = Skill & {
  level: number
  baseLabel: string | null
  baseLevel: number
}

