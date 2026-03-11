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
    <div class="card mb-4 summary-header-card">
      <div class="card-content">
        <div class="character-name-section">
          <div class="name-label">
            <span class="name-icon"><i class="fas fa-scroll"></i></span>
            <span>Hahmon nimi</span>
          </div>
          <p class="character-name">{{ wizardStore.draft.name }}</p>
        </div>
      </div>
    </div>

    <div class="card mb-4 attributes-panel">
      <div class="card-content">
        <div class="section-header">
          <span class="header-icon"><i class="fas fa-dice-d20"></i></span>
          <span>Ominaisuudet</span>
        </div>
        <div class="attributes-grid">
          <div class="attr-card" v-for="attr in wizardStore.draft.attributes" :key="attr.name">
            <div class="attr-label">{{ attr.name }}</div>
            <div class="attr-value">{{ attr.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.background">
      <div class="card-content">
        <div class="section-header">
          <span class="header-icon"><i class="fas fa-shield-alt"></i></span>
          <span>Syntyperä</span>
        </div>
        <p class="background-name">{{ wizardStore.draft.background.name }}</p>
        <p class="background-description">{{ wizardStore.draft.background.description }}</p>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.advantages.length > 0">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Edut</div>
        <div class="tags are-medium">
          <span class="tag is-success is-light" v-for="adv in wizardStore.draft.advantages" :key="adv.id">
            {{ adv.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.disadvantages.length > 0">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Haitat</div>
        <div class="tags are-medium">
          <span class="tag is-danger is-light" v-for="dis in wizardStore.draft.disadvantages" :key="dis.id">
            {{ dis.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.subStats">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Aliominaisuudet
        </div>
        <div class="columns is-multiline">
          <div class="column is-3">
            <div class="box has-text-centered p-3">
              <div class="is-size-7 has-text-grey mb-1">Veripisteet</div>
              <div class="is-size-4 has-text-weight-bold has-text-success">{{ wizardStore.draft.subStats.veripisteet }}
              </div>
            </div>
          </div>
          <div class="column is-3">
            <div class="box has-text-centered p-3">
              <div class="is-size-7 has-text-grey mb-1">Vauriobonus</div>
              <div class="is-size-4 has-text-weight-bold has-text-success">{{ wizardStore.draft.subStats.vauriobonus }}
              </div>
            </div>
          </div>
          <div class="column is-3">
            <div class="box has-text-centered p-3">
              <div class="is-size-7 has-text-grey mb-1">Syvä haava</div>
              <div class="is-size-4 has-text-weight-bold has-text-success">{{ wizardStore.draft.subStats.syvaHaava }}
              </div>
            </div>
          </div>
          <div class="column is-3">
            <div class="box has-text-centered p-3">
              <div class="is-size-7 has-text-grey mb-1">Kantokyky</div>
              <div class="is-size-4 has-text-weight-bold has-text-success">{{ wizardStore.draft.subStats.kantokyky }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="skillsWithLevels.length > 0">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Taidot ({{
          skillsWithLevels.length }} opittu)</div>
        <div class="columns is-multiline">
          <div class="column is-4" v-for="skill in skillsWithLevels" :key="skill.name">
            <div class="box p-3">
              <div class="is-size-7 has-text-grey">{{ skill.name }}</div>
              <div class="is-size-5 has-text-weight-bold has-text-success">{{ skill.level }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.equipment.length > 0">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Varusteet ({{
          wizardStore.draft.equipment.length }} kpl, {{ totalEquipmentWeight }} kg)</div>
        <ul class="content">
          <li v-for="item in wizardStore.draft.equipment" :key="item.id">
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>

    <div class="has-text-centered mt-6">
      <button type="button" class="button is-success is-large is-rounded" @click="handleSave">
        <span class="icon"><i class="fas fa-save"></i></span>
        <span>Tallenna hahmo</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.summary-step {
  max-width: 900px;
  margin: 0 auto;
}

/* ============================================
   Character Name Header Card
   ============================================ */
.summary-header-card {
  background: linear-gradient(135deg, #2a3140 0%, #1f2630 50%, #1a1f26 100%);
  border: 2px solid var(--border-gold);
  border-radius: var(--radius-lg);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(212, 175, 55, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.summary-header-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-gold);
}

.character-name-section {
  text-align: center;
  padding: 0.5rem 0;
}

.name-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.name-icon {
  color: var(--color-gold-primary);
  font-size: 1.2rem;
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.5));
}

.name-label span {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.character-name {
  font-size: 2rem;
  font-weight: 700;
  font-family: var(--font-heading);
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, #f0f6fc 0%, #d4af37 50%, #f0f6fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
  margin: 0;
}

/* ============================================
   Attributes Panel
   ============================================ */
.attributes-panel {
  background: linear-gradient(180deg, #242b36 0%, #1a2028 100%);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.attributes-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-magic-blue), transparent);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.header-icon {
  color: var(--color-magic-blue);
  font-size: 1.3rem;
  filter: drop-shadow(0 0 8px rgba(74, 144, 217, 0.5));
}

.section-header span {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}

.attr-card {
  background: linear-gradient(135deg, #2d3542 0%, #242b35 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.attr-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-gold-primary), transparent);
  opacity: 0.5;
}

.attr-card:hover {
  border-color: var(--border-gold);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 0 15px rgba(212, 175, 55, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.attr-label {
  color: #b8c5d6;
  font-family: var(--font-heading);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.attr-value {
  color: #e8edf4;
  font-size: 1.8rem;
  font-weight: 700;
  font-family: var(--font-heading);
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(232, 237, 244, 0.3);
  letter-spacing: 0.05em;
}

/* ============================================
   Background Section
   ============================================ */
.background-name {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.background-description {
  color: #b8c5d6;
  font-size: 1rem;
  line-height: 1.7;
}

/* ============================================
   Other Cards
   ============================================ */
.summary-step .card {
  background: var(--gradient-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.summary-step .card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
  opacity: 0.5;
}

.summary-step .is-size-4,
.summary-step .is-size-5 {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.summary-step .box {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.summary-step .box .is-size-4 {
  color: var(--color-magic-blue);
  text-shadow: 0 0 10px rgba(74, 144, 217, 0.5);
}

.summary-step .subtitle {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.summary-step .content {
  color: #b8c5d6;
}

.summary-step .has-text-success {
  color: var(--color-success) !important;
  text-shadow: 0 0 8px rgba(46, 160, 67, 0.4);
}

.summary-step .has-text-info {
  color: var(--color-magic-blue) !important;
  text-shadow: 0 0 8px rgba(74, 144, 217, 0.4);
}

.summary-step .has-text-grey {
  color: #b8c5d6 !important;
}

.summary-step .has-text-grey-dark {
  color: #a8b5c6 !important;
}

/* Substats and Skills labels in boxes - override Bulma defaults */
.summary-step .box .is-size-7,
.summary-step .box .is-size-7.has-text-grey {
  color: #b8c5d6 !important;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

/* Equipment list items */
.summary-step .content li {
  color: #b8c5d6 !important;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border-color);
}

.summary-step .content li:last-child {
  border-bottom: none;
}

.summary-step .tag {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--border-color);
}

.summary-step .tag.is-success {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-color: var(--color-success);
}

.summary-step .tag.is-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 768px) {
  .attributes-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .character-name {
    font-size: 1.5rem;
  }
}
</style>
