import type { Character } from '@/types/character'

const STORAGE_KEY_CHARACTERS = 'prakken_characters'
const STORAGE_KEY_ACTIVE_ID = 'prakken_active_id'
const STORAGE_VERSION = '1.0.0'

export interface StorageData {
  version: string
  characters: Character[]
  activeCharacterId: string | null
}

export const loadStorage = (): StorageData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CHARACTERS)
    if (!data) {
      return { version: STORAGE_VERSION, characters: [], activeCharacterId: null }
    }
    const parsed = JSON.parse(data) as StorageData
    return parsed
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return { version: STORAGE_VERSION, characters: [], activeCharacterId: null }
  }
}

export const saveStorage = (data: StorageData): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
    return false
  }
}

export const loadActiveCharacterId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID)
  } catch (error) {
    console.error('Failed to load active character ID:', error)
    return null
  }
}

export const saveActiveCharacterId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id)
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID)
    }
  } catch (error) {
    console.error('Failed to save active character ID:', error)
  }
}

export const getStorageQuota = async (): Promise<{ used: number; total: number } | null> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage || 0,
        total: estimate.quota || 0,
      }
    } catch {
      return null
    }
  }
  return null
}
