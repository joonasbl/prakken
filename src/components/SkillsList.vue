<script setup lang="ts">
import { computed } from 'vue'
import { useSkillsStore } from '@/stores/skills'

const skillsStore = useSkillsStore()

const mappedSkills = computed(() =>
  skillsStore.skillList.map((skill) => ({
    ...skill,
    baseLabel:
      skill.baseCode === 'voi'
        ? 'Voima'
        : skill.baseCode === 'val'
          ? 'Valppaus'
          : skill.baseCode === 'kar'
            ? 'Karisma'
            : skill.baseCode === 'ket'
              ? 'Ketteryys'
              : skill.baseCode === 'sis'
                ? 'Sisukkuus'
                : skill.baseCode === 'erikois'
                  ? 'Erikois'
                  : null,
  })),
)

const handleInput = (name: string, event: InputEvent) => {
  const target = event.target as HTMLInputElement | null
  if (!target) return

  const parsed = Number.parseInt(target.value, 10)
  if (Number.isNaN(parsed)) return

  skillsStore.setLevel(name, parsed)
}
</script>

<template>
  <div class="skills-container">
    <h2 class="skills-title">Taidot</h2>
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
        <div class="skills-input">
          <input
            class="skill-input has-text-centered"
            type="number"
            :value="skill.level"
            @input="(event) => handleInput(skill.name, event as InputEvent)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-container {
  margin: 1.5rem;
}

.skills-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
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

.skills-input {
  display: flex;
  justify-content: flex-end;
}

.skill-input {
  width: 3rem;
  background-color: grey;
  border-radius: 20px;
  height: 2rem;
}
</style>

