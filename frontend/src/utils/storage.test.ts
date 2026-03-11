import { describe, it, expect, beforeEach } from 'vitest'
import { loadStorage, saveStorage, loadActiveCharacterId, saveActiveCharacterId } from '@/utils/storage'
import type { Character, SubStats } from '@/types/character'

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

const createTestCharacter = (id: string, name: string): Character => ({
  id,
  name,
  background: null,
  attributes: [],
  advantages: [],
  disadvantages: [],
  skills: [],
  equipment: [],
  subStats: {
    veripisteet: 10,
    vauriobonus: 0,
    syvaHaava: 5,
    kantokyky: 200,
  } as SubStats,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads empty storage when nothing saved', () => {
    const data = loadStorage()
    
    expect(data.version).toBe('1.0.0')
    expect(data.characters).toHaveLength(0)
    expect(data.activeCharacterId).toBeNull()
  })

  it('saves and loads characters', () => {
    const character = createTestCharacter('test-1', 'Test Character')
    
    saveStorage({ version: '1.0.0', characters: [character], activeCharacterId: null })
    
    const data = loadStorage()
    expect(data.characters).toHaveLength(1)
    expect(data.characters[0].name).toBe('Test Character')
  })

  it('updates existing characters', () => {
    const character = createTestCharacter('test-1', 'Original Name')
    saveStorage({ version: '1.0.0', characters: [character], activeCharacterId: null })
    
    const updated = { ...character, name: 'Updated Name' }
    saveStorage({ version: '1.0.0', characters: [updated], activeCharacterId: null })
    
    const data = loadStorage()
    expect(data.characters[0].name).toBe('Updated Name')
  })

  it('handles invalid JSON gracefully', () => {
    localStorage.setItem('prakken_characters', 'invalid json')
    
    const data = loadStorage()
    expect(data.characters).toHaveLength(0)
  })

  it('saves and loads active character ID', () => {
    saveActiveCharacterId('test-123')
    
    const activeId = loadActiveCharacterId()
    expect(activeId).toBe('test-123')
  })

  it('returns null when no active character', () => {
    const activeId = loadActiveCharacterId()
    expect(activeId).toBeNull()
  })

  it('clears active character when null is saved', () => {
    saveActiveCharacterId('test-123')
    saveActiveCharacterId(null)
    
    const activeId = loadActiveCharacterId()
    expect(activeId).toBeNull()
  })
})
