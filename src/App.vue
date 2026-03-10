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
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped></style>
