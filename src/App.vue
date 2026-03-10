<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <hero class="container">
      <div class="container has-text-centered">
        <h1 class="is-size-1 has-text-primary"><i class="fa-solid fa-bolt"></i> PRAKKEN <i class="fa-solid fa-bolt"></i>
        </h1>
      </div>
    </hero>
    <nav class="nav">
      <RouterLink to="/" class="nav-link">Hahmo</RouterLink>
      <RouterLink to="/characters" class="nav-link">Hahmot</RouterLink>
      <RouterLink to="/create-character" class="nav-link nav-primary">Luo uusi</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.nav-link {
  padding: 0.5rem 1rem;
  color: #2c3e50;
  text-decoration: none;
  font-weight: 600;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #e0e0e0;
}

.nav-link.router-link-active {
  background-color: #3498db;
  color: white;
}

.nav-primary {
  background-color: #27ae60;
  color: white;
}

.nav-primary:hover {
  background-color: #229954;
}
</style>
