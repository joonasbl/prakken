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
    <div class="notification is-info is-light mb-4">
      <div class="is-flex is-justify-content-space-between">
        <p class="has-text-weight-semibold">Pisteitä jäljellä: <span class="is-size-4 has-text-info">{{ remainingPoints }}</span></p>
        <p>Käytetty: <span class="has-text-info">{{ totalSpentPoints }}</span> / {{ skillPointLimit }} ({{ learnedSkillsCount }} opittu)</p>
      </div>
    </div>

    <div class="skills-grid">
      <div
        v-for="skill in mappedSkills"
        :key="skill.name"
        class="card skill-row mb-2"
        :class="{ 'is-learned': skill.learned }"
      >
        <div class="card-content p-3">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div class="skill-label">
              <p class="is-size-7 has-text-weight-bold mb-1">{{ skill.name }}</p>
              <span v-if="skill.baseLabel" class="tag is-success is-light is-small">
                {{ skill.baseLabel }}
              </span>
            </div>

            <div v-if="!skill.learned" class="skill-learn-control">
              <button
                type="button"
                class="button is-success is-small is-rounded"
                :disabled="!canLearnSkill(skill)"
                @click="handleLearn(skill)"
              >
                Opettele ({{ SKILL_LEARN_COST }}p)
              </button>
            </div>

            <div v-else class="skill-controls is-flex is-align-items-center gap-2">
              <button
                type="button"
                class="button is-danger is-small is-rounded"
                :disabled="skill.bonus <= 0"
                @click="handleDecrease(skill)"
              >
                <span class="icon is-small"><i class="fas fa-minus"></i></span>
              </button>
              <span class="skill-level is-size-5 has-text-weight-bold">{{ skill.level }}</span>
              <button
                type="button"
                class="button is-info is-small is-rounded"
                :disabled="!canRaiseSkill(skill, skill.baseLevel)"
                @click="handleIncrease(skill, skill.baseLevel)"
              >
                <span class="icon is-small"><i class="fas fa-plus"></i></span>
              </button>
              <button
                v-if="skill.bonus === 0"
                type="button"
                class="button is-light is-small is-rounded"
                @click="handleUnlearn(skill)"
              >
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
.skills-step {
  padding: 1rem 0;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.5rem;
  max-height: 500px;
  overflow-y: auto;
  padding: 0.5rem;
}

.skill-row {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.skill-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.skill-row.is-learned {
  border-color: #27ae60;
  background-color: #e8f8f5;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
