<script setup lang="ts">
import { computed } from 'vue'
import type { Character } from '@/types/character'

const props = defineProps<{
  character: Character
}>()

const emit = defineEmits<{
  load: [id: string]
  delete: [id: string]
}>()

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('fi-FI', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(props.character.updatedAt))
})

const getAttribute = (name: string) => {
  return props.character.attributes.find((a) => a.name === name)?.value || 10
}

const handleLoad = () => {
  emit('load', props.character.id)
}

const handleDelete = () => {
  if (confirm(`Haluatko varmasti poistaa hahmon "${props.character.name}"?`)) {
    emit('delete', props.character.id)
  }
}
</script>

<template>
  <div class="character-card">
    <div class="card-header">
      <h3 class="character-name">{{ character.name }}</h3>
      <span class="character-date">{{ formattedDate }}</span>
    </div>

    <div class="attributes-summary">
      <div class="attr-item">
        <span class="attr-label">VOI</span>
        <span class="attr-value">{{ getAttribute('Voima') }}</span>
      </div>
      <div class="attr-item">
        <span class="attr-label">TER</span>
        <span class="attr-value">{{ getAttribute('Terveys') }}</span>
      </div>
      <div class="attr-item">
        <span class="attr-label">KET</span>
        <span class="attr-value">{{ getAttribute('Ketteryys') }}</span>
      </div>
      <div class="attr-item">
        <span class="attr-label">VAL</span>
        <span class="attr-value">{{ getAttribute('Valppaus') }}</span>
      </div>
      <div class="attr-item">
        <span class="attr-label">SIS</span>
        <span class="attr-value">{{ getAttribute('Sisukkuus') }}</span>
      </div>
      <div class="attr-item">
        <span class="attr-label">KAR</span>
        <span class="attr-value">{{ getAttribute('Karisma') }}</span>
      </div>
    </div>

    <div class="card-details">
      <div class="detail-row">
        <span>Tausta:</span>
        <strong>{{ character.background?.name || 'Ei valittu' }}</strong>
      </div>
      <div class="detail-row">
        <span>Veripisteet:</span>
        <strong>{{ character.subStats.veripisteet }}</strong>
      </div>
      <div class="detail-row">
        <span>Taitoja:</span>
        <strong>{{ character.skills.filter((s) => s.bonus > 0).length }}</strong>
      </div>
    </div>

    <div class="card-actions">
      <button type="button" class="btn-load" @click="handleLoad">
        Lataa
      </button>
      <button type="button" class="btn-delete" @click="handleDelete">
        Poista
      </button>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.character-card {
  background: var(--gradient-card);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.character-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
  opacity: 0.5;
}

.character-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  border-color: var(--border-gold);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.character-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-gold-primary);
  margin: 0;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.character-date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.attributes-summary {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.attr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.attr-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-heading);
}

.attr-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-magic-blue);
  text-shadow: 0 0 8px rgba(74, 144, 217, 0.4);
}

.card-details {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

.detail-row span {
  color: var(--color-text-secondary);
}

.detail-row strong {
  color: var(--color-text-primary);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-load,
.btn-delete {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.btn-load {
  background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3);
}

.btn-load:hover {
  background: linear-gradient(135deg, #5a9fe9 0%, #4589c9 100%);
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.5);
  transform: translateY(-1px);
}

.btn-delete {
  background: var(--color-bg-tertiary);
  color: var(--color-danger);
  border: 1px solid var(--border-color);
}

.btn-delete:hover {
  background: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
  box-shadow: 0 4px 16px rgba(218, 54, 51, 0.4);
}
</style>
