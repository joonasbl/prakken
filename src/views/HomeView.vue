<script setup lang="ts">
import StatsPage from '@/components/StatsPage.vue'
</script>

<template>
  <main>
    <StatsPage />
    <div class="character-creation-link">
      <RouterLink to="/create-character" class="create-character-btn">
        Luo uusi hahmo
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.character-creation-link {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.create-character-btn {
  padding: 1rem 2rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.create-character-btn:hover {
  background-color: #2980b9;
}
</style>
