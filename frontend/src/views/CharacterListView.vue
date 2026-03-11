<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharactersStore } from '@/stores/characters'
import CharacterCard from '@/components/CharacterCard.vue'

const router = useRouter()
const charactersStore = useCharactersStore()

const characters = computed(() => charactersStore.charactersSorted)

onMounted(() => {
  charactersStore.loadFromStorage()
})

const handleLoad = (id: string) => {
  charactersStore.setActiveCharacter(id)
  router.push(`/character/${id}`)
}

const handleDelete = (id: string) => {
  charactersStore.deleteCharacter(id)
}
</script>

<template>
  <div class="character-list-view">
    <div class="view-header">
      <h1>Hahmot</h1>
      <RouterLink to="/create-character" class="btn-new">
        Luo uusi hahmo
      </RouterLink>
    </div>

    <div v-if="characters.length === 0" class="empty-state">
      <p>Ei tallennettuja hahmoja.</p>
      <RouterLink to="/create-character" class="btn-create">
        Luo ensimmäinen hahmo
      </RouterLink>
    </div>

    <div v-else class="characters-grid">
      <CharacterCard
        v-for="character in characters"
        :key="character.id"
        :character="character"
        @load="handleLoad"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.character-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.view-header h1 {
  font-size: 2rem;
  color: var(--color-gold-primary);
  margin: 0;
  font-family: var(--font-heading);
  letter-spacing: 0.08em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.btn-new,
.btn-create {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2ea043 0%, #248a38 100%);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(46, 160, 67, 0.3);
}

.btn-new:hover,
.btn-create:hover {
  background: linear-gradient(135deg, #3eb053 0%, #2e9a48 100%);
  box-shadow: 0 4px 16px rgba(46, 160, 67, 0.5);
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.empty-state::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.btn-create {
  display: inline-block;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
</style>
