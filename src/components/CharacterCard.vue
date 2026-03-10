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
.character-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.character-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.character-date {
  font-size: 0.8rem;
  color: #95a5a6;
}

.attributes-summary {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.attr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.attr-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
}

.attr-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #3498db;
}

.card-details {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

.detail-row strong {
  color: #2c3e50;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-load,
.btn-delete {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-load {
  background-color: #3498db;
  color: white;
}

.btn-load:hover {
  background-color: #2980b9;
}

.btn-delete {
  background-color: #ecf0f1;
  color: #e74c3c;
}

.btn-delete:hover {
  background-color: #e74c3c;
  color: white;
}
</style>
