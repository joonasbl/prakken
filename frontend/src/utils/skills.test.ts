import { describe, it, expect } from 'vitest'
import { calculateSkillsWithLevels, isSkillLearned, getLearnedSkill } from '@/utils/skills'
import type { LearnedSkill, Skill } from '@/types/skills'
import type { Attr } from '@/types/attributes'
import type { Background } from '@/types/character'

describe('Skills Utility', () => {
  const mockSkills: Skill[] = [
    { name: 'Miekat', baseCode: 'ket', bonus: 0, learned: false, backgroundSkill: false },
    { name: 'Kilvet', baseCode: 'voi', bonus: 0, learned: false, backgroundSkill: false },
    { name: 'Esiintyminen', baseCode: 'kar', bonus: 0, learned: false, backgroundSkill: false },
    { name: 'Erätaidot', baseCode: 'ei', bonus: 0, learned: false, backgroundSkill: false },
  ]

  const createAttributes = (overrides: Record<string, number> = {}): Attr[] => [
    { name: 'Voima', value: overrides.Voima || 10 },
    { name: 'Terveys', value: overrides.Terveys || 10 },
    { name: 'Ketteryys', value: overrides.Ketteryys || 10 },
    { name: 'Valppaus', value: overrides.Valppaus || 10 },
    { name: 'Sisukkuus', value: overrides.Sisukkuus || 10 },
    { name: 'Karisma', value: overrides.Karisma || 10 },
  ]

  const mockBackground: Background = {
    id: 'ritari',
    name: 'Ritari',
    description: 'A knight',
    statBonuses: {},
    skillBonuses: { 'Miekat': 0, 'Kilvet': 0 },
  }

  describe('calculateSkillsWithLevels', () => {
    it('calculates skill levels from base attributes', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Miekat', bonus: 0 },
      ]
      const attributes = createAttributes({ Ketteryys: 10 })

      const result = calculateSkillsWithLevels(learnedSkills, mockSkills, attributes, null)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Miekat')
      expect(result[0].level).toBe(5) // ceil(10/2)
      expect(result[0].baseLevel).toBe(5)
    })

    it('calculates skill levels with attribute bonuses included', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Miekat', bonus: 0 },
      ]
      // Attributes with bonus already applied (effective attributes)
      const attributes = createAttributes({ Ketteryys: 14 })

      const result = calculateSkillsWithLevels(learnedSkills, mockSkills, attributes, null)

      expect(result[0].level).toBe(7) // ceil(14/2)
      expect(result[0].baseLevel).toBe(7)
    })

    it('applies skill bonus to level', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Miekat', bonus: 2 },
      ]
      const attributes = createAttributes({ Ketteryys: 10 })

      const result = calculateSkillsWithLevels(learnedSkills, mockSkills, attributes, null)

      expect(result[0].level).toBe(7) // 5 (base) + 2 (bonus)
      expect(result[0].bonus).toBe(2)
    })

    it('handles skills without attribute dependency', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Erätaidot', bonus: 0 },
      ]
      const attributes = createAttributes()

      const result = calculateSkillsWithLevels(learnedSkills, mockSkills, attributes, null)

      expect(result[0].level).toBe(6) // default base level
      expect(result[0].baseLevel).toBe(6)
      expect(result[0].baseLabel).toBe(null)
    })

    it('identifies background skills', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Miekat', bonus: 0 },
        { name: 'Esiintyminen', bonus: 0 },
      ]
      const attributes = createAttributes()

      const result = calculateSkillsWithLevels(learnedSkills, mockSkills, attributes, mockBackground)

      const miekat = result.find((s) => s.name === 'Miekat')
      const esiintyminen = result.find((s) => s.name === 'Esiintyminen')

      expect(miekat?.backgroundSkill).toBe(true)
      expect(esiintyminen?.backgroundSkill).toBe(false)
    })

    it('returns empty array for no learned skills', () => {
      const learnedSkills: LearnedSkill[] = []
      const attributes = createAttributes()

      const result = calculateSkillsWithLevels(learnedSkills, mockSkills, attributes, null)

      expect(result).toHaveLength(0)
    })

    it('filters out unknown skills', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'UnknownSkill', bonus: 0 },
        { name: 'Miekat', bonus: 0 },
      ]
      const attributes = createAttributes()

      const result = calculateSkillsWithLevels(learnedSkills, mockSkills, attributes, null)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Miekat')
    })

    it('calculates multiple skills correctly', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Miekat', bonus: 1 },
        { name: 'Kilvet', bonus: 0 },
        { name: 'Esiintyminen', bonus: 2 },
      ]
      const attributes = createAttributes({ Ketteryys: 12, Voima: 14, Karisma: 8 })

      const result = calculateSkillsWithLevels(learnedSkills, mockSkills, attributes, null)

      const miekat = result.find((s) => s.name === 'Miekat')
      const kilvet = result.find((s) => s.name === 'Kilvet')
      const esiintyminen = result.find((s) => s.name === 'Esiintyminen')

      expect(miekat?.level).toBe(7) // ceil(12/2) + 1
      expect(miekat?.baseLevel).toBe(6)
      expect(kilvet?.level).toBe(7) // ceil(14/2) + 0
      expect(kilvet?.baseLevel).toBe(7)
      expect(esiintyminen?.level).toBe(6) // ceil(8/2) + 2
      expect(esiintyminen?.baseLevel).toBe(4)
    })
  })

  describe('isSkillLearned', () => {
    it('returns true for learned skill', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Miekat', bonus: 0 },
      ]

      expect(isSkillLearned(learnedSkills, 'Miekat')).toBe(true)
    })

    it('returns false for unknown skill', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Miekat', bonus: 0 },
      ]

      expect(isSkillLearned(learnedSkills, 'Kilvet')).toBe(false)
    })

    it('returns false for empty list', () => {
      const learnedSkills: LearnedSkill[] = []

      expect(isSkillLearned(learnedSkills, 'Miekat')).toBe(false)
    })
  })

  describe('getLearnedSkill', () => {
    it('returns skill definition for known skill', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Miekat', bonus: 2 },
      ]

      const result = getLearnedSkill(learnedSkills, 'Miekat')

      expect(result).toEqual({ name: 'Miekat', bonus: 2 })
    })

    it('returns undefined for unknown skill', () => {
      const learnedSkills: LearnedSkill[] = [
        { name: 'Miekat', bonus: 0 },
      ]

      const result = getLearnedSkill(learnedSkills, 'Kilvet')

      expect(result).toBeUndefined()
    })

    it('returns undefined for empty list', () => {
      const learnedSkills: LearnedSkill[] = []

      const result = getLearnedSkill(learnedSkills, 'Miekat')

      expect(result).toBeUndefined()
    })
  })
})
