<script setup lang="ts">
import { useCharacterCreationStore } from '@/stores/characterCreation'

const wizardStore = useCharacterCreationStore()

const updateName = (event: Event) => {
  const target = event.target as HTMLInputElement
  wizardStore.setName(target.value)
}
</script>

<template>
  <div class="name-step">
    <div class="form-group">
      <label for="character-name">Hahmon nimi</label>
      <input id="character-name" type="text" class="name-input" placeholder="Syötä hahmon nimi..."
        :value="wizardStore.draft.name" @input="updateName" autofocus />
    </div>

    <div class="details-section">
      <h3>Hahmon tiedot</h3>
      <div class="info-grid">
        <div class="info-card">
          <span class="info-label">Tausta</span>
          <span class="info-value">{{ wizardStore.draft.background?.name || 'Ei valittu' }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Edut</span>
          <span class="info-value">{{ wizardStore.draft.advantages.length }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Haitat</span>
          <span class="info-value">{{ wizardStore.draft.disadvantages.length }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Varusteet</span>
          <span class="info-value">{{ wizardStore.draft.equipment.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.name-step {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--color-gold-primary);
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.name-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.2rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  transition: all 0.3s ease;
}

.name-input:focus {
  outline: none;
  border-color: var(--color-magic-blue);
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.2);
}

.name-input::placeholder {
  color: var(--color-text-muted);
}

.details-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.info-card {
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  text-align: center;
  transition: all 0.3s ease;
}

.info-card:hover {
  border-color: var(--border-gold);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.info-label {
  display: block;
  font-size: 0.85rem;
  color: #b8c5d6;
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.info-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-magic-blue);
  text-shadow: 0 0 8px rgba(74, 144, 217, 0.4);
}

.name-input::placeholder {
  color: #8a9bb0;
}
</style>
