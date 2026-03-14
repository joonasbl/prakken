<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header>
    <div class="header-content">
      <!-- Logo and Hamburger on same row -->
      <div class="container header-row">
        <h1 class="title is-1">
          <span class="icon animate-float"><i class="fas fa-bolt"></i></span>
          <span class="text-gradient">PRAKKEN</span>
          <span class="icon animate-float"><i class="fas fa-bolt"></i></span>
        </h1>
        
        <!-- Mobile Nav Toggle (visible only on mobile) -->
        <button 
          type="button" 
          class="mobile-nav-toggle show-mobile-only" 
          @click="toggleMobileMenu"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Toggle navigation"
        >
          <span class="icon">
            <i :class="isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
          </span>
        </button>
      </div>
    </div>

    <!-- Desktop Nav (hidden on mobile) -->
    <nav class="navbar hide-mobile">
      <div class="container">
        <div class="navbar-menu is-active">
          <div class="navbar-end has-text-centered">
            <RouterLink to="/characters" class="navbar-item" @click="closeMobileMenu">
              <span class="icon"><i class="fas fa-users"></i></span>
              <span>Hahmot</span>
            </RouterLink>
            <RouterLink to="/create-character" class="navbar-item" @click="closeMobileMenu">
              <span class="icon"><i class="fas fa-user-plus"></i></span>
              <span>Luo uusi</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Nav Menu -->
    <nav class="navbar mobile-navbar" :class="{ 'is-active': isMobileMenuOpen }">
      <div class="container">
        <div class="navbar-menu">
          <div class="navbar-end has-text-centered">
            <RouterLink to="/characters" class="navbar-item" @click="closeMobileMenu">
              <span class="icon"><i class="fas fa-users"></i></span>
              <span>Hahmot</span>
            </RouterLink>
            <RouterLink to="/create-character" class="navbar-item" @click="closeMobileMenu">
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
@import '@/assets/fantasy-theme.css';

.main-content {
  min-height: calc(100vh - 200px);
}

/* Header Layout */
.header-content {
  background: var(--color-bg-secondary);
  border-bottom: 2px solid var(--border-gold);
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  gap: var(--space-md);
}

.header-row h1 {
  margin: 0;
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  line-height: 1.4;
}

.header-row h1 .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.header-row h1 .text-gradient {
  display: inline-block;
}

/* Mobile Navigation Styles */
.mobile-navbar {
  display: none;
  background: var(--color-bg-secondary) !important;
  border-bottom: 2px solid var(--border-gold);
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.mobile-navbar.is-active {
  display: block;
  max-height: 300px;
}

.mobile-navbar .navbar-item {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .header-row {
    padding: var(--space-sm) var(--space-md);
  }

  .header-row h1 {
    font-size: var(--font-size-xl);
    text-align: left;
  }

  .header-row h1 .icon {
    font-size: 1.2rem;
  }

  .mobile-nav-toggle {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-nav-toggle .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .mobile-nav-toggle i {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    margin: 0;
    padding: 0;
  }

  .main-content {
    min-height: calc(100vh - 140px);
  }
}

/* Desktop - center the logo */
@media (min-width: 768px) {
  .header-row {
    padding: var(--space-lg) var(--space-xl);
  }
  
  .header-row h1 {
    text-align: center;
  }
}
</style>
