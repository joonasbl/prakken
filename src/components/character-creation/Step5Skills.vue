<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import { useSkillsStore } from '@/stores/skills'
import type { Skill, SkillBaseCode } from '@/types/skills'

const wizardStore = useCharacterCreationStore()
const skillsStore = useSkillsStore()

const SKILL_LEARN_COST = 2
const SKILL_RAISE_COST = 1 // Cost per level up to 9, then 2

onMounted(() => {
  if (wizardStore.draft.skills.length === 0) {
    const background = wizardStore.draft.background
    const clonedSkills: Skill[] = skillsStore.skillList.map((skill) => {
      const newSkill: Skill = { ...skill }
      // Background skills are automatically learned (no bonus, marked as background skill)
      if (background?.skillBonuses[skill.name] !== undefined) {
        newSkill.learned = true
        newSkill.bonus = 0
        newSkill.backgroundSkill = true
      } else {
        newSkill.learned = false
        newSkill.bonus = 0
        newSkill.backgroundSkill = false
      }
      return newSkill
    })
    wizardStore.setSkills(clonedSkills)
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

const mappedSkills = computed(() =>
  wizardStore.draft.skills.map((skill) => {
    const attributeName = baseCodeToAttributeName[skill.baseCode]
    const attribute =
      attributeName != null
        ? wizardStore.draft.attributes.find((attr) => attr.name === attributeName)
        : undefined

    const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6
    const level = skill.learned ? baseLevel + skill.bonus : 0

    return {
      ...skill,
      baseLabel: attributeName,
      baseLevel,
      level,
    }
  }),
)

const calculateSkillRaiseCost = (baseLevel: number, currentBonus: number): number => {
  const currentLevel = baseLevel + currentBonus
  return currentLevel < 10 ? 1 : 2
}

const totalSpentPoints = computed(() => {
  let total = 0
  for (const skill of wizardStore.draft.skills) {
    if (!skill.learned) continue

    const attributeName = baseCodeToAttributeName[skill.baseCode]
    const attribute =
      attributeName != null
        ? wizardStore.draft.attributes.find((attr) => attr.name === attributeName)
        : undefined
    const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6

    // Background skills are free (learning cost waived)
    // Non-background skills cost 2 points to learn
    if (!skill.backgroundSkill) {
      total += SKILL_LEARN_COST
    }

    // Add raise costs for each bonus level
    for (let i = 0; i < skill.bonus; i++) {
      total += calculateSkillRaiseCost(baseLevel, i)
    }
  }
  return total
})

const skillPointLimit = computed(() => wizardStore.skillPointLimit)
const remainingPoints = computed(() => skillPointLimit.value - totalSpentPoints.value)

const learnedSkillsCount = computed(() =>
  wizardStore.draft.skills.filter((s) => s.learned).length
)

const canLearnSkill = (skill: Skill): boolean => {
  if (skill.learned) return false
  return remainingPoints.value >= SKILL_LEARN_COST
}

const canRaiseSkill = (skill: Skill, baseLevel: number): boolean => {
  if (!skill.learned) return false
  const currentLevel = baseLevel + skill.bonus
  if (currentLevel >= 15) return false
  const cost = calculateSkillRaiseCost(baseLevel, skill.bonus)
  return remainingPoints.value >= cost
}

const handleLearn = (skill: Skill) => {
  if (!canLearnSkill(skill)) return
  const skillRef = wizardStore.draft.skills.find((s) => s.name === skill.name)
  if (skillRef) {
    skillRef.learned = true
  }
}

const handleIncrease = (skill: Skill, baseLevel: number) => {
  if (!canRaiseSkill(skill, baseLevel)) return
  const skillRef = wizardStore.draft.skills.find((s) => s.name === skill.name)
  if (skillRef) {
    skillRef.bonus += 1
  }
}

const handleDecrease = (skill: Skill) => {
  if (!skill.learned || skill.bonus <= 0) return
  const skillRef = wizardStore.draft.skills.find((s) => s.name === skill.name)
  if (skillRef) {
    skillRef.bonus -= 1
  }
}

const handleUnlearn = (skill: Skill) => {
  if (skill.bonus > 0) return // Can't unlearn if raised
  const skillRef = wizardStore.draft.skills.find((s) => s.name === skill.name)
  if (skillRef) {
    skillRef.learned = false
  }
}
</script>

<template>
  <div class="skills-step">
    <div class="skills-header">
      <span>Pisteitä jäljellä: <strong>{{ remainingPoints }}</strong></span>
      <span>
        Käytetty: <strong>{{ totalSpentPoints }}</strong> / {{ skillPointLimit }}
        ({{ learnedSkillsCount }} opittu)
      </span>
    </div>

    <div class="skills-grid">
      <div
        v-for="skill in mappedSkills"
        :key="skill.name"
        class="skill-row"
        :class="{ learned: skill.learned }"
      >
        <div class="skill-label">
          <p>{{ skill.name }}</p>
          <span v-if="skill.baseLabel" class="skill-base">
            ({{ skill.baseLabel }})
          </span>
        </div>
        
        <div v-if="!skill.learned" class="skill-learn-control">
          <button
            type="button"
            class="skill-btn learn-btn"
            :disabled="!canLearnSkill(skill)"
            @click="handleLearn(skill)"
          >
            Opettele ({{ SKILL_LEARN_COST }}p)
          </button>
        </div>
        
        <div v-else class="skill-controls">
          <button
            type="button"
            class="skill-btn decrease-btn"
            :disabled="skill.bonus <= 0"
            @click="handleDecrease(skill)"
          >
            -
          </button>
          <span class="skill-level">{{ skill.level }}</span>
          <button
            type="button"
            class="skill-btn increase-btn"
            :disabled="!canRaiseSkill(skill, skill.baseLevel)"
            @click="handleIncrease(skill, skill.baseLevel)"
          >
            +
          </button>
          <button
            v-if="skill.bonus === 0"
            type="button"
            class="skill-btn unlearn-btn"
            @click="handleUnlearn(skill)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-step {
  padding: 1rem 0;
}

.skills-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 1rem;
}

.skills-header strong {
  color: #3498db;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
  padding: 0.5rem;
}

.skill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 2px solid transparent;
}

.skill-row.learned {
  border-color: #27ae60;
  background-color: #e8f8f5;
}

.skill-label {
  display: flex;
  flex-direction: column;
}

.skill-label p {
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.skill-base {
  font-size: 0.75rem;
  color: #666;
}

.skill-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-learn-control {
  display: flex;
}

.skill-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s, opacity 0.2s;
}

.skill-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.skill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.skill-btn.learn-btn {
  width: auto;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  background-color: #27ae60;
}

.skill-btn.learn-btn:hover:not(:disabled) {
  background-color: #229954;
}

.skill-btn.decrease-btn {
  background-color: #e74c3c;
}

.skill-btn.decrease-btn:hover:not(:disabled) {
  background-color: #c0392b;
}

.skill-btn.increase-btn {
  background-color: #3498db;
}

.skill-btn.increase-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.skill-btn.unlearn-btn {
  background-color: #95a5a6;
  font-size: 1rem;
}

.skill-btn.unlearn-btn:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.skill-level {
  font-size: 1rem;
  font-weight: 700;
  min-width: 2rem;
  text-align: center;
  color: #2c3e50;
}

.skill-row.learned .skill-level {
  color: #27ae60;
}
</style>
