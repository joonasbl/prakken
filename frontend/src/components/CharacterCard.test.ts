import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CharacterCard from '@/components/CharacterCard.vue'
import type { Character } from '@/types/character'

const createTestCharacter = (): Character => ({
  id: 'test-1',
  name: 'Test Character',
  background: {
    id: 'maalainen',
    name: 'Maalainen',
    description: 'A simple farmer',
    statBonuses: { Terveys: 1 },
    skillBonuses: {},
  },
  secondBackgroundId: null,
  attributes: [
    { name: 'Voima', value: 10 },
    { name: 'Terveys', value: 12 },
    { name: 'Ketteryys', value: 11 },
    { name: 'Valppaus', value: 10 },
    { name: 'Sisukkuus', value: 10 },
    { name: 'Karisma', value: 10 },
  ],
  advantages: [],
  disadvantages: [],
  learnedSkills: [],
  equipment: [],
  equippedItems: [],
  subStats: {
    veripisteet: 11,
    vauriobonus: 0,
    syvaHaava: 6,
    kantokyky: 200,
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  version: '1.0.0',
})

describe('CharacterCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders character name', () => {
    const character = createTestCharacter()
    const wrapper = shallowMount(CharacterCard, {
      props: { character },
    })
    
    expect(wrapper.text()).toContain('Test Character')
  })

  it('displays formatted date', () => {
    const character = createTestCharacter()
    const wrapper = shallowMount(CharacterCard, {
      props: { character },
    })
    
    // Should contain date in format like "11.3.2026"
    expect(wrapper.text()).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/)
  })

  it('shows attribute values', () => {
    const character = createTestCharacter()
    const wrapper = shallowMount(CharacterCard, {
      props: { character },
    })
    
    expect(wrapper.text()).toContain('VOI')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('TER')
    expect(wrapper.text()).toContain('12')
  })

  it('shows background', () => {
    const character = createTestCharacter()
    const wrapper = shallowMount(CharacterCard, {
      props: { character },
    })
    
    expect(wrapper.text()).toContain('Tausta')
    expect(wrapper.text()).toContain('Maalainen')
  })

  it('shows hit points', () => {
    const character = createTestCharacter()
    const wrapper = shallowMount(CharacterCard, {
      props: { character },
    })
    
    expect(wrapper.text()).toContain('Veripisteet')
    expect(wrapper.text()).toContain('11')
  })

  it('emits load event when load button clicked', async () => {
    const character = createTestCharacter()
    const wrapper = shallowMount(CharacterCard, {
      props: { character },
    })
    
    const loadButton = wrapper.find('.btn-load')
    await loadButton.trigger('click')
    
    expect(wrapper.emitted('load')).toBeTruthy()
    expect(wrapper.emitted('load')?.[0]).toEqual(['test-1'])
  })

  it('emits delete event when delete button clicked', async () => {
    const character = createTestCharacter()
    const wrapper = shallowMount(CharacterCard, {
      props: { character },
    })
    
    // Mock confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    
    const deleteButton = wrapper.find('.btn-delete')
    await deleteButton.trigger('click')
    
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]).toEqual(['test-1'])
  })

  it('does not emit delete when cancelled', async () => {
    const character = createTestCharacter()
    const wrapper = shallowMount(CharacterCard, {
      props: { character },
    })
    
    // Mock confirm to return false
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    
    const deleteButton = wrapper.find('.btn-delete')
    await deleteButton.trigger('click')
    
    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('handles missing background gracefully', () => {
    const character = createTestCharacter()
    character.background = null
    const wrapper = shallowMount(CharacterCard, {
      props: { character },
    })
    
    expect(wrapper.text()).toContain('Ei valittu')
  })
})
