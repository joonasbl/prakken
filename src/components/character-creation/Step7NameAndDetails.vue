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
      <input
        id="character-name"
        type="text"
        class="name-input"
        placeholder="Syötä hahmon nimi..."
        :value="wizardStore.draft.name"
        @input="updateName"
        autofocus
      />
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
.name-step {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.name-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.2rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.name-input:focus {
  outline: none;
  border-color: #3498db;
}

.details-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.info-card {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.info-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.info-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}
</style>
