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
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
      <h1 class="title is-2" style="font-family: 'MedievalSharp', cursive;">Hahmon luonti</h1>
      <button type="button" class="button is-danger is-outlined is-small" @click="cancelWizard">
        Peruuta
      </button>
    </div>

    <div class="steps-container mb-5">
      <div class="columns is-variable is-1">
        <div class="column" v-for="step in 8" :key="step">
          <div class="step-indicator has-text-centered" :class="{
            'is-active': currentStep === step,
            'is-completed': currentStep > step,
          }">
            <span class="step-number">{{ step }}</span>
          </div>
        </div>
      </div>
      <p class="has-text-centered is-size-7 has-text-grey mt-2">{{ stepTitle }}</p>
    </div>

    <div class="card step-card">
      <div class="card-content">
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
    </div>

    <div class="is-flex is-justify-content-space-between mt-5">
      <button
        type="button"
        class="button is-light"
        :disabled="currentStep === 1"
        @click="handlePrevious"
      >
        <span class="icon"><i class="fas fa-arrow-left"></i></span>
        <span>Edellinen</span>
      </button>
      <button
        type="button"
        class="button is-primary"
        :disabled="!canProceed"
        @click="handleNext"
      >
        <span>{{ currentStep === 8 ? 'Valmis' : 'Seuraava' }}</span>
        <span class="icon"><i class="fas fa-arrow-right"></i></span>
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

.steps-container {
  position: relative;
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #bdc3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: background-color 0.3s;
}

.step-indicator.is-active {
  background-color: #3498db;
}

.step-indicator.is-completed {
  background-color: #27ae60;
}

.step-number {
  color: white;
  font-weight: 600;
}

.step-card {
  min-height: 400px;
}
</style>
