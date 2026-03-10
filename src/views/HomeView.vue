<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharactersStore } from '@/stores/characters'

const router = useRouter()
const charactersStore = useCharactersStore()

onMounted(() => {
  charactersStore.loadFromStorage()
  if (charactersStore.characterCount === 0) {
    router.replace('/create-character')
  } else {
    router.replace('/characters')
  }
})
</script>

<template>
  <main>
    <p>Ladataan...</p>
  </main>
</template>
