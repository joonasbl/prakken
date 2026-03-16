<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
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
  4: 'Aliominaisuudet',
  5: 'Taidot',
  6: 'Varusteet',
  7: 'Nimi ja tiedot',
  8: 'Yhteenveto',
}

const stepTitle = computed(() => stepTitles[currentStep.value] || '')

// Check if user has made any progress in the wizard
const hasMadeProgress = computed(() => {
  return (
    wizardStore.draft.background !== null ||
    wizardStore.draft.advantages.length > 0 ||
    wizardStore.draft.disadvantages.length > 0 ||
    wizardStore.draft.learnedSkills.length > 0 ||
    wizardStore.draft.equippedItems.length > 0 ||
    wizardStore.draft.name.trim().length > 0
  )
})

// Prevent accidental navigation away from wizard (browser back button, refresh, close tab)
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (hasMadeProgress.value) {
    event.preventDefault()
    event.returnValue = '' // Required for some browsers
    return ''
  }
}

// Register/unregister navigation guards
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

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
    // On step 8, "Valmis" saves the character
    saveCharacter()
  }
}

const handlePrevious = () => {
  if (currentStep.value > 1) {
    wizardStore.previousStep()
  }
}

const saveCharacter = () => {
  // Create a copy of the draft with effective attributes
  const draftWithEffectiveAttrs = {
    ...wizardStore.draft,
    attributes: wizardStore.effectiveAttributes,
  }
  charactersStore.saveCharacter(draftWithEffectiveAttrs)
  wizardStore.resetWizard()
  router.push('/characters')
}

const cancelWizard = () => {
  if (hasMadeProgress.value) {
    const confirmed = window.confirm(
      'Haluatko varmasti peruuttaa hahmon luonnin? Menetät kaikki tekemäsi muutokset.'
    )
    if (!confirmed) return
  }
  wizardStore.resetWizard()
  router.push('/')
}

// Register/unregister navigation guards
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
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
          <Step8Summary v-else-if="currentStep === 8" />
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
        <span class="icon"><i :class="currentStep === 8 ? 'fas fa-save' : 'fas fa-arrow-right'"></i></span>
        <span>{{ currentStep === 8 ? 'Valmis' : 'Seuraava' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';

.wizard-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .wizard-container {
    padding: 2rem;
  }
}

.steps-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.step-indicator {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .step-indicator {
    width: 40px;
    height: 40px;
  }
}

.step-indicator.is-active {
  background: var(--gradient-gold);
  border-color: var(--color-gold-primary);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
}

.step-indicator.is-completed {
  background: linear-gradient(135deg, #2ea043 0%, #248a38 100%);
  border-color: var(--color-success);
  box-shadow: 0 0 10px rgba(46, 160, 67, 0.4);
}

.step-number {
  color: white;
  font-weight: 600;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  font-size: 0.85rem;
}

.step-card {
  min-height: 400px;
  background: var(--gradient-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1rem;
}

@media (min-width: 768px) {
  .step-card {
    padding: 1.5rem;
  }
}

.step-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-border);
  opacity: 0.5;
}

/* Mobile: Evenly distributed step indicators */
@media (max-width: 767px) {
  .steps-container .columns {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 0.5rem 0 0.75rem 0;
    -webkit-overflow-scrolling: touch;
    gap: 0.25rem;
  }

  .steps-container .column {
    flex: 1 1 0;
    display: flex;
    justify-content: center;
    padding: 0 0.125rem;
    min-width: 0;
  }

  .step-indicator {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .step-number {
    font-size: 0.65rem;
  }

  .step-indicator.is-active {
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
  }

  .step-indicator.is-completed {
    box-shadow: 0 0 6px rgba(46, 160, 67, 0.3);
  }

  .wizard-container {
    padding: 0.75rem;
  }

  .step-card {
    padding: 0.75rem;
    min-height: 350px;
  }

  .title.is-2 {
    font-size: 1.25rem;
  }

  .button.is-danger.is-outlined.is-small {
    min-height: 40px;
    padding: 0 0.75rem;
    font-size: 0.85rem;
  }
}

/* Extra small screens - tighter distribution */
@media (max-width: 374px) {
  .steps-container .columns {
    gap: 0.125rem;
    padding: 0.4rem 0 0.6rem 0;
  }

  .steps-container .column {
    padding: 0 0.0625rem;
  }

  .step-indicator {
    width: 24px;
    height: 24px;
  }

  .step-number {
    font-size: 0.6rem;
  }

  .step-indicator.is-active {
    box-shadow: 0 0 6px rgba(212, 175, 55, 0.3);
  }

  .step-indicator.is-completed {
    box-shadow: 0 0 4px rgba(46, 160, 67, 0.2);
  }

  .wizard-container {
    padding: 0.5rem;
  }

  .step-card {
    padding: 0.625rem;
  }

  .title.is-2 {
    font-size: 1.15rem;
  }

  .is-flex.is-justify-content-space-between .button {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}

/* Navigation buttons */
.is-flex.is-justify-content-space-between {
  gap: var(--space-md);
}

.is-flex.is-justify-content-space-between .button {
  min-height: 44px;
  padding: 0.75rem 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 767px) {
  .is-flex.is-justify-content-space-between {
    flex-direction: column;
  }
  
  .is-flex.is-justify-content-space-between .button {
    width: 100%;
  }
}

/* Title styling */
.title.is-2 {
  font-size: 1.5rem;
}

@media (min-width: 768px) {
  .title.is-2 {
    font-size: 2rem;
  }
}

/* Cancel button */
.button.is-danger.is-outlined.is-small {
  min-height: 44px;
  min-width: 44px;
}
</style>
