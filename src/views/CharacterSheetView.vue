<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCharactersStore } from '@/stores/characters'
import type { SkillBaseCode } from '@/types/skills'

const router = useRouter()
const route = useRoute()
const charactersStore = useCharactersStore()

const character = computed(() => {
  const id = route.params.id as string
  return charactersStore.getCharacterById(id)
})

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
  character.value?.skills
    .filter((skill) => skill.bonus > 0)
    .map((skill) => {
      const attributeName = baseCodeToAttributeName[skill.baseCode]
      const attribute =
        attributeName != null && character.value
          ? character.value.attributes.find((attr) => attr.name === attributeName)
          : undefined

      const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6
      const level = baseLevel + skill.bonus

      return { ...skill, level, baseLabel: attributeName }
    }) || []
)

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
      <button type="button" class="btn-back" @click="handleBack">
        ← Takaisin
      </button>
      <h1>{{ character.name }}</h1>
    </div>

    <div class="sheet-content">
      <div class="section attributes-section">
        <h2>Ominaisuudet</h2>
        <div class="attributes-grid">
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

      <div class="section substats-section">
        <h2>Johdannaiset</h2>
        <div class="substats-grid">
          <div class="substat-card">
            <span class="substat-name">Veripisteet</span>
            <span class="substat-value">{{ character.subStats.veripisteet }}</span>
          </div>
          <div class="substat-card">
            <span class="substat-name">Vauriobonus</span>
            <span class="substat-value">{{ character.subStats.vauriobonus }}</span>
          </div>
          <div class="substat-card">
            <span class="substat-name">Syvä haava</span>
            <span class="substat-value">{{ character.subStats.syvaHaava }}</span>
          </div>
          <div class="substat-card">
            <span class="substat-name">Kantokyky</span>
            <span class="substat-value">{{ character.subStats.kantokyky }}</span>
          </div>
        </div>
      </div>

      <div class="section background-section" v-if="character.background">
        <h2>Tausta</h2>
        <p class="background-name">{{ character.background.name }}</p>
        <p class="background-desc">{{ character.background.description }}</p>
      </div>

      <div class="section advantages-section" v-if="character.advantages.length > 0">
        <h2>Edut</h2>
        <ul class="trait-list">
          <li v-for="adv in character.advantages" :key="adv.id">
            <strong>{{ adv.name }}</strong>
            <span>{{ adv.description }}</span>
          </li>
        </ul>
      </div>

      <div class="section disadvantages-section" v-if="character.disadvantages.length > 0">
        <h2>Haitat</h2>
        <ul class="trait-list">
          <li v-for="dis in character.disadvantages" :key="dis.id">
            <strong>{{ dis.name }}</strong>
            <span>{{ dis.description }}</span>
          </li>
        </ul>
      </div>

      <div class="section skills-section" v-if="skillsWithLevels.length > 0">
        <h2>Taidot</h2>
        <div class="skills-grid">
          <div
            v-for="skill in skillsWithLevels"
            :key="skill.name"
            class="skill-item"
          >
            <div class="skill-name">
              {{ skill.name }}
              <span v-if="skill.baseLabel" class="skill-base">({{ skill.baseLabel }})</span>
            </div>
            <span class="skill-level">{{ skill.level }}</span>
          </div>
        </div>
      </div>

      <div class="section equipment-section" v-if="character.equipment.length > 0">
        <h2>Varusteet</h2>
        <ul class="equipment-list">
          <li v-for="item in character.equipment" :key="item.id">
            {{ item.name }}
          </li>
        </ul>
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
  padding: 2rem;
}

.sheet-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.sheet-header h1 {
  font-size: 2rem;
  color: var(--color-gold-primary);
  margin: 0;
  font-family: var(--font-heading);
  letter-spacing: 0.08em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.btn-back {
  padding: 0.5rem 1rem;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
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
  gap: 2rem;
}

.section {
  background: var(--gradient-card);
  padding: 1.5rem;
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

.section h2 {
  font-size: 1.4rem;
  color: var(--color-gold-primary);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-gold);
  font-family: var(--font-heading);
  letter-spacing: 0.08em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
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
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.attr-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-magic-blue);
  text-shadow: 0 0 10px rgba(74, 144, 217, 0.5);
}

.substats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
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
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.substat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-success);
  text-shadow: 0 0 10px rgba(46, 160, 67, 0.4);
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
}

.trait-list,
.equipment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trait-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.trait-list li:last-child {
  border-bottom: none;
}

.trait-list strong {
  color: var(--color-gold-primary);
  margin-bottom: 0.25rem;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.trait-list span {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
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
}

.skill-item:hover {
  border-color: var(--border-gold);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
  transform: translateY(-1px);
}

.skill-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.skill-base {
  font-weight: 400;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.skill-level {
  font-weight: 700;
  color: var(--color-success);
  font-size: 1.1rem;
  text-shadow: 0 0 8px rgba(46, 160, 67, 0.4);
}

.equipment-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
  color: var(--color-text-secondary);
}

.equipment-list li:last-child {
  border-bottom: none;
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

@media (max-width: 768px) {
  .attributes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .substats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
