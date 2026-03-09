<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import StatsPage from './components/StatsPage.vue';



</script>

<template>
  <header>
    <hero class="container">
      <div class="container has-text-centered">
        <h1 class="is-size-1 has-text-primary"><i class="fa-solid fa-bolt"></i> PRAKKEN <i class="fa-solid fa-bolt"></i>
        </h1>
      </div>
    </hero>

  </header>

  <main>
    <StatsPage />
  </main>


</template>

<style scoped></style>
