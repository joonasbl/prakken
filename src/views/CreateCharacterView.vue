<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import { useCharactersStore } from '@/stores/characters'
import Step1RollStats from '@/components/character-creation/Step1RollStats.vue'
import Step2ChooseBackground from '@/components/character-creation/Step2ChooseBackground.vue'
import Step3AdvantagesDisadvantages from '@/components/character-creation/Step3AdvantagesDisadvantages.vue'
import Step4SubStats from '@/components/character-creation/Step4SubStats.vue'
import Step5Skills from '@/components/character-creation/Step5Skills.vue'
import Step6Equipment from '@/components/character-creation/Step6Equipment.vue'
import Step7NameAndDetails from '@/components/character-creation/Step7NameAndDetails.vue'
import Step8Summary from '@/components/character-creation/Step8Summary.vue'

const router = useRouter()
const wizardStore = useCharacterCreationStore()
const charactersStore = useCharactersStore()

const currentStep = computed(() => wizardStore.currentStepNum)
const stepTitles: Record<number, string> = {
  1: 'Heitä ominaisuudet',
  2: 'Valitse tausta',
  3: 'Edut ja haitat',
  4: 'Johdannaiset',
  5: 'Taidot',
  6: 'Varusteet',
  7: 'Nimi ja tiedot',
  8: 'Yhteenveto',
}

const stepTitle = computed(() => stepTitles[currentStep.value] || '')

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return true
    case 2:
      return wizardStore.hasSelectedBackground
    case 3:
      // Must have equal number of advantages and disadvantages
      return wizardStore.isAdvAdvantageBalanced
    case 4:
      return wizardStore.draft.subStats !== null
    case 5:
      return true
    case 6:
      return true
    case 7:
      return wizardStore.draft.name.trim().length > 0
    case 8:
      return true
    default:
      return false
  }
})

const handleNext = () => {
  if (currentStep.value < 8) {
    wizardStore.nextStep()
  } else {
    finishCharacterCreation()
  }
}

const handlePrevious = () => {
  if (currentStep.value > 1) {
    wizardStore.previousStep()
  }
}

const saveCharacter = () => {
  const character = charactersStore.saveCharacter(wizardStore.draft)
  wizardStore.resetWizard()
  router.push(`/character/${character.id}`)
}

const finishCharacterCreation = () => {
  router.push('/')
  wizardStore.resetWizard()
}

const cancelWizard = () => {
  if (confirm('Haluatko varmasti peruuttaa hahmon luonnin?')) {
    wizardStore.resetWizard()
    router.push('/')
  }
}
</script>

<template>
  <div class="wizard-container">
    <div class="wizard-header">
      <h1 class="wizard-title">Hahmon luonti</h1>
      <button type="button" class="button-cancel" @click="cancelWizard">
        Peruuta
      </button>
    </div>

    <div class="progress-bar">
      <div
        v-for="step in 8"
        :key="step"
        class="progress-step"
        :class="{
          'is-active': currentStep === step,
          'is-completed': currentStep > step,
        }"
      >
        <span class="step-number">{{ step }}</span>
      </div>
    </div>

    <div class="step-content">
      <h2 class="step-title">{{ stepTitle }}</h2>
      <div class="step-component">
        <Step1RollStats v-if="currentStep === 1" />
        <Step2ChooseBackground v-else-if="currentStep === 2" />
        <Step3AdvantagesDisadvantages v-else-if="currentStep === 3" />
        <Step4SubStats v-else-if="currentStep === 4" />
        <Step5Skills v-else-if="currentStep === 5" />
        <Step6Equipment v-else-if="currentStep === 6" />
        <Step7NameAndDetails v-else-if="currentStep === 7" />
        <Step8Summary v-else-if="currentStep === 8" @save="saveCharacter" />
      </div>
    </div>

    <div class="wizard-footer">
      <button
        type="button"
        class="button-previous"
        :disabled="currentStep === 1"
        @click="handlePrevious"
      >
        Edellinen
      </button>
      <button
        type="button"
        class="button-next"
        :disabled="!canProceed"
        @click="handleNext"
      >
        {{ currentStep === 8 ? 'Valmis' : 'Seuraava' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.wizard-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.wizard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.button-cancel {
  padding: 0.5rem 1rem;
  border: 1px solid #dc3545;
  background-color: transparent;
  color: #dc3545;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.button-cancel:hover {
  background-color: #dc3545;
  color: white;
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e0e0e0;
  transform: translateY(-50%);
  z-index: 0;
}

.progress-step {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: background-color 0.3s;
}

.progress-step.is-active {
  background-color: #3498db;
}

.progress-step.is-completed {
  background-color: #27ae60;
}

.step-number {
  color: white;
  font-weight: 600;
}

.step-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
}

.button-previous,
.button-next {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-previous {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.button-previous:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-next {
  background-color: #3498db;
  color: white;
}

.button-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-next:not(:disabled):hover {
  background-color: #2980b9;
}
</style>
