import { defineStore } from 'pinia'
import type { Character, CharacterDraft } from '@/types/character'
import {
  loadStorage,
  saveStorage,
  loadActiveCharacterId,
  saveActiveCharacterId,
  type StorageData,
} from '@/utils/storage'

const CURRENT_VERSION = '1.0.0'

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export const useCharactersStore = defineStore('characters', {
  state: (): {
    characters: Character[]
    activeCharacterId: string | null
  } => {
    const storage = loadStorage()
    return {
      characters: storage.characters,
      activeCharacterId: loadActiveCharacterId(),
    }
  },
  getters: {
    characterCount: (state) => state.characters.length,
    activeCharacter: (state) =>
      state.characters.find((c) => c.id === state.activeCharacterId) || null,
    charactersSorted: (state) =>
      [...state.characters].sort((a, b) => b.updatedAt - a.updatedAt),
  },
  actions: {
    loadFromStorage() {
      const storage = loadStorage()
      this.characters = storage.characters
      this.activeCharacterId = loadActiveCharacterId()
    },
    saveCharacter(draft: CharacterDraft): Character {
      const now = Date.now()
      const character: Character = {
        ...draft,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        version: CURRENT_VERSION,
        subStats: draft.subStats ?? {
          veripisteet: 10,
          vauriobonus: 0,
          syvaHaava: 5,
          kantokyky: 200,
        },
        learnedSkills: draft.learnedSkills || [],
      }

      this.characters.push(character)
      this.persist()
      return character
    },
    updateCharacter(id: string, updates: Partial<Character>): boolean {
      const index = this.characters.findIndex((c) => c.id === id)
      if (index === -1) return false

      this.characters[index] = {
        ...this.characters[index],
        ...updates,
        updatedAt: Date.now(),
      }
      this.persist()
      return true
    },
    deleteCharacter(id: string): boolean {
      const index = this.characters.findIndex((c) => c.id === id)
      if (index === -1) return false

      this.characters.splice(index, 1)
      if (this.activeCharacterId === id) {
        this.activeCharacterId = null
        saveActiveCharacterId(null)
      }
      this.persist()
      return true
    },
    setActiveCharacter(id: string | null): boolean {
      if (id === null) {
        this.activeCharacterId = null
        saveActiveCharacterId(null)
        return true
      }

      const exists = this.characters.some((c) => c.id === id)
      if (!exists) return false

      this.activeCharacterId = id
      saveActiveCharacterId(id)
      return true
    },
    getCharacterById(id: string): Character | null {
      return this.characters.find((c) => c.id === id) || null
    },
    persist(): boolean {
      const storage: StorageData = {
        version: CURRENT_VERSION,
        characters: this.characters,
        activeCharacterId: this.activeCharacterId,
      }
      return saveStorage(storage)
    },
  },
})
