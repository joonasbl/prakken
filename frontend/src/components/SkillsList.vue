<script setup lang="ts">
import { computed } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import { useStatsStore } from '@/stores/stats'
import type { SkillBaseCode } from '@/types/skills'

const skillsStore = useSkillsStore()
const statsStore = useStatsStore()

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
  skillsStore.skillList.map((skill) => {
    const attributeName = baseCodeToAttributeName[skill.baseCode]
    const attribute =
      attributeName != null
        ? statsStore.attList.find((attr) => attr.name === attributeName)
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
  skillsStore.skillList.reduce((sum, skill) => {
    const attributeName = baseCodeToAttributeName[skill.baseCode]
    const attribute =
      attributeName != null
        ? statsStore.attList.find((attr) => attr.name === attributeName)
        : undefined

    const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6
    return sum + calculateSkillCost(baseLevel, skill.bonus)
  }, 0),
)

const remainingPoints = computed(() => 100 - totalSpentPoints.value)

const handleIncrease = (skillName: string, baseLevel: number, bonus: number) => {
  const currentLevel = baseLevel + bonus
  if (currentLevel >= 15) return

  const nextCost = currentLevel < 10 ? 1 : 2
  if (totalSpentPoints.value + nextCost > 100) return

  skillsStore.increaseBonus(skillName)
}

const handleDecrease = (skillName: string) => {
  skillsStore.decreaseBonus(skillName)
}
</script>

<template>
  <div class="skills-container">
    <div class="skills-header">
      <h2 class="skills-title">Taidot</h2>
      <span class="skills-pool">
        Pisteitä jäljellä: {{ remainingPoints }}
      </span>
    </div>
    <div class="skills-grid">
      <div
        v-for="skill in mappedSkills"
        :key="skill.name"
        class="skills-row"
      >
        <div class="skills-label">
          <p>{{ skill.name }}</p>
          <span v-if="skill.baseLabel" class="skills-base">
            ({{ skill.baseLabel }})
          </span>
        </div>
        <div class="skills-controls">
          <button
            type="button"
            class="skills-button"
            @click="handleDecrease(skill.name)"
          >
            -
          </button>
          <span class="skills-level">
            {{ skill.level }}
          </span>
          <button
            type="button"
            class="skills-button"
            @click="handleIncrease(skill.name, skill.baseLevel, skill.bonus)"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-container {
  margin: 1.5rem;
}

.skills-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.skills-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.skills-pool {
  font-size: 0.9rem;
  opacity: 0.75;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.5rem 1rem;
}

.skills-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.skills-label {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
}

.skills-base {
  font-size: 0.75rem;
  opacity: 0.7;
}

.skills-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.skills-button {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  border: none;
  background-color: grey;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.skills-level {
  font-size: 0.95rem;
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
}
</style>

