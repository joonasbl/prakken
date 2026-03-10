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
  color: #2c3e50;
  margin: 0;
}

.btn-new,
.btn-create {
  padding: 0.75rem 1.5rem;
  background-color: #27ae60;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-new:hover,
.btn-create:hover {
  background-color: #229954;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.empty-state p {
  font-size: 1.2rem;
  color: #7f8c8d;
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
