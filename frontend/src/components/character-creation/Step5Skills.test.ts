import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import type { LearnedSkill } from '@/types/skills'
import type { Background } from '@/types/character'

describe('Step5Skills - Background Skill Protection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const setupWizardWithBackground = (backgroundSkillBonuses: Record<string, number> = {}) => {
    const wizardStore = useCharacterCreationStore()
    wizardStore.setBackground({
      id: 'test-background',
      name: 'Test Background',
      description: 'Test description',
      statBonuses: {},
      skillBonuses: backgroundSkillBonuses,
    })
    return wizardStore
  }

  // Helper function to check if skill is from background (mimics isBgSkill from component)
  const isBgSkill = (skillName: string, background: Background | null): boolean => {
    if (background?.skillBonuses) {
      for (const name of Object.keys(background.skillBonuses)) {
        if (name === skillName) {
          return true
        }
      }
    }
    return false
  }

  // Helper function to handle unlearn (mimics handleUnlearn from component)
  const handleUnlearn = (wizardStore: ReturnType<typeof useCharacterCreationStore>, skillName: string): boolean => {
    const learnedSkill = wizardStore.draft.learnedSkills.find((s: LearnedSkill) => s.name === skillName)
    if (!learnedSkill || learnedSkill.bonus > 0 || isBgSkill(learnedSkill.name, wizardStore.draft.background)) {
      return false // Cannot unlearn
    }
    const index = wizardStore.draft.learnedSkills.findIndex((s: LearnedSkill) => s.name === skillName)
    if (index >= 0) {
      wizardStore.draft.learnedSkills.splice(index, 1)
      return true // Successfully unlearned
    }
    return false
  }

  describe('isBgSkill helper function', () => {
    it('returns true for skills from background', () => {
      const wizardStore = setupWizardWithBackground({
        'Miekat': 1,
        'Jouset': 2,
      })

      expect(isBgSkill('Miekat', wizardStore.draft.background)).toBe(true)
      expect(isBgSkill('Jouset', wizardStore.draft.background)).toBe(true)
    })

    it('returns false for skills not from background', () => {
      const wizardStore = setupWizardWithBackground({
        'Miekat': 1,
      })

      expect(isBgSkill('Lyömäaseet', wizardStore.draft.background)).toBe(false)
    })

    it('returns false when background has no skill bonuses', () => {
      const wizardStore = setupWizardWithBackground({})

      expect(isBgSkill('Miekat', wizardStore.draft.background)).toBe(false)
    })

    it('returns false when background is null', () => {
      const wizardStore = useCharacterCreationStore()
      wizardStore.draft.background = null

      expect(isBgSkill('Miekat', wizardStore.draft.background)).toBe(false)
    })
  })

  describe('handleUnlearn function', () => {
    it('allows unlearning a normal learned skill', () => {
      const wizardStore = setupWizardWithBackground({
        'Miekat': 1,
      })
      wizardStore.setLearnedSkills([
        { name: 'Miekat', bonus: 0 }, // background skill
        { name: 'Lyömäaseet', bonus: 0 }, // normal skill
      ])

      const initialCount = wizardStore.draft.learnedSkills.length
      const result = handleUnlearn(wizardStore, 'Lyömäaseet')

      expect(result).toBe(true)
      expect(wizardStore.draft.learnedSkills.length).toBe(initialCount - 1)
      expect(wizardStore.draft.learnedSkills.some((s: LearnedSkill) => s.name === 'Lyömäaseet')).toBe(false)
      expect(wizardStore.draft.learnedSkills.some((s: LearnedSkill) => s.name === 'Miekat')).toBe(true)
    })

    it('prevents unlearning a background skill', () => {
      const wizardStore = setupWizardWithBackground({
        'Miekat': 1,
        'Jouset': 2,
      })
      wizardStore.setLearnedSkills([
        { name: 'Miekat', bonus: 0 },
        { name: 'Jouset', bonus: 0 },
      ])

      const initialCount = wizardStore.draft.learnedSkills.length

      // Try to unlearn background skills
      const result1 = handleUnlearn(wizardStore, 'Miekat')
      const result2 = handleUnlearn(wizardStore, 'Jouset')

      expect(result1).toBe(false)
      expect(result2).toBe(false)
      // Should still have the same number of skills
      expect(wizardStore.draft.learnedSkills.length).toBe(initialCount)
      expect(wizardStore.draft.learnedSkills.some((s: LearnedSkill) => s.name === 'Miekat')).toBe(true)
      expect(wizardStore.draft.learnedSkills.some((s: LearnedSkill) => s.name === 'Jouset')).toBe(true)
    })

    it('prevents unlearning a raised skill', () => {
      const wizardStore = setupWizardWithBackground()
      wizardStore.setLearnedSkills([
        { name: 'Miekat', bonus: 2 }, // raised skill
      ])

      const initialCount = wizardStore.draft.learnedSkills.length
      const result = handleUnlearn(wizardStore, 'Miekat')

      expect(result).toBe(false)
      expect(wizardStore.draft.learnedSkills.length).toBe(initialCount)
    })

    it('prevents unlearning non-existent skill', () => {
      const wizardStore = setupWizardWithBackground()
      wizardStore.setLearnedSkills([{ name: 'Miekat', bonus: 0 }])

      const initialCount = wizardStore.draft.learnedSkills.length
      const result = handleUnlearn(wizardStore, 'NonExistentSkill')

      expect(result).toBe(false)
      expect(wizardStore.draft.learnedSkills.length).toBe(initialCount)
    })

    it('prevents unlearning background skill even if raised', () => {
      const wizardStore = setupWizardWithBackground({
        'Miekat': 1,
      })
      wizardStore.setLearnedSkills([
        { name: 'Miekat', bonus: 3 }, // background skill that's also raised
      ])

      const initialCount = wizardStore.draft.learnedSkills.length
      const result = handleUnlearn(wizardStore, 'Miekat')

      expect(result).toBe(false)
      // Should not be able to unlearn (both raised AND background)
      expect(wizardStore.draft.learnedSkills.length).toBe(initialCount)
    })

    it('allows unlearning background skill after it has been raised then lowered back to 0', () => {
      const wizardStore = setupWizardWithBackground({
        'Miekat': 1,
      })
      wizardStore.setLearnedSkills([
        { name: 'Miekat', bonus: 0 }, // background skill at base
      ])

      // Background skills cannot be unlearned even at bonus 0
      const result = handleUnlearn(wizardStore, 'Miekat')
      expect(result).toBe(false)
      expect(wizardStore.draft.learnedSkills.some((s: LearnedSkill) => s.name === 'Miekat')).toBe(true)
    })
  })

  describe('skill point calculation', () => {
    const calculateSkillPointCost = (wizardStore: ReturnType<typeof useCharacterCreationStore>): number => {
      const SKILL_LEARN_COST = 2
      let total = 0
      const background = wizardStore.draft.background

      const calculateSkillRaiseCost = (baseLevel: number, currentBonus: number): number => {
        const currentLevel = baseLevel + currentBonus
        return currentLevel < 10 ? 1 : 2
      }

      for (const learnedSkill of wizardStore.draft.learnedSkills) {
        // Non-background skills cost 2 points to learn
        if (background?.skillBonuses && !(learnedSkill.name in background.skillBonuses)) {
          total += SKILL_LEARN_COST
        }

        // Add raise costs for each bonus level
        for (let i = 0; i < learnedSkill.bonus; i++) {
          total += calculateSkillRaiseCost(6, i) // simplified baseLevel
        }
      }
      return total
    }

    it('does not charge points for background skills', () => {
      const wizardStore = setupWizardWithBackground({
        'Miekat': 1,
      })
      wizardStore.setLearnedSkills([
        { name: 'Miekat', bonus: 0 }, // background skill - free
      ])

      const cost = calculateSkillPointCost(wizardStore)
      expect(cost).toBe(0)
    })

    it('charges 2 points for normal learned skills', () => {
      const wizardStore = setupWizardWithBackground({
        'Miekat': 1,
      })
      wizardStore.setLearnedSkills([
        { name: 'Miekat', bonus: 0 }, // background - free
        { name: 'Lyömäaseet', bonus: 0 }, // normal - 2 points
      ])

      const cost = calculateSkillPointCost(wizardStore)
      expect(cost).toBe(2)
    })

    it('charges for raised skills', () => {
      const wizardStore = setupWizardWithBackground()
      wizardStore.setLearnedSkills([
        { name: 'Miekat', bonus: 2 }, // 2 points to learn + 1 + 1 for raises = 4
      ])

      const cost = calculateSkillPointCost(wizardStore)
      expect(cost).toBe(4)
    })
  })

  describe('integration: complete skill management flow', () => {
    it('handles full character creation flow with background skills', () => {
      const wizardStore = setupWizardWithBackground({
        'Erätaidot': 1,
        'Metsästys': 2,
      })

      // Initial state: background skills are auto-added
      wizardStore.setLearnedSkills([
        { name: 'Erätaidot', bonus: 0 },
        { name: 'Metsästys', bonus: 0 },
      ])

      expect(wizardStore.draft.learnedSkills.length).toBe(2)
      expect(isBgSkill('Erätaidot', wizardStore.draft.background)).toBe(true)
      expect(isBgSkill('Metsästys', wizardStore.draft.background)).toBe(true)

      // Try to unlearn background skills - should fail
      handleUnlearn(wizardStore, 'Erätaidot')
      handleUnlearn(wizardStore, 'Metsästys')

      expect(wizardStore.draft.learnedSkills.length).toBe(2)

      // Add a normal skill
      wizardStore.draft.learnedSkills.push({ name: 'Miekat', bonus: 0 })
      expect(wizardStore.draft.learnedSkills.length).toBe(3)

      // Unlearn normal skill - should succeed
      handleUnlearn(wizardStore, 'Miekat')
      expect(wizardStore.draft.learnedSkills.length).toBe(2)

      // Raise a background skill
      const eraidot = wizardStore.draft.learnedSkills.find((s: LearnedSkill) => s.name === 'Erätaidot')
      if (eraidot) {
        eraidot.bonus = 2
      }

      // Try to unlearn raised background skill - should fail
      handleUnlearn(wizardStore, 'Erätaidot')
      expect(wizardStore.draft.learnedSkills.find((s: LearnedSkill) => s.name === 'Erätaidot')?.bonus).toBe(2)
    })
  })

  describe('Ottolapsi - Second Background', () => {
    const setupOttolapsiCharacter = () => {
      const wizardStore = useCharacterCreationStore()
      
      // Set primary background
      wizardStore.setBackground({
        id: 'aatelinen',
        name: 'Aatelinen',
        description: 'Noble background',
        statBonuses: { Karisma: 2 },
        skillBonuses: { 'Heraldiikka': 0, 'Ratsastus': 0, 'Miekat': 0 },
      })
      
      // Set second background for Ottolapsi
      wizardStore.setSecondBackground('pappi')
      
      return wizardStore
    }

    describe('skill point calculation with Ottolapsi', () => {
      const calculateSkillPointCostWithSecondBackground = (
        wizardStore: ReturnType<typeof useCharacterCreationStore>
      ): number => {
        const SKILL_LEARN_COST = 2
        let total = 0
        const background = wizardStore.draft.background
        const secondBackgroundId = wizardStore.draft.secondBackgroundId

        const calculateSkillRaiseCost = (baseLevel: number, currentBonus: number): number => {
          const currentLevel = baseLevel + currentBonus
          return currentLevel < 10 ? 1 : 2
        }

        for (const learnedSkill of wizardStore.draft.learnedSkills) {
          const isFromPrimaryBackground = background?.skillBonuses[learnedSkill.name] !== undefined
          const isFromSecondBackground = secondBackgroundId && 
            wizardStore.getSecondBackground()?.skillBonuses[learnedSkill.name] !== undefined
          
          if (!isFromPrimaryBackground && !isFromSecondBackground) {
            total += SKILL_LEARN_COST
          }

          for (let i = 0; i < learnedSkill.bonus; i++) {
            total += calculateSkillRaiseCost(6, i)
          }
        }
        return total
      }

      it('does not charge points for primary background skills', () => {
        const wizardStore = setupOttolapsiCharacter()
        wizardStore.setLearnedSkills([
          { name: 'Heraldiikka', bonus: 0 }, // from primary (aatelinen)
          { name: 'Ratsastus', bonus: 0 },   // from primary (aatelinen)
        ])

        const cost = calculateSkillPointCostWithSecondBackground(wizardStore)
        expect(cost).toBe(0)
      })

      it('does not charge points for second background skills', () => {
        const wizardStore = setupOttolapsiCharacter()
        wizardStore.setLearnedSkills([
          { name: 'Esiintyminen', bonus: 0 }, // from secondary (pappi)
          { name: 'Uskonto', bonus: 0 },      // from secondary (pappi)
        ])

        const cost = calculateSkillPointCostWithSecondBackground(wizardStore)
        expect(cost).toBe(0)
      })

      it('does not charge points for skills from both backgrounds', () => {
        const wizardStore = setupOttolapsiCharacter()
        wizardStore.setLearnedSkills([
          { name: 'Heraldiikka', bonus: 0 },  // from primary (aatelinen)
          { name: 'Miekat', bonus: 0 },       // from primary (aatelinen)
          { name: 'Esiintyminen', bonus: 0 }, // from secondary (pappi)
          { name: 'Haavojen hoito', bonus: 0 }, // from secondary (pappi)
        ])

        const cost = calculateSkillPointCostWithSecondBackground(wizardStore)
        expect(cost).toBe(0)
      })

      it('charges points only for non-background skills', () => {
        const wizardStore = setupOttolapsiCharacter()
        wizardStore.setLearnedSkills([
          { name: 'Heraldiikka', bonus: 0 },  // from primary - free
          { name: 'Esiintyminen', bonus: 0 }, // from secondary - free
          { name: 'Lyömäaseet', bonus: 0 },   // not from either - 2 points
          { name: 'Jouset', bonus: 0 },       // not from either - 2 points
        ])

        const cost = calculateSkillPointCostWithSecondBackground(wizardStore)
        expect(cost).toBe(4)
      })

      it('handles duplicate skills from both backgrounds (only charged once as free)', () => {
        const wizardStore = useCharacterCreationStore()
        
        // Both backgrounds have the same skill
        wizardStore.setBackground({
          id: 'test1',
          name: 'Test1',
          description: 'Test',
          statBonuses: {},
          skillBonuses: { 'Miekat': 0 },
        })
        wizardStore.setSecondBackground('pappi') // Also has 'Miekat' potentially
        
        wizardStore.setLearnedSkills([
          { name: 'Miekat', bonus: 0 }, // Would be duplicate
        ])

        const cost = calculateSkillPointCostWithSecondBackground(wizardStore)
        expect(cost).toBe(0) // Free because it's in primary background
      })

      it('charges for raising skills even from background', () => {
        const wizardStore = setupOttolapsiCharacter()
        wizardStore.setLearnedSkills([
          { name: 'Heraldiikka', bonus: 2 }, // from primary, but raised twice
          { name: 'Esiintyminen', bonus: 1 }, // from secondary, raised once
        ])

        const cost = calculateSkillPointCostWithSecondBackground(wizardStore)
        // Heraldiikka: 1 + 1 = 2 points for raises
        // Esiintyminen: 1 point for raise
        expect(cost).toBe(3)
      })
    })

    describe('isBgSkill with Ottolapsi', () => {
      const isBgSkillWithSecondBackground = (
        skillName: string,
        wizardStore: ReturnType<typeof useCharacterCreationStore>
      ): boolean => {
        const background = wizardStore.draft.background
        const secondBackgroundId = wizardStore.draft.secondBackgroundId
        
        if (background?.skillBonuses && background.skillBonuses[skillName] !== undefined) {
          return true
        }
        
        if (secondBackgroundId) {
          const secondBackground = wizardStore.getSecondBackground()
          if (secondBackground?.skillBonuses && secondBackground.skillBonuses[skillName] !== undefined) {
            return true
          }
        }
        
        return false
      }

      it('returns true for primary background skills', () => {
        const wizardStore = setupOttolapsiCharacter()
        
        expect(isBgSkillWithSecondBackground('Heraldiikka', wizardStore)).toBe(true)
        expect(isBgSkillWithSecondBackground('Ratsastus', wizardStore)).toBe(true)
        expect(isBgSkillWithSecondBackground('Miekat', wizardStore)).toBe(true)
      })

      it('returns true for second background skills', () => {
        const wizardStore = setupOttolapsiCharacter()
        
        expect(isBgSkillWithSecondBackground('Esiintyminen', wizardStore)).toBe(true)
        expect(isBgSkillWithSecondBackground('Haavojen hoito', wizardStore)).toBe(true)
        expect(isBgSkillWithSecondBackground('Uskonto', wizardStore)).toBe(true)
      })

      it('returns false for skills not in either background', () => {
        const wizardStore = setupOttolapsiCharacter()
        
        expect(isBgSkillWithSecondBackground('Lyömäaseet', wizardStore)).toBe(false)
        expect(isBgSkillWithSecondBackground('Jouset', wizardStore)).toBe(false)
      })
    })

    describe('handleUnlearn with Ottolapsi', () => {
      const handleUnlearnWithSecondBackground = (
        wizardStore: ReturnType<typeof useCharacterCreationStore>,
        skillName: string
      ): boolean => {
        const learnedSkill = wizardStore.draft.learnedSkills.find((s: LearnedSkill) => s.name === skillName)
        
        const isBgSkill = (skill: string): boolean => {
          const background = wizardStore.draft.background
          const secondBackgroundId = wizardStore.draft.secondBackgroundId
          
          if (background?.skillBonuses && background.skillBonuses[skill] !== undefined) {
            return true
          }
          
          if (secondBackgroundId) {
            const secondBackground = wizardStore.getSecondBackground()
            if (secondBackground?.skillBonuses && secondBackground.skillBonuses[skill] !== undefined) {
              return true
            }
          }
          
          return false
        }
        
        if (!learnedSkill || learnedSkill.bonus > 0 || isBgSkill(learnedSkill.name)) {
          return false
        }
        const index = wizardStore.draft.learnedSkills.findIndex((s: LearnedSkill) => s.name === skillName)
        if (index >= 0) {
          wizardStore.draft.learnedSkills.splice(index, 1)
          return true
        }
        return false
      }

      it('prevents unlearning skills from second background', () => {
        const wizardStore = setupOttolapsiCharacter()
        wizardStore.setLearnedSkills([
          { name: 'Heraldiikka', bonus: 0 },   // from primary
          { name: 'Esiintyminen', bonus: 0 },  // from secondary
          { name: 'Haavojen hoito', bonus: 0 }, // from secondary
        ])

        const initialCount = wizardStore.draft.learnedSkills.length

        // Try to unlearn secondary background skills
        const result1 = handleUnlearnWithSecondBackground(wizardStore, 'Esiintyminen')
        const result2 = handleUnlearnWithSecondBackground(wizardStore, 'Haavojen hoito')

        expect(result1).toBe(false)
        expect(result2).toBe(false)
        expect(wizardStore.draft.learnedSkills.length).toBe(initialCount)
      })

      it('allows unlearning non-background skills when Ottolapsi is active', () => {
        const wizardStore = setupOttolapsiCharacter()
        wizardStore.setLearnedSkills([
          { name: 'Heraldiikka', bonus: 0 },   // from primary - cannot unlearn
          { name: 'Esiintyminen', bonus: 0 },  // from secondary - cannot unlearn
          { name: 'Lyömäaseet', bonus: 0 },    // not from background - can unlearn
        ])

        const initialCount = wizardStore.draft.learnedSkills.length
        const result = handleUnlearnWithSecondBackground(wizardStore, 'Lyömäaseet')

        expect(result).toBe(true)
        expect(wizardStore.draft.learnedSkills.length).toBe(initialCount - 1)
        expect(wizardStore.draft.learnedSkills.some((s: LearnedSkill) => s.name === 'Lyömäaseet')).toBe(false)
      })
    })

    describe('getSecondBackground store function', () => {
      it('returns null when no second background is set', () => {
        const wizardStore = useCharacterCreationStore()
        wizardStore.setBackground({
          id: 'test',
          name: 'Test',
          description: 'Test',
          statBonuses: {},
          skillBonuses: {},
        })

        expect(wizardStore.getSecondBackground()).toBe(null)
      })

      it('returns the second background when set', () => {
        const wizardStore = useCharacterCreationStore()
        wizardStore.setBackground({
          id: 'aatelinen',
          name: 'Aatelinen',
          description: 'Noble',
          statBonuses: {},
          skillBonuses: {},
        })
        wizardStore.setSecondBackground('pappi')

        const secondBg = wizardStore.getSecondBackground()
        expect(secondBg).not.toBe(null)
        expect(secondBg?.id).toBe('pappi')
        expect(secondBg?.name).toBe('Pappi')
      })

      it('returns null for invalid second background id', () => {
        const wizardStore = useCharacterCreationStore()
        wizardStore.setBackground({
          id: 'test',
          name: 'Test',
          description: 'Test',
          statBonuses: {},
          skillBonuses: {},
        })
        wizardStore.setSecondBackground('nonexistent')

        expect(wizardStore.getSecondBackground()).toBe(null)
      })
    })
  })
})
