import { defineStore } from 'pinia'
import type { ShoppingItem, ShoppingItemDraft, ShoppingCategory } from '@/types/shopping'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useShoppingStore = defineStore('shopping', {
  state: (): {
    items: ShoppingItem[]
    categories: ShoppingCategory[]
    loading: boolean
    error: string | null
  } => {
    return {
      items: [],
      categories: [],
      loading: false,
      error: null,
    }
  },
  getters: {
    itemCount: (state) => state.items.length,
    categoryCount: (state) => state.categories.length,
    availableItems: (state) => state.items.filter((item) => item.isAvailable),
    itemsByCategory: (state) => (categoryId: string) =>
      state.items.filter((item) => item.categoryId === categoryId),
    availableItemsByCategory: (state) => (categoryId: string) =>
      state.items.filter((item) => item.categoryId === categoryId && item.isAvailable),
    getCategoryById: (state) => (id: string) =>
      state.categories.find((c) => c.id === id) || null,
    itemsSorted: (state) =>
      [...state.items].sort((a, b) => String(a.name).localeCompare(String(b.name))),
    getItemById: (state) => (id: string) =>
      state.items.find((i) => String(i.id) === id) || null,
  },
  actions: {
    // ===== Fetch Data =====
    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`${API_BASE}/shopping/categories`)
        if (!res.ok) throw new Error('Failed to fetch categories')
        this.categories = await res.json()
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
      } finally {
        this.loading = false
      }
    },

    async fetchItems(availableOnly = false) {
      this.loading = true
      this.error = null
      try {
        const url = availableOnly 
          ? `${API_BASE}/shopping/items?available=true`
          : `${API_BASE}/shopping/items`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch items')
        this.items = await res.json()
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
      } finally {
        this.loading = false
      }
    },

    async fetchAll() {
      await Promise.all([this.fetchCategories(), this.fetchItems()])
    },

    // ===== Categories =====
    async addCategory(name: string, description: string): Promise<ShoppingCategory | null> {
      try {
        const res = await fetch(`${API_BASE}/shopping/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        })
        if (!res.ok) throw new Error('Failed to add category')
        const category = await res.json()
        this.categories.push(category)
        return category
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return null
      }
    },

    async deleteCategory(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/shopping/categories/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete category')
        this.categories = this.categories.filter((c) => c.id !== id)
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return false
      }
    },

    // ===== Items =====
    async addItem(draft: ShoppingItemDraft): Promise<ShoppingItem | null> {
      try {
        const res = await fetch(`${API_BASE}/shopping/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        })
        if (!res.ok) throw new Error('Failed to add item')
        const item = await res.json()
        this.items.push(item)
        return item
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return null
      }
    },

    async updateItem(id: string, updates: Partial<ShoppingItem>): Promise<boolean> {
      try {
        const item = this.items.find((i) => i.id.toString() === id)
        if (!item) return false

        const updatedItem = { ...item, ...updates }
        const res = await fetch(`${API_BASE}/shopping/items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        })
        if (!res.ok) throw new Error('Failed to update item')
        
        const result = await res.json()
        const index = this.items.findIndex((i) => i.id.toString() === id)
        if (index !== -1) {
          this.items[index] = result
        }
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return false
      }
    },

    async deleteItem(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/shopping/items/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete item')
        this.items = this.items.filter((i) => i.id.toString() !== id)
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return false
      }
    },

    // ===== Rolling =====
    async rerollItemPrice(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/shopping/items/${id}/reroll-price`, {
          method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to reroll price')
        const result = await res.json()
        
        const item = this.items.find((i) => String(i.id) === id)
        if (item) {
          item.currentPrice = result.currentPrice
          item.lastRolledAt = result.lastRolledAt
        }
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return false
      }
    },

    async rerollItemAvailability(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/shopping/items/${id}/reroll-availability`, {
          method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to reroll availability')
        const result = await res.json()
        
        const item = this.items.find((i) => String(i.id) === id)
        if (item) {
          item.isAvailable = result.isAvailable
          item.lastRolledAt = result.lastRolledAt
        }
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return false
      }
    },

    async rerollItemBoth(id: string): Promise<boolean> {
      await this.rerollItemPrice(id)
      await this.rerollItemAvailability(id)
      return true
    },

    async rerollAll(): Promise<number> {
      try {
        const res = await fetch(`${API_BASE}/shopping/reroll-all`, {
          method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to reroll all')
        const result = await res.json()
        
        // Refresh items from server
        await this.fetchItems()
        return result.count
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return 0
      }
    },

    // ===== Manual Updates =====
    async updateItemPrice(id: string, price: number): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/shopping/items/${id}/price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price }),
        })
        if (!res.ok) throw new Error('Failed to update price')
        const result = await res.json()

        const item = this.items.find((i) => String(i.id) === id)
        if (item) {
          item.currentPrice = result.currentPrice
          item.lastRolledAt = result.lastRolledAt
        }
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return false
      }
    },

    async toggleItemAvailability(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/shopping/items/${id}/toggle-availability`, {
          method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to toggle availability')
        const result = await res.json()

        const item = this.items.find((i) => String(i.id) === id)
        if (item) {
          item.isAvailable = result.isAvailable
          item.lastRolledAt = result.lastRolledAt
        }
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
        return false
      }
    },

    // ===== Bulk Operations =====
    async rerollAllPrices(): Promise<number> {
      // Backend doesn't have separate price reroll, use reroll-all and restore availability
      const oldAvailability = new Map(this.items.map(i => [String(i.id), i.isAvailable]))
      await this.rerollAll()
      
      // Restore old availability
      for (const item of this.items) {
        const oldAvail = oldAvailability.get(String(item.id))
        if (oldAvail !== undefined && oldAvail !== item.isAvailable) {
          await this.toggleItemAvailability(String(item.id))
        }
      }
      return this.items.length
    },

    async rerollAllAvailability(): Promise<number> {
      // Backend doesn't have separate availability reroll, use reroll-all and restore prices
      const oldPrices = new Map(this.items.map(i => [String(i.id), i.currentPrice]))
      await this.rerollAll()
      
      // Restore old prices
      for (const item of this.items) {
        const oldPrice = oldPrices.get(String(item.id))
        if (oldPrice !== undefined && oldPrice !== item.currentPrice) {
          await this.updateItemPrice(String(item.id), oldPrice)
        }
      }
      return this.items.length
    },

    // ===== Legacy Compatibility =====
    loadFromStorage() {
      // No-op for API-based store
      this.fetchAll()
    },

    persistItems(): boolean {
      return true
    },

    persistCategories(): boolean {
      return true
    },
  },
})
