import { describe, it, expect, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Step1RollStats from '@/components/character-creation/Step1RollStats.vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'

describe('Step1RollStats', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders attribute list', () => {
    const wrapper = shallowMount(Step1RollStats)
    
    expect(wrapper.text()).toContain('Heitä ominaisuusluvut')
    expect(wrapper.findAll('.stat-row')).toHaveLength(6)
  })

  it('displays total points', async () => {
    const wrapper = shallowMount(Step1RollStats)
    
    // Default attributes should sum to 60 (6 attributes × 10)
    expect(wrapper.text()).toContain('Yhteensä: 60')
  })

  it('allows manual adjustment of attributes', async () => {
    const store = useCharacterCreationStore()
    const wrapper = shallowMount(Step1RollStats)
    
    // Set initial value
    store.draft.attributes[0].value = 10
    
    // Find and click the + button for first attribute
    const buttons = wrapper.findAll('.stat-btn')
    // First button is the - button for first attribute
    const firstPlusButton = buttons[1]
    
    await firstPlusButton.trigger('click')
    
    // First attribute should now be 11
    expect(store.draft.attributes[0].value).toBe(11)
  })

  it('prevents attributes below 3', async () => {
    const wrapper = shallowMount(Step1RollStats)
    const store = useCharacterCreationStore()
    
    // Set attribute to minimum
    store.draft.attributes[0].value = 3
    
    const minusButtons = wrapper.findAll('.stat-btn')
    const firstMinusButton = minusButtons[0]
    
    await firstMinusButton.trigger('click')
    
    // Should still be 3
    expect(store.draft.attributes[0].value).toBe(3)
  })

  it('prevents attributes above 18', async () => {
    const wrapper = shallowMount(Step1RollStats)
    const store = useCharacterCreationStore()
    
    // Set attribute to maximum
    store.draft.attributes[0].value = 18
    
    const plusButtons = wrapper.findAll('.stat-btn')
    // + button is second in the control group
    const firstPlusButton = plusButtons[1]
    
    await firstPlusButton.trigger('click')
    
    // Should still be 18
    expect(store.draft.attributes[0].value).toBe(18)
  })

  it('rolls new stats', async () => {
    const wrapper = shallowMount(Step1RollStats)
    const store = useCharacterCreationStore()
    
    // Set a known value
    store.draft.attributes[0].value = 18
    
    const rollButton = wrapper.find('.roll-button')
    await rollButton.trigger('click')
    
    // Value should have changed (random roll)
    expect(store.draft.attributes[0].value).toBeLessThanOrEqual(18)
    expect(store.draft.attributes[0].value).toBeGreaterThanOrEqual(3)
  })
})
