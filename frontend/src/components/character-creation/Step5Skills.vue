<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import { useSkillsStore } from '@/stores/skills'
import type { Skill, SkillBaseCode, LearnedSkill } from '@/types/skills'

const wizardStore = useCharacterCreationStore()
const skillsStore = useSkillsStore()

const SKILL_LEARN_COST = 2

onMounted(() => {
  // Initialize learned skills from background
  if (wizardStore.draft.learnedSkills.length === 0) {
    const background = wizardStore.draft.background
    const learnedSkills: LearnedSkill[] = []
    
    // Add background skills (automatically learned, no bonus)
    if (background?.skillBonuses) {
      for (const skillName of Object.keys(background.skillBonuses)) {
        learnedSkills.push({ name: skillName, bonus: 0 })
      }
    }
    
    wizardStore.setLearnedSkills(learnedSkills)
  }
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

// Get full skill definitions with calculated levels
const skillsWithLevels = computed(() => {
  return wizardStore.draft.learnedSkills
    .map((learnedSkill) => {
      const skillDef = skillsStore.skillList.find((s) => s.name === learnedSkill.name)
      if (!skillDef) return null

      const attributeName = baseCodeToAttributeName[skillDef.baseCode]
      const attribute =
        attributeName != null
          ? wizardStore.effectiveAttributes.find((attr) => attr.name === attributeName)
          : undefined

      const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6
      const level = baseLevel + learnedSkill.bonus

      return {
        ...skillDef,
        bonus: learnedSkill.bonus,
        level,
        baseLabel: attributeName,
        baseLevel,
      }
    })
    .filter((s) => s !== null)
})

const calculateSkillRaiseCost = (baseLevel: number, currentBonus: number): number => {
  const currentLevel = baseLevel + currentBonus
  return currentLevel < 10 ? 1 : 2
}

const totalSpentPoints = computed(() => {
  let total = 0
  const background = wizardStore.draft.background
  
  for (const learnedSkill of wizardStore.draft.learnedSkills) {
    const skillDef = skillsStore.skillList.find((s) => s.name === learnedSkill.name)
    if (!skillDef) continue
    
    const attributeName = baseCodeToAttributeName[skillDef.baseCode]
    const attribute =
      attributeName != null
        ? wizardStore.draft.attributes.find((attr) => attr.name === attributeName)
        : undefined
    const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6

    // Non-background skills cost 2 points to learn
    if (background?.skillBonuses[learnedSkill.name] === undefined) {
      total += SKILL_LEARN_COST
    }

    // Add raise costs for each bonus level
    for (let i = 0; i < learnedSkill.bonus; i++) {
      total += calculateSkillRaiseCost(baseLevel, i)
    }
  }
  return total
})

const skillPointLimit = computed(() => wizardStore.skillPointLimit)
const remainingPoints = computed(() => skillPointLimit.value - totalSpentPoints.value)

const learnedSkillsCount = computed(() => wizardStore.draft.learnedSkills.length)

const isSkillLearned = (skillName: string): boolean => {
  return wizardStore.draft.learnedSkills.some((s) => s.name === skillName)
}

const getLearnedSkill = (skillName: string): LearnedSkill | undefined => {
  return wizardStore.draft.learnedSkills.find((s) => s.name === skillName)
}

const canLearnSkill = (skill: Skill): boolean => {
  if (isSkillLearned(skill.name)) return false
  return remainingPoints.value >= SKILL_LEARN_COST
}

const canRaiseSkill = (learnedSkill: LearnedSkill, baseLevel: number): boolean => {
  const currentLevel = baseLevel + learnedSkill.bonus
  if (currentLevel >= 15) return false
  const cost = calculateSkillRaiseCost(baseLevel, learnedSkill.bonus)
  return remainingPoints.value >= cost
}

const handleLearn = (skill: Skill) => {
  if (!canLearnSkill(skill)) return
  wizardStore.draft.learnedSkills.push({ name: skill.name, bonus: 0 })
}

const handleIncrease = (learnedSkill: LearnedSkill, baseLevel: number) => {
  if (!canRaiseSkill(learnedSkill, baseLevel)) return
  learnedSkill.bonus += 1
}

const handleDecrease = (learnedSkill: LearnedSkill) => {
  if (learnedSkill.bonus <= 0) return
  learnedSkill.bonus -= 1
}

const handleUnlearn = (skillName: string) => {
  const learnedSkill = getLearnedSkill(skillName)
  if (!learnedSkill || learnedSkill.bonus > 0) return // Can't unlearn if raised
  const index = wizardStore.draft.learnedSkills.findIndex((s) => s.name === skillName)
  if (index >= 0) {
    wizardStore.draft.learnedSkills.splice(index, 1)
  }
}
</script>

<template>
  <div class="skills-step">
    <div class="notification is-info mb-4">
      <div class="is-flex is-justify-content-space-between">
        <p class="has-text-weight-semibold">Pisteitä jäljellä: <span class="is-size-4 has-text-info">{{ remainingPoints
            }}</span></p>
        <p>Käytetty: <span class="has-text-info">{{ totalSpentPoints }}</span> / {{ skillPointLimit }} ({{
          learnedSkillsCount }} opittu)</p>
      </div>
    </div>

    <div class="skills-grid">
      <div v-for="skill in skillsStore.skillList" :key="skill.name" class="card skill-row mb-2"
        :class="{ 'is-learned': isSkillLearned(skill.name) }">
        <div class="card-content p-3">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div class="skill-label">
              <p class="is-size-7 has-text-weight-bold mb-1">{{ skill.name }}</p>
              <span v-if="baseCodeToAttributeName[skill.baseCode]" class="tag is-success is-light is-small">
                {{ baseCodeToAttributeName[skill.baseCode] }}
              </span>
            </div>

            <div v-if="!isSkillLearned(skill.name)" class="skill-learn-control">
              <button type="button" class="button is-success is-small is-rounded" :disabled="!canLearnSkill(skill)"
                @click="handleLearn(skill)">
                Opettele ({{ SKILL_LEARN_COST }}p)
              </button>
            </div>

            <div v-else class="skill-controls is-flex is-align-items-center gap-2">
              <button type="button" class="button is-danger is-small is-rounded" :disabled="getLearnedSkill(skill.name)!.bonus <= 0"
                @click="handleDecrease(getLearnedSkill(skill.name)!)">
                <span class="icon is-small"><i class="fas fa-minus"></i></span>
              </button>
              <span class="skill-level is-size-5 has-text-weight-bold">{{ skillsWithLevels.find(s => s?.name === skill.name)?.level }}</span>
              <button type="button" class="button is-info is-small is-rounded"
                :disabled="!canRaiseSkill(getLearnedSkill(skill.name)!, skillsWithLevels.find(s => s?.name === skill.name)?.baseLevel || 6)" 
                @click="handleIncrease(getLearnedSkill(skill.name)!, skillsWithLevels.find(s => s?.name === skill.name)?.baseLevel || 6)">
                <span class="icon is-small"><i class="fas fa-plus"></i></span>
              </button>
              <button type="button" class="button is-light is-small is-rounded" :disabled="getLearnedSkill(skill.name)!.bonus > 0"
                :title="getLearnedSkill(skill.name)!.bonus > 0 ? 'Ei voi poistaa kun taito on korotettu' : 'Poista opittu taito'"
                @click="handleUnlearn(skill.name)">
                <span class="icon is-small"><i class="fas fa-times"></i></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.skills-step {
  padding: 1rem 0;
}

/* Notification styling */
.notification {
  background: var(--color-bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.notification.is-info {
  border-color: var(--color-magic-blue);
  background: linear-gradient(135deg, rgba(74, 144, 217, 0.15) 0%, rgba(53, 122, 189, 0.1) 100%);
  box-shadow: var(--shadow-md), 0 0 12px rgba(74, 144, 217, 0.3);
}

.notification.is-info .has-text-weight-semibold,
.notification.is-info p {
  color: var(--color-text-primary);
}

.notification .has-text-weight-semibold {
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  font-size: 0.95rem;
}

.notification p {
  font-family: var(--font-body);
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .notification .has-text-weight-semibold {
    font-size: 1rem;
  }
  
  .notification p {
    font-size: 0.95rem;
  }
}

.skills-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  max-height: 500px;
  overflow-y: auto;
  padding: 0.5rem;
}

@media (min-width: 576px) {
  .skills-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

.skill-row {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--border-color);
  background: var(--gradient-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  min-height: 44px;
}

.skill-row:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), 0 0 10px rgba(74, 144, 217, 0.2);
}

.skill-row.is-learned {
  border-color: var(--color-success);
  background: linear-gradient(135deg, rgba(46, 160, 67, 0.2) 0%, rgba(36, 138, 56, 0.1) 100%);
  box-shadow: var(--shadow-md), 0 0 15px rgba(46, 160, 67, 0.3);
}

.skill-row.is-learned .has-text-weight-bold {
  color: var(--color-gold-light);
}

.skill-row.is-learned .is-size-7 {
  color: var(--color-text-primary);
}

.skill-label .is-size-7 {
  color: var(--color-gold-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  font-size: 0.85rem;
}

/* Override Bulma tag styles for dark theme */
.skill-label .tag {
  background: linear-gradient(135deg, #2d3a35 0%, #1f2a25 100%) !important;
  color: #8fd4a8 !important;
  border: 1px solid #3a5d4a !important;
  font-weight: 600;
  font-size: 0.7rem;
  font-family: var(--font-heading);
  letter-spacing: 0.03em;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
}

.skill-level {
  color: var(--color-success);
  text-shadow: 0 0 8px rgba(46, 160, 67, 0.4);
  min-width: 2rem;
  text-align: center;
}

.gap-2 {
  gap: 0.5rem;
}

/* Button controls - touch friendly */
.button.is-small {
  min-height: 36px;
  min-width: 36px;
  padding: 0 0.75rem;
}

@media (max-width: 767px) {
  .button.is-small {
    min-height: 44px;
    min-width: 44px;
  }
}

.skill-learn-control,
.skill-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

/* Mobile optimizations for skill rows */
@media (max-width: 767px) {
  .skills-grid {
    gap: 0.4rem;
    padding: 0.25rem;
  }

  .skill-row {
    min-height: auto;
  }

  .skill-row .card-content {
    padding: 0.5rem 0.75rem !important;
  }

  .skill-label .is-size-7 {
    font-size: 0.8rem;
    word-break: break-word;
  }

  .skill-label .tag {
    font-size: 0.65rem;
    min-height: 22px;
    padding: 0 0.4rem;
  }

  .skill-controls {
    gap: 0.25rem;
  }

  .skill-level {
    min-width: 1.75rem;
    font-size: 1rem;
  }

  .notification {
    padding: 0.75rem 1rem;
  }

  .notification .has-text-weight-semibold {
    font-size: 0.85rem;
  }

  .notification p {
    font-size: 0.8rem;
  }

  .is-size-4 {
    font-size: 1.25rem !important;
  }
}

/* Extra small screens */
@media (max-width: 374px) {
  .skills-grid {
    gap: 0.25rem;
  }

  .skill-row .card-content {
    padding: 0.4rem 0.5rem !important;
  }

  .skill-label .is-size-7 {
    font-size: 0.75rem;
  }

  .skill-label .tag {
    font-size: 0.6rem;
  }

  .skill-level {
    min-width: 1.5rem;
    font-size: 0.95rem;
  }

  .skill-controls {
    gap: 0.15rem;
  }
}
</style>
