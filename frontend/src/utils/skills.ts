import type { Attr } from '@/types/attributes'
import type { Skill, LearnedSkill, SkillWithLevel } from '@/types/skills'
import type { Background } from '@/types/character'

const baseCodeToAttributeName: Record<string, string | null> = {
  voi: 'Voima',
  val: 'Valppaus',
  kar: 'Karisma',
  ket: 'Ketteryys',
  sis: 'Sisukkuus',
  ei: null,
  erikois: null,
}

/**
 * Calculate full skill data from learned skills
 * @param learnedSkills - Array of learned skill references
 * @param allSkills - Master skill list from skills store
 * @param attributes - Character attributes (should be effective attributes with bonuses)
 * @param background - Character background (for background skill detection)
 */
export function calculateSkillsWithLevels(
  learnedSkills: LearnedSkill[],
  allSkills: Skill[],
  attributes: Attr[],
  background: Background | null
): SkillWithLevel[] {
  return learnedSkills
    .map((learnedSkill) => {
      const skillDef = allSkills.find((s) => s.name === learnedSkill.name)
      if (!skillDef) return null

      const attributeName = baseCodeToAttributeName[skillDef.baseCode]
      const attribute =
        attributeName != null
          ? attributes.find((attr) => attr.name === attributeName)
          : undefined

      const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6
      const level = baseLevel + learnedSkill.bonus
      const isBackgroundSkill = background?.skillBonuses[learnedSkill.name] !== undefined

      return {
        ...skillDef,
        bonus: learnedSkill.bonus,
        level,
        baseLabel: attributeName,
        baseLevel,
        learned: true,
        backgroundSkill: isBackgroundSkill,
      }
    })
    .filter((s) => s !== null) as SkillWithLevel[]
}

/**
 * Check if a skill is learned
 */
export function isSkillLearned(learnedSkills: LearnedSkill[], skillName: string): boolean {
  return learnedSkills.some((s) => s.name === skillName)
}

/**
 * Get a learned skill by name
 */
export function getLearnedSkill(learnedSkills: LearnedSkill[], skillName: string): LearnedSkill | undefined {
  return learnedSkills.find((s) => s.name === skillName)
}

/**
 * Calculate unlearned skills with base levels
 * @param learnedSkills - Array of learned skill references
 * @param allSkills - Master skill list from skills store
 * @param attributes - Character attributes
 */
export function calculateUnlearnedSkills(
  learnedSkills: LearnedSkill[],
  allSkills: Skill[],
  attributes: Attr[]
): SkillWithLevel[] {
  if (!learnedSkills || !allSkills || !attributes) return []

  const learnedNames = new Set(learnedSkills.map((s) => s.name))

  return allSkills
    .filter((skill) => !learnedNames.has(skill.name))
    .map((skill) => {
      const attributeName = baseCodeToAttributeName[skill.baseCode]
      const attribute =
        attributeName != null
          ? attributes.find((attr) => attr.name === attributeName)
          : undefined

      const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6

      return {
        ...skill,
        bonus: 0,
        level: baseLevel,
        baseLabel: attributeName,
        baseLevel,
        learned: false,
        backgroundSkill: false,
      }
    })
}
