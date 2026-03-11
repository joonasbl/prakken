<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="container has-text-centered py-4">
      <h1 class="title is-1 has-text-primary">
        <span class="icon"><i class="fas fa-bolt"></i></span>
        PRAKKEN
        <span class="icon"><i class="fas fa-bolt"></i></span>
      </h1>
    </div>
    <nav class="navbar has-background-light">
      <div class="container">
        <div class="navbar-menu is-active">
          <div class="navbar-end has-text-centered">
            <RouterLink to="/characters" class="navbar-item">
              <span class="icon"><i class="fas fa-users"></i></span>
              <span>Hahmot</span>
            </RouterLink>
            <RouterLink to="/create-character" class="navbar-item">
              <span class="icon"><i class="fas fa-user-plus"></i></span>
              <span>Luo uusi</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <main class="main-content">
    <RouterView />
  </main>
</template>

<style scoped>
.main-content {
  min-height: calc(100vh - 200px);
}

.navbar-item.router-link-active {
  background-color: #3498db !important;
  color: white !important;
}
</style>
