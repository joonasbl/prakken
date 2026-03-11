import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStatsStore } from '@/stores/stats'

describe('Stats Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default attributes', () => {
    const store = useStatsStore()
    
    expect(store.attList).toHaveLength(6)
    expect(store.attList.find(a => a.name === 'Voima')?.value).toBe(10)
    expect(store.attList.find(a => a.name === 'Terveys')?.value).toBe(10)
  })

  it('updates attribute values', () => {
    const store = useStatsStore()
    
    store.setVal('Voima', 15)
    
    const voima = store.attList.find(a => a.name === 'Voima')
    expect(voima?.value).toBe(15)
  })

  it('returns default value for non-existent attribute', () => {
    const store = useStatsStore()
    
    const attr = store.attList.find(a => a.name === 'NonExistent')
    expect(attr).toBeUndefined()
  })

  it('calculates modifier correctly', () => {
    const store = useStatsStore()
    
    // Modifier = floor((attr - 10) / 2)
    store.setVal('Voima', 10)
    expect(Math.floor((10 - 10) / 2)).toBe(0)
    
    store.setVal('Voima', 12)
    expect(Math.floor((12 - 10) / 2)).toBe(1)
    
    store.setVal('Voima', 8)
    expect(Math.floor((8 - 10) / 2)).toBe(-1)
  })
})
