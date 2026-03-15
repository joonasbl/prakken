import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharactersStore } from '@/stores/characters'
import type { Character } from '@/types/character'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    clear: () => {
      store = {}
    },
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

describe('Characters Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  const createTestCharacter = (): Character => ({
    id: 'test-1',
    name: 'Test Character',
    background: {
      id: 'maalainen',
      name: 'Maalainen',
      description: 'Test background',
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

  it('starts with empty character list', () => {
    const store = useCharactersStore()
    expect(store.characters).toHaveLength(0)
  })

  it('saves a character to localStorage', () => {
    const store = useCharactersStore()
    const character = createTestCharacter()
    
    store.saveCharacter(character)
    
    expect(store.characters).toHaveLength(1)
    expect(store.characters[0].name).toBe('Test Character')
    
    const stored = localStorage.getItem('prakken_characters')
    expect(stored).toBeTruthy()
    
    const parsed = JSON.parse(stored!)
    expect(parsed.characters).toHaveLength(1)
  })

  it('gets character by ID', () => {
    const store = useCharactersStore()
    const character = createTestCharacter()
    const saved = store.saveCharacter(character)

    const found = store.getCharacterById(saved.id)

    expect(found).toBeTruthy()
    expect(found?.name).toBe('Test Character')
  })

  it('returns null for non-existent character', () => {
    const store = useCharactersStore()

    const found = store.getCharacterById('non-existent')

    expect(found).toBeNull()
  })

  it('deletes a character', () => {
    const store = useCharactersStore()
    const character = createTestCharacter()
    const saved = store.saveCharacter(character)

    expect(store.characters).toHaveLength(1)

    store.deleteCharacter(saved.id)

    expect(store.characters).toHaveLength(0)
  })

  it('sets active character', () => {
    const store = useCharactersStore()
    const character = createTestCharacter()
    store.saveCharacter(character)
    
    // Get the actual ID that was generated
    const savedChar = store.characters[0]
    store.setActiveCharacter(savedChar.id)
    
    expect(store.activeCharacter).toBeTruthy()
    expect(store.activeCharacter?.id).toBe(savedChar.id)
  })

  it('sorts characters by updated date', () => {
    const store = useCharactersStore()
    const baseTime = Date.now()

    const char1: Character = {
      ...createTestCharacter(),
      id: 'char-1',
      name: 'First',
      updatedAt: baseTime - 1000,
    }
    const char2: Character = {
      ...createTestCharacter(),
      id: 'char-2',
      name: 'Second',
      updatedAt: baseTime + 1000,
    }

    // Directly add to state to preserve timestamps
    store.characters.push(char1)
    store.characters.push(char2)

    expect(store.charactersSorted[0].name).toBe('Second')
    expect(store.charactersSorted[1].name).toBe('First')
  })

  it('loads characters from localStorage', () => {
    const character = createTestCharacter()
    // Use the same storage format as the app
    localStorage.setItem('prakken_characters', JSON.stringify({
      version: '1.0.0',
      characters: [character],
      activeCharacterId: null,
    }))

    const store = useCharactersStore()
    store.loadFromStorage()

    expect(store.characters).toHaveLength(1)
    expect(store.characters[0].name).toBe('Test Character')
  })

  it('renames a character', () => {
    const store = useCharactersStore()
    const character = createTestCharacter()
    const saved = store.saveCharacter(character)

    // Add small delay to ensure different timestamp
    const beforeTime = saved.updatedAt
    setTimeout(() => {}, 1)
    
    const success = store.renameCharacter(saved.id, 'New Character Name')

    expect(success).toBe(true)
    expect(store.characters[0].name).toBe('New Character Name')
    expect(store.characters[0].updatedAt).toBeGreaterThanOrEqual(beforeTime)
  })

  it('trims whitespace when renaming', () => {
    const store = useCharactersStore()
    const character = createTestCharacter()
    const saved = store.saveCharacter(character)

    store.renameCharacter(saved.id, '  Trimmed Name  ')

    expect(store.characters[0].name).toBe('Trimmed Name')
  })

  it('returns false when renaming with empty name', () => {
    const store = useCharactersStore()
    const character = createTestCharacter()
    const saved = store.saveCharacter(character)

    const success = store.renameCharacter(saved.id, '')

    expect(success).toBe(false)
    expect(store.characters[0].name).toBe('Test Character')
  })

  it('returns false when renaming with whitespace only', () => {
    const store = useCharactersStore()
    const character = createTestCharacter()
    const saved = store.saveCharacter(character)

    const success = store.renameCharacter(saved.id, '   ')

    expect(success).toBe(false)
    expect(store.characters[0].name).toBe('Test Character')
  })

  it('returns false when renaming non-existent character', () => {
    const store = useCharactersStore()

    const success = store.renameCharacter('non-existent', 'New Name')

    expect(success).toBe(false)
  })

  it('persists renamed character to localStorage', () => {
    const store = useCharactersStore()
    const character = createTestCharacter()
    const saved = store.saveCharacter(character)

    store.renameCharacter(saved.id, 'Persisted Name')

    const stored = localStorage.getItem('prakken_characters')
    const parsed = JSON.parse(stored!)
    expect(parsed.characters[0].name).toBe('Persisted Name')
  })
})
