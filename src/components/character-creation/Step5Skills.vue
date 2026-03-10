<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import { useSkillsStore } from '@/stores/skills'
import type { Skill, SkillBaseCode } from '@/types/skills'

const wizardStore = useCharacterCreationStore()
const skillsStore = useSkillsStore()

onMounted(() => {
  if (wizardStore.draft.skills.length === 0) {
    const background = wizardStore.draft.background
    const clonedSkills: Skill[] = skillsStore.skillList.map((skill) => {
      const newSkill: Skill = { ...skill, bonus: 0 }
      if (background?.skillBonuses[skill.name]) {
        newSkill.bonus = background.skillBonuses[skill.name] || 0
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
    const level = baseLevel + skill.bonus

    return {
      ...skill,
      baseLabel: attributeName,
      baseLevel,
      level,
    }
  }),
)

const calculateSkillCost = (baseLevel: number, bonus: number): number => {
  let cost = 0
  for (let i = 0; i < bonus; i += 1) {
    const currentLevel = baseLevel + i
    cost += currentLevel < 10 ? 1 : 2
  }
  return cost
}

const totalSpentPoints = computed(() =>
  wizardStore.draft.skills.reduce((sum, skill) => {
    const attributeName = baseCodeToAttributeName[skill.baseCode]
    const attribute =
      attributeName != null
        ? wizardStore.draft.attributes.find((attr) => attr.name === attributeName)
        : undefined

    const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6
    return sum + calculateSkillCost(baseLevel, skill.bonus)
  }, 0),
)

const remainingPoints = computed(() => 100 - totalSpentPoints.value)

const handleIncrease = (skill: Skill, baseLevel: number, bonus: number) => {
  const currentLevel = baseLevel + bonus
  if (currentLevel >= 15) return

  const nextCost = currentLevel < 10 ? 1 : 2
  if (totalSpentPoints.value + nextCost > 100) return

  const skillRef = wizardStore.draft.skills.find((s) => s.name === skill.name)
  if (skillRef) {
    skillRef.bonus += 1
  }
}

const handleDecrease = (skill: Skill) => {
  if (skill.bonus <= 0) return

  const skillRef = wizardStore.draft.skills.find((s) => s.name === skill.name)
  if (skillRef) {
    skillRef.bonus -= 1
  }
}
</script>

<template>
  <div class="skills-step">
    <div class="skills-header">
      <span>Pisteitä jäljellä: <strong>{{ remainingPoints }}</strong></span>
      <span>Käytetty: <strong>{{ totalSpentPoints }}</strong> / 100</span>
    </div>

    <div class="skills-grid">
      <div
        v-for="skill in mappedSkills"
        :key="skill.name"
        class="skill-row"
      >
        <div class="skill-label">
          <p>{{ skill.name }}</p>
          <span v-if="skill.baseLabel" class="skill-base">
            ({{ skill.baseLabel }})
          </span>
        </div>
        <div class="skill-controls">
          <button
            type="button"
            class="skill-btn"
            @click="handleDecrease(skill)"
          >
            -
          </button>
          <span class="skill-level">{{ skill.level }}</span>
          <button
            type="button"
            class="skill-btn"
            @click="handleIncrease(skill, skill.baseLevel, skill.bonus)"
          >
            +
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

.skill-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
}

.skill-btn:hover {
  background-color: #2980b9;
}

.skill-level {
  font-size: 1rem;
  font-weight: 700;
  min-width: 2rem;
  text-align: center;
}
</style>
