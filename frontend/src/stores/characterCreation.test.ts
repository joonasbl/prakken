import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterCreationStore } from '@/stores/characterCreation'

describe('Character Creation Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty draft', () => {
    const store = useCharacterCreationStore()
    
    expect(store.draft.name).toBe('')
    expect(store.draft.attributes).toHaveLength(6)
    expect(store.draft.background).toBeNull()
    expect(store.currentStep).toBe(1)
  })

  it('sets character name', () => {
    const store = useCharacterCreationStore()
    
    store.setName('Arthas')
    
    expect(store.draft.name).toBe('Arthas')
  })

  it('sets background with stat bonuses', () => {
    const store = useCharacterCreationStore()
    const background = {
      id: 'ritari',
      name: 'Ritari',
      description: 'A noble knight',
      statBonuses: { Karisma: 1, Voima: 1 },
      skillBonuses: { Miekat: 1 },
    }
    
    store.setBackground(background)
    
    expect(store.draft.background).toEqual(background)
    expect(store.hasSelectedBackground).toBe(true)
  })

  it('toggles advantages', () => {
    const store = useCharacterCreationStore()
    const advantage = {
      id: 'rohkea',
      name: 'Rohkea',
      description: 'Brave character',
      cost: 1,
    }

    expect(store.selectedAdvantages).toHaveLength(0)

    store.toggleAdvantage(advantage)
    expect(store.selectedAdvantages).toHaveLength(1)

    store.toggleAdvantage(advantage)
    expect(store.selectedAdvantages).toHaveLength(0)
  })

  it('toggles disadvantages', () => {
    const store = useCharacterCreationStore()
    const disadvantage = {
      id: 'peluri',
      name: 'Peluri',
      description: 'A gambler',
      benefit: 1,
    }

    store.toggleDisadvantage(disadvantage)
    expect(store.selectedDisadvantages).toHaveLength(1)

    store.toggleDisadvantage(disadvantage)
    expect(store.selectedDisadvantages).toHaveLength(0)
  })

  it('validates advantage/disadvantage balance', () => {
    const store = useCharacterCreationStore()

    expect(store.isAdvAdvantageBalanced).toBe(true)

    store.toggleAdvantage({ id: 'adv1', name: 'Advantage 1', description: 'Test', cost: 1 })
    expect(store.isAdvAdvantageBalanced).toBe(false)

    store.toggleDisadvantage({ id: 'dis1', name: 'Disadvantage 1', description: 'Test', benefit: 1 })
    expect(store.isAdvAdvantageBalanced).toBe(true)
  })

  it('sets substats', () => {
    const store = useCharacterCreationStore()
    const subStats = {
      veripisteet: 12,
      vauriobonus: 0,
      syvaHaava: 7,
      kantokyky: 220,
    }
    
    store.setSubStats(subStats)
    
    expect(store.draft.subStats).toEqual(subStats)
  })

  it('navigates between steps', () => {
    const store = useCharacterCreationStore()
    
    expect(store.currentStep).toBe(1)
    
    store.nextStep()
    expect(store.currentStep).toBe(2)
    
    store.previousStep()
    expect(store.currentStep).toBe(1)
    
    // Can't go below 1
    store.previousStep()
    expect(store.currentStep).toBe(1)
  })

  it('resets to initial state', () => {
    const store = useCharacterCreationStore()

    store.setName('Test')
    store.nextStep()
    store.toggleAdvantage({ id: 'adv1', name: 'Adv', description: 'Test', cost: 1 })

    store.resetWizard()

    expect(store.draft.name).toBe('')
    expect(store.currentStep).toBe(1)
    expect(store.selectedAdvantages).toHaveLength(0)
  })

  it('tracks skill point limit', () => {
    const store = useCharacterCreationStore()

    expect(store.skillPointLimit).toBe(100)

    // Test with age advantage (120 points) - need full advantage object
    store.toggleAdvantage({
      id: 'ika_ja_kokemus',
      name: 'Ikä ja kokemus',
      description: 'Old and experienced',
      cost: 2,
      effect: { type: 'skillPoints', value: 120 }
    })
    expect(store.skillPointLimit).toBe(120)

    store.resetWizard()

    // Test with youth disadvantage (70 points) - need full disadvantage object
    store.toggleDisadvantage({
      id: 'nuori',
      name: 'Nuori',
      description: 'Young',
      benefit: 1,
      effect: { type: 'skillPoints', value: 70 }
    })
    expect(store.skillPointLimit).toBe(70)
  })

  describe('effectiveAttributes', () => {
    it('returns base attributes without bonuses', () => {
      const store = useCharacterCreationStore()

      const effective = store.effectiveAttributes

      expect(effective).toHaveLength(6)
      effective.forEach((attr) => {
        expect(attr.value).toBe(10)
      })
    })

    it('applies background stat bonuses', () => {
      const store = useCharacterCreationStore()
      const background = {
        id: 'ritari',
        name: 'Ritari',
        description: 'A noble knight',
        statBonuses: { Karisma: 1, Voima: 1 },
        skillBonuses: { Miekat: 1 },
      }

      store.setBackground(background)

      const effective = store.effectiveAttributes

      const voima = effective.find((a) => a.name === 'Voima')
      const karisma = effective.find((a) => a.name === 'Karisma')
      const terveys = effective.find((a) => a.name === 'Terveys')

      expect(voima?.value).toBe(11)
      expect(karisma?.value).toBe(11)
      expect(terveys?.value).toBe(10) // unchanged
    })

    it('applies Lahjakas advantage bonuses', () => {
      const store = useCharacterCreationStore()

      // Set attribute choices (simulating Lahjakas selection)
      store.setAttributeChoice('Voima', 1)
      store.setAttributeChoice('Ketteryys', 1)

      const effective = store.effectiveAttributes

      const voima = effective.find((a) => a.name === 'Voima')
      const ketteryys = effective.find((a) => a.name === 'Ketteryys')
      const valppaus = effective.find((a) => a.name === 'Valppaus')

      expect(voima?.value).toBe(11)
      expect(ketteryys?.value).toBe(11)
      expect(valppaus?.value).toBe(10) // unchanged
    })

    it('applies both background and Lahjakas bonuses', () => {
      const store = useCharacterCreationStore()
      const background = {
        id: 'ritari',
        name: 'Ritari',
        description: 'A noble knight',
        statBonuses: { Karisma: 1, Voima: 1 },
        skillBonuses: { Miekat: 1 },
      }

      store.setBackground(background)
      store.setAttributeChoice('Voima', 2) // Max bonus to Voima

      const effective = store.effectiveAttributes

      const voima = effective.find((a) => a.name === 'Voima')
      const karisma = effective.find((a) => a.name === 'Karisma')
      const ketteryys = effective.find((a) => a.name === 'Ketteryys')

      expect(voima?.value).toBe(13) // 10 + 1 (background) + 2 (Lahjakas)
      expect(karisma?.value).toBe(11) // 10 + 1 (background)
      expect(ketteryys?.value).toBe(10) // unchanged
    })

    it('handles multiple attribute choices to same attribute', () => {
      const store = useCharacterCreationStore()

      store.setAttributeChoice('Terveys', 2)

      const effective = store.effectiveAttributes
      const terveys = effective.find((a) => a.name === 'Terveys')

      expect(terveys?.value).toBe(12)
    })

    it('does not mutate base attributes', () => {
      const store = useCharacterCreationStore()
      const background = {
        id: 'ritari',
        name: 'Ritari',
        description: 'A noble knight',
        statBonuses: { Karisma: 1, Voima: 1 },
        skillBonuses: { Miekat: 1 },
      }

      store.setBackground(background)
      store.setAttributeChoice('Voima', 1)

      // Access effective attributes
      store.effectiveAttributes

      // Base attributes should remain unchanged
      expect(store.draft.attributes.find((a) => a.name === 'Voima')?.value).toBe(10)
      expect(store.draft.attributes.find((a) => a.name === 'Karisma')?.value).toBe(10)
    })
  })
})
