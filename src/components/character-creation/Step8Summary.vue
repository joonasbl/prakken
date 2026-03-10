<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import type { SkillBaseCode } from '@/types/skills'

const emit = defineEmits<{
  save: []
}>()

const wizardStore = useCharacterCreationStore()

const baseCodeToAttributeName: Record<SkillBaseCode, string | null> = {
  voi: 'Voima',
  val: 'Valppaus',
  kar: 'Karisma',
  ket: 'Ketteryys',
  sis: 'Sisukkuus',
  ei: null,
  erikois: null,
}

const skillsWithLevels = computed(() =>
  wizardStore.draft.skills
    .filter((skill) => skill.learned)
    .map((skill) => {
      const attributeName = baseCodeToAttributeName[skill.baseCode]
      const attribute =
        attributeName != null
          ? wizardStore.draft.attributes.find((attr) => attr.name === attributeName)
          : undefined

      const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6
      const level = baseLevel + skill.bonus

      return { ...skill, level, baseLabel: attributeName }
    }),
)

const totalEquipmentWeight = computed(() =>
  wizardStore.draft.equipment.reduce((sum, e) => sum + e.weight, 0)
)

const handleSave = () => {
  emit('save')
}
</script>

<template>
  <div class="summary-step">
    <div class="summary-section">
      <h3>Hahmon nimi</h3>
      <p class="character-name">{{ wizardStore.draft.name }}</p>
    </div>

    <div class="summary-section">
      <h3>Ominaisuudet</h3>
      <div class="attributes-list">
        <div
          v-for="attr in wizardStore.draft.attributes"
          :key="attr.name"
          class="attr-item"
        >
          <span>{{ attr.name }}</span>
          <span class="attr-value">{{ attr.value }}</span>
        </div>
      </div>
    </div>

    <div class="summary-section">
      <h3>Tausta</h3>
      <p class="background-name">{{ wizardStore.draft.background?.name || 'Ei valittu' }}</p>
      <p class="description">{{ wizardStore.draft.background?.description }}</p>
    </div>

    <div class="summary-section" v-if="wizardStore.draft.advantages.length > 0">
      <h3>Edut</h3>
      <ul class="list">
        <li v-for="adv in wizardStore.draft.advantages" :key="adv.id">
          {{ adv.name }}
        </li>
      </ul>
    </div>

    <div class="summary-section" v-if="wizardStore.draft.disadvantages.length > 0">
      <h3>Haitat</h3>
      <ul class="list">
        <li v-for="dis in wizardStore.draft.disadvantages" :key="dis.id">
          {{ dis.name }}
        </li>
      </ul>
    </div>

    <div class="summary-section" v-if="wizardStore.draft.subStats">
      <h3>Johdannaiset</h3>
      <div class="substats-grid">
        <div class="substat-item">
          <span>Veripisteet</span>
          <span>{{ wizardStore.draft.subStats.veripisteet }}</span>
        </div>
        <div class="substat-item">
          <span>Vauriobonus</span>
          <span>{{ wizardStore.draft.subStats.vauriobonus }}</span>
        </div>
        <div class="substat-item">
          <span>Syvä haava</span>
          <span>{{ wizardStore.draft.subStats.syvaHaava }}</span>
        </div>
        <div class="substat-item">
          <span>Kantokyky</span>
          <span>{{ wizardStore.draft.subStats.kantokyky }}</span>
        </div>
      </div>
    </div>

    <div class="summary-section" v-if="skillsWithLevels.length > 0">
      <h3>Taidot ({{ skillsWithLevels.length }} opittu)</h3>
      <div class="skills-list">
        <div
          v-for="skill in skillsWithLevels"
          :key="skill.name"
          class="skill-item"
        >
          <span>{{ skill.name }}</span>
          <span class="skill-level">{{ skill.level }}</span>
        </div>
      </div>
    </div>

    <div class="summary-section" v-if="wizardStore.draft.equipment.length > 0">
      <h3>Varusteet ({{ wizardStore.draft.equipment.length }} kpl, {{ totalEquipmentWeight }} kg)</h3>
      <ul class="list">
        <li v-for="item in wizardStore.draft.equipment" :key="item.id">
          {{ item.name }}
        </li>
      </ul>
    </div>

    <div class="save-actions">
      <button type="button" class="save-button" @click="handleSave">
        Tallenna hahmo
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

.summary-step {
  padding: 1rem 0;
}

.summary-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #bdc3c7;
}

.summary-section:last-child {
  border-bottom: none;
}

.summary-section h3 {
  font-family: 'MedievalSharp', cursive;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0d1216;
  margin-bottom: 0.75rem;
  letter-spacing: 1px;
}

.character-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a252f;
}

.background-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a252f;
  margin-bottom: 0.5rem;
}

.description {
  color: #34495e;
  font-size: 0.9rem;
}

.attributes-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.attr-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: #d5dbdb;
  border-radius: 4px;
}

.attr-item span:first-child {
  font-weight: 600;
  color: #1a252f;
}

.attr-value {
  font-weight: 700;
  color: #1a252f;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list li {
  padding: 0.25rem 0;
  font-weight: 600;
  color: #1a252f;
}

.substats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.substat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: #d5dbdb;
  border-radius: 4px;
}

.substat-item span:first-child {
  color: #1a252f;
  font-weight: 600;
}

.substat-item span:last-child {
  font-weight: 700;
  color: #1a252f;
}

.skills-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: #d5dbdb;
  border-radius: 4px;
}

.skill-item span:first-child {
  color: #1a252f;
  font-weight: 600;
}

.skill-level {
  font-weight: 700;
  color: #1a252f;
}

.save-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.save-button {
  padding: 1rem 2.5rem;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-button:hover {
  background-color: #229954;
}
</style>
