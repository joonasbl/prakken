<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'

const wizardStore = useCharacterCreationStore()

const updateName = (event: Event) => {
  const target = event.target as HTMLInputElement
  wizardStore.setName(target.value)
}

const nameLength = computed(() => wizardStore.draft.name.length)
const isNameTooLong = computed(() => nameLength.value > 50)
const isNameEmpty = computed(() => wizardStore.draft.name.trim().length === 0)
</script>

<template>
  <div class="name-step">
    <div class="form-group">
      <label for="character-name">Hahmon nimi</label>
      <input 
        id="character-name" 
        type="text" 
        class="name-input" 
        :class="{ 'is-error': isNameTooLong, 'is-warning': isNameEmpty }"
        placeholder="Syötä hahmon nimi..."
        :value="wizardStore.draft.name" 
        @input="updateName" 
        autofocus 
        maxlength="50"
        aria-describedby="name-help"
        :aria-invalid="isNameTooLong ? 'true' : 'false'"
      />
      <div id="name-help" class="field-help">
        <span v-if="isNameTooLong" class="error-text">Nimi on liian pitkä (max 50 merkkiä)</span>
        <span v-else-if="isNameEmpty" class="warning-text">Hahmon nimi on pakollinen</span>
        <span v-else class="char-count">{{ nameLength }}/50</span>
      </div>
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
  font-size: 0.95rem;
}

@media (min-width: 768px) {
  .form-group label {
    font-size: 1rem;
  }
}

.name-input {
  width: 100%;
  padding: 0.75rem 1rem;
  min-height: 44px;
  font-size: 1.1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .name-input {
    font-size: 1.2rem;
  }
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
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

@media (min-width: 768px) {
  .details-section h3 {
    font-size: 1.2rem;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 576px) {
  .info-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}

.info-card {
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  text-align: center;
  transition: all 0.3s ease;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-card:hover {
  border-color: var(--border-gold);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.info-label {
  display: block;
  font-size: 0.75rem;
  color: #b8c5d6;
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

@media (min-width: 768px) {
  .info-label {
    font-size: 0.85rem;
  }
}

.info-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-magic-blue);
  text-shadow: 0 0 8px rgba(74, 144, 217, 0.4);
}

@media (min-width: 768px) {
  .info-value {
    font-size: 1.2rem;
  }
}

.name-input::placeholder {
  color: #8a9bb0;
}

/* Form validation styles */
.field-help {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  min-height: 1.25rem;
}

.char-count {
  color: var(--color-text-muted);
  font-family: var(--font-heading);
  letter-spacing: 0.03em;
}

.error-text {
  color: var(--color-danger);
  font-weight: 600;
}

.warning-text {
  color: var(--color-warning);
  font-weight: 600;
}

.name-input.is-error {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(218, 54, 51, 0.15);
}

.name-input.is-warning {
  border-color: var(--color-warning);
  box-shadow: 0 0 0 3px rgba(210, 153, 34, 0.15);
}
</style>
