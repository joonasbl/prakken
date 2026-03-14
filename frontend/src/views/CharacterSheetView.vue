<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCharactersStore } from '@/stores/characters'
import { useSkillsStore } from '@/stores/skills'
import { calculateSkillsWithLevels, calculateUnlearnedSkills } from '@/utils/skills'

const router = useRouter()
const route = useRoute()
const charactersStore = useCharactersStore()
const skillsStore = useSkillsStore()

// Collapsible sections state
const expandedSections = ref<Record<string, boolean>>({
  attributes: true,
  substats: true,
  background: true,
  advantages: true,
  disadvantages: true,
  skills: true,
  unlearnedSkills: false,
  equipment: true,
})

const toggleSection = (section: string) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const character = computed(() => {
  const id = route.params.id as string
  return charactersStore.getCharacterById(id)
})

const skillsWithLevels = computed(() => {
  if (!character.value) return []
  return calculateSkillsWithLevels(
    character.value.learnedSkills,
    skillsStore.skillList,
    character.value.attributes,
    character.value.background
  )
})

const unlearnedSkills = computed(() => {
  if (!character.value) return []
  return calculateUnlearnedSkills(
    character.value.learnedSkills,
    skillsStore.skillList,
    character.value.attributes
  )
})

const getAttribute = (name: string) => {
  return character.value?.attributes.find((a) => a.name === name)?.value || 10
}

const handleBack = () => {
  router.push('/characters')
}

onMounted(() => {
  charactersStore.loadFromStorage()
})
</script>

<template>
  <div v-if="character" class="character-sheet">
    <div class="sheet-header">
      <button type="button" class="btn-back" @click="handleBack" aria-label="Palaa hahmolistaan">
        <span class="icon" aria-hidden="true"><i class="fas fa-arrow-left"></i></span>
        <span class="hide-mobile">Takaisin</span>
      </button>
      <h1>{{ character.name }}</h1>
    </div>

    <div class="sheet-content">
      <!-- Attributes Section -->
      <div class="section attributes-section">
        <button class="section-header" @click="toggleSection('attributes')" :aria-expanded="expandedSections.attributes" aria-controls="attributes-content">
          <h2>Ominaisuudet</h2>
          <span class="section-toggle" aria-hidden="true">
            <i :class="expandedSections.attributes ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
          </span>
        </button>
        <div v-show="expandedSections.attributes" id="attributes-content" class="attributes-grid">
          <div class="attr-card">
            <span class="attr-name">Voima</span>
            <span class="attr-value">{{ getAttribute('Voima') }}</span>
          </div>
          <div class="attr-card">
            <span class="attr-name">Terveys</span>
            <span class="attr-value">{{ getAttribute('Terveys') }}</span>
          </div>
          <div class="attr-card">
            <span class="attr-name">Ketteryys</span>
            <span class="attr-value">{{ getAttribute('Ketteryys') }}</span>
          </div>
          <div class="attr-card">
            <span class="attr-name">Valppaus</span>
            <span class="attr-value">{{ getAttribute('Valppaus') }}</span>
          </div>
          <div class="attr-card">
            <span class="attr-name">Sisukkuus</span>
            <span class="attr-value">{{ getAttribute('Sisukkuus') }}</span>
          </div>
          <div class="attr-card">
            <span class="attr-name">Karisma</span>
            <span class="attr-value">{{ getAttribute('Karisma') }}</span>
          </div>
        </div>
      </div>

      <!-- Substats Section -->
      <div class="section substats-section">
        <button class="section-header" @click="toggleSection('substats')" :aria-expanded="expandedSections.substats" aria-controls="substats-content">
          <h2>Aliominaisuudet</h2>
          <span class="section-toggle" aria-hidden="true">
            <i :class="expandedSections.substats ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
          </span>
        </button>
        <div v-show="expandedSections.substats" id="substats-content" class="substats-grid">
          <div class="substat-card">
            <span class="substat-name">Veripisteet</span>
            <span class="substat-value">{{ character.subStats?.veripisteet || 0 }}</span>
          </div>
          <div class="substat-card">
            <span class="substat-name">Vauriobonus</span>
            <span class="substat-value">{{ character.subStats?.vauriobonus || 0 }}</span>
          </div>
          <div class="substat-card">
            <span class="substat-name">Syvä haava</span>
            <span class="substat-value">{{ character.subStats?.syvaHaava || 0 }}</span>
          </div>
          <div class="substat-card">
            <span class="substat-name">Kantokyky</span>
            <span class="substat-value">{{ character.subStats?.kantokyky || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Background Section -->
      <div class="section background-section" v-if="character.background">
        <button class="section-header" @click="toggleSection('background')" :aria-expanded="expandedSections.background" aria-controls="background-content">
          <h2>Tausta</h2>
          <span class="section-toggle" aria-hidden="true">
            <i :class="expandedSections.background ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
          </span>
        </button>
        <div v-show="expandedSections.background" id="background-content" class="background-content">
          <p class="background-name">{{ character.background.name }}</p>
          <p class="background-desc">{{ character.background.description }}</p>
        </div>
      </div>

      <!-- Advantages Section -->
      <div class="section advantages-section" v-if="character.advantages.length > 0">
        <button class="section-header" @click="toggleSection('advantages')" :aria-expanded="expandedSections.advantages" aria-controls="advantages-content">
          <h2>Edut</h2>
          <span class="section-toggle" aria-hidden="true">
            <i :class="expandedSections.advantages ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
          </span>
        </button>
        <div v-show="expandedSections.advantages" id="advantages-content" class="trait-list">
          <li v-for="adv in character.advantages" :key="adv.id">
            <strong>{{ adv.name }}</strong>
            <span>{{ adv.description }}</span>
          </li>
        </div>
      </div>

      <!-- Disadvantages Section -->
      <div class="section disadvantages-section" v-if="character.disadvantages.length > 0">
        <button class="section-header" @click="toggleSection('disadvantages')" :aria-expanded="expandedSections.disadvantages" aria-controls="disadvantages-content">
          <h2>Haitat</h2>
          <span class="section-toggle" aria-hidden="true">
            <i :class="expandedSections.disadvantages ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
          </span>
        </button>
        <div v-show="expandedSections.disadvantages" id="disadvantages-content" class="trait-list">
          <li v-for="dis in character.disadvantages" :key="dis.id">
            <strong>{{ dis.name }}</strong>
            <span>{{ dis.description }}</span>
          </li>
        </div>
      </div>

      <!-- Skills Section -->
      <div class="section skills-section" v-if="skillsWithLevels.length > 0">
        <button class="section-header" @click="toggleSection('skills')" :aria-expanded="expandedSections.skills" aria-controls="skills-content">
          <h2>Taidot</h2>
          <span class="section-toggle" aria-hidden="true">
            <i :class="expandedSections.skills ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
          </span>
        </button>
        <div v-show="expandedSections.skills" id="skills-content" class="skills-grid">
          <div v-for="skill in skillsWithLevels" :key="skill.name" class="skill-item">
            <div class="skill-name">
              {{ skill.name }}
              <span v-if="skill.baseLabel" class="skill-base">({{ skill.baseLabel }})</span>
            </div>
            <span class="skill-level">{{ skill.level }}</span>
          </div>
        </div>
      </div>

      <!-- Unlearned Skills Section -->
      <div class="section unlearned-skills-section" v-if="unlearnedSkills.length > 0">
        <button class="section-header" @click="toggleSection('unlearnedSkills')" :aria-expanded="expandedSections.unlearnedSkills" aria-controls="unlearned-skills-content">
          <h2>Oppimattomat taidot</h2>
          <span class="section-toggle" aria-hidden="true">
            <i :class="expandedSections.unlearnedSkills ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
          </span>
        </button>
        <div v-show="expandedSections.unlearnedSkills" id="unlearned-skills-content" class="skills-grid">
          <div v-for="skill in unlearnedSkills" :key="skill.name" class="skill-item unlearned">
            <div class="skill-name">
              {{ skill.name }}
              <span v-if="skill.baseLabel" class="skill-base">({{ skill.baseLabel }})</span>
            </div>
            <span class="skill-level">{{ skill.level }}</span>
          </div>
        </div>
      </div>

      <!-- Equipment Section -->
      <div class="section equipment-section" v-if="character.equipment.length > 0">
        <button class="section-header" @click="toggleSection('equipment')" :aria-expanded="expandedSections.equipment" aria-controls="equipment-content">
          <h2>Varusteet</h2>
          <span class="section-toggle" aria-hidden="true">
            <i :class="expandedSections.equipment ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
          </span>
        </button>
        <div v-show="expandedSections.equipment" id="equipment-content" class="equipment-list">
          <li v-for="item in character.equipment" :key="item.id">
            {{ item.name }}
          </li>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <h2>Hahmoa ei löydy</h2>
    <RouterLink to="/characters">Palaa hahmolistaan</RouterLink>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.character-sheet {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .character-sheet {
    padding: 2rem;
  }
}

.sheet-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.sheet-header h1 {
  font-size: 1.5rem;
  color: var(--color-gold-primary);
  margin: 0;
  font-family: var(--font-heading);
  letter-spacing: 0.08em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  flex: 1;
  word-break: break-word;
}

@media (min-width: 768px) {
  .sheet-header h1 {
    font-size: 2rem;
  }
}

.btn-back {
  padding: 0.5rem 1rem;
  min-height: 44px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back:hover {
  background: var(--color-bg-hover);
  border-color: var(--border-gold);
  color: var(--color-gold-primary);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.sheet-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section {
  background: var(--gradient-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
  opacity: 0.5;
}

.section-header {
  width: 100%;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.section-header h2 {
  font-size: 1.2rem;
  color: var(--color-gold-primary);
  margin: 0;
  padding: 0;
  border: none;
  font-family: var(--font-heading);
  letter-spacing: 0.08em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  text-align: left;
}

@media (min-width: 768px) {
  .section-header h2 {
    font-size: 1.4rem;
  }
}

.section-toggle {
  color: var(--color-gold-primary);
  font-size: 1rem;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0 1.25rem 1.25rem;
}

@media (min-width: 576px) {
  .attributes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .attributes-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.attr-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.attr-card:hover {
  border-color: var(--border-gold);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
  transform: translateY(-2px);
}

.attr-name {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  text-align: center;
}

.attr-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-magic-blue);
  text-shadow: 0 0 10px rgba(74, 144, 217, 0.5);
}

.substats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0 1.25rem 1.25rem;
}

@media (min-width: 576px) {
  .substats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.substat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.substat-card:hover {
  border-color: var(--border-gold);
  box-shadow: 0 0 15px rgba(46, 160, 67, 0.2);
  transform: translateY(-2px);
}

.substat-name {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  text-align: center;
}

.substat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-success);
  text-shadow: 0 0 10px rgba(46, 160, 67, 0.4);
}

.background-content {
  padding: 0 1.25rem 1.25rem;
}

.background-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-gold-primary);
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
}

.background-desc {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.trait-list,
.equipment-list {
  list-style: none;
  padding: 0 1.25rem 1.25rem;
  margin: 0;
}

.trait-list li,
.equipment-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.trait-list li:last-child,
.equipment-list li:last-child {
  border-bottom: none;
}

.trait-list strong,
.equipment-list strong {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.trait-list span,
.equipment-list span {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0 1.25rem 1.25rem;
}

@media (min-width: 576px) {
  .skills-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

.skill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  gap: 0.5rem;
}

.skill-item:hover {
  border-color: var(--border-gold);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
  transform: translateY(-1px);
}

.skill-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.85rem;
}

.skill-base {
  font-weight: 400;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  display: block;
}

.skill-level {
  font-weight: 700;
  color: var(--color-success);
  font-size: 1.1rem;
  text-shadow: 0 0 8px rgba(46, 160, 67, 0.4);
  min-width: 28px;
  text-align: right;
}

.skill-item.unlearned {
  opacity: 0.6;
  background: var(--color-bg-secondary);
}

.skill-item.unlearned .skill-level {
  color: var(--color-text-muted);
  text-shadow: none;
}

.skill-item.unlearned:hover {
  opacity: 0.8;
  border-color: var(--border-color);
  box-shadow: none;
  transform: none;
}

.equipment-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
  color: var(--color-text-secondary);
}

.not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.not-found h2 {
  color: var(--color-danger);
  margin-bottom: 1rem;
  font-family: var(--font-heading);
}

.not-found a {
  color: var(--color-magic-blue);
}

.not-found a:hover {
  color: var(--color-gold-primary);
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .attr-name {
    font-size: 0.6rem;
  }

  .attr-value {
    font-size: 1.15rem;
  }

  .substat-name {
    font-size: 0.6rem;
  }

  .substat-value {
    font-size: 0.95rem;
  }

  .skill-name {
    font-size: 0.75rem;
  }

  .skill-level {
    font-size: 1rem;
  }

  .skill-base {
    font-size: 0.7rem;
  }

  .section-header {
    padding: 0.75rem 1rem;
  }

  .section-header h2 {
    font-size: 1.05rem;
  }

  .attributes-grid {
    gap: 0.5rem;
    padding: 0 1rem 1rem;
  }

  .attr-card {
    padding: 0.75rem 0.5rem;
  }

  .substats-grid {
    gap: 0.5rem;
    padding: 0 1rem 1rem;
  }

  .substat-card {
    padding: 0.75rem 0.5rem;
  }

  .skills-grid {
    gap: 0.5rem;
    padding: 0 1rem 1rem;
  }

  .skill-item {
    padding: 0.625rem;
  }

  .trait-list,
  .equipment-list {
    padding: 0 1rem 1rem;
  }

  .trait-list li,
  .equipment-list li {
    padding: 0.625rem 0;
  }

  .background-content {
    padding: 0 1rem 1rem;
  }

  .background-name {
    font-size: 1rem;
  }

  .background-desc {
    font-size: 0.85rem;
  }

  .sheet-header h1 {
    font-size: 1.25rem;
  }

  .btn-back {
    padding: 0.5rem 0.75rem;
    min-height: 40px;
  }

  .character-sheet {
    padding: 0.75rem;
  }
}

/* Extra small screens */
@media (max-width: 374px) {
  .attr-name {
    font-size: 0.55rem;
  }

  .attr-value {
    font-size: 1.05rem;
  }

  .substat-name {
    font-size: 0.55rem;
  }

  .substat-value {
    font-size: 0.9rem;
  }

  .skill-name {
    font-size: 0.7rem;
  }

  .skill-level {
    font-size: 0.95rem;
  }

  .section-header h2 {
    font-size: 1rem;
  }

  .attr-card {
    padding: 0.625rem 0.4rem;
  }

  .skill-item {
    padding: 0.5rem;
  }

  .sheet-header h1 {
    font-size: 1.15rem;
  }

  .character-sheet {
    padding: 0.5rem;
  }
}
</style>
