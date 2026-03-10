import { defineStore } from 'pinia'
import type { Attr } from '@/types/attributes'
import type { Skill } from '@/types/skills'
import type {
  Background,
  Advantage,
  Disadvantage,
  SubStats,
  Equipment,
  CharacterDraft,
  CharacterCreationStep,
} from '@/types/character'

const defaultAttributes: Attr[] = [
  { name: 'Voima', value: 10 },
  { name: 'Terveys', value: 10 },
  { name: 'Ketteryys', value: 10 },
  { name: 'Valppaus', value: 10 },
  { name: 'Sisukkuus', value: 10 },
  { name: 'Karisma', value: 10 },
]

const backgrounds: Background[] = [
  {
    id: 'soldier',
    name: 'Sotilas',
    description: 'Olet taistellut rintamalla ja nähnyt monia taisteluita.',
    statBonuses: { Voima: 1, Terveys: 1 },
    skillBonuses: { 'Lyömäaseet': 1, 'Kilvet': 1, 'Sotataito': 1 },
  },
  {
    id: 'scholar',
    name: 'Oppinut',
    description: 'Olet viettänyt vuotesi kirjojen ja tutkimuksen parissa.',
    statBonuses: { Valppaus: 1, Sisukkuus: 1 },
    skillBonuses: { 'Kirjat ja tieteet': 1, 'Historia': 1, 'Lukutaito': 1 },
  },
  {
    id: 'merchant',
    name: 'Kauppias',
    description: 'Olet matkustanut paljon ja kaupitellut tavaroita.',
    statBonuses: { Karisma: 1, Valppaus: 1 },
    skillBonuses: { 'Kaupanhieronta': 1, 'Kauppareitit': 1, 'Ihmistuntemus': 1 },
  },
  {
    id: 'thief',
    name: 'Varas',
    description: 'Olet elänyt varjoissa ja ottanut mitä haluat.',
    statBonuses: { Ketteryys: 1, Valppaus: 1 },
    skillBonuses: { 'Hiivintä': 1, 'Tiirikointi': 1, 'Sorminäppäryys': 1 },
  },
  {
    id: 'hunter',
    name: 'Metsästäjä',
    description: 'Olet asunut erämaassa ja elänyt maan antimilla.',
    statBonuses: { Terveys: 1, Valppaus: 1 },
    skillBonuses: { 'Erätaidot': 1, 'Metsästys': 1, 'Jouset': 1 },
  },
  {
    id: 'noble',
    name: 'Aatelinen',
    description: 'Olet syntynyt ylempään säätyyn ja nautit etuoikeuksista.',
    statBonuses: { Karisma: 1, Sisukkuus: 1 },
    skillBonuses: { 'Johtaminen': 1, 'Heraldiikka': 1, 'Esiintyminen': 1 },
  },
]

const advantages: Advantage[] = [
  { id: 'strong', name: 'Vahva', description: 'Saat +2 Voimaan.', cost: 2 },
  { id: 'healthy', name: 'Terve', description: 'Saat +2 Terveyteen.', cost: 2 },
  { id: 'agile', name: 'Ketterä', description: 'Saat +2 Ketteryys.', cost: 2 },
  { id: 'alert', name: 'Valpas', description: 'Saat +2 Valppaus.', cost: 2 },
  { id: 'resilient', name: 'Sisuukas', description: 'Saat +2 Sisukkuus.', cost: 2 },
  { id: 'charismatic', name: 'Karismaattinen', description: 'Saat +2 Karisma.', cost: 2 },
  { id: 'quick_healer', name: 'Nopea paraneminen', description: 'Paranet nopeammin.', cost: 3 },
  { id: 'night_vision', name: 'Yönäkö', description: 'Näet pimeässä paremmin.', cost: 1 },
  { id: 'lucky', name: 'Onnekas', description: 'Saat lisäonnenheittoja.', cost: 3 },
  { id: 'wealthy', name: 'Varakas', description: 'Saat enemmän aloitusrahaa.', cost: 2 },
]

const disadvantages: Disadvantage[] = [
  { id: 'weak', name: 'Heikko', description: 'Saat -1 Voimaan.', benefit: 1 },
  { id: 'sickly', name: 'Sairas', description: 'Saat -1 Terveyteen.', benefit: 1 },
  { id: 'clumsy', name: 'Kömpelö', description: 'Saat -1 Ketteryys.', benefit: 1 },
  { id: 'distracted', name: 'Hajamielinen', description: 'Saat -1 Valppaus.', benefit: 1 },
  { id: 'stubborn', name: 'Itsepäinen', description: 'Saat -1 Sisukkuus.', benefit: 1 },
  { id: 'uncharismatic', name: 'Epäsuosittu', description: 'Saat -1 Karisma.', benefit: 1 },
  { id: 'phobia', name: 'Fobia', description: 'Sinulla on pelko tiettyä asiaa kohtaan.', benefit: 2 },
  { id: 'enemy', name: 'Vihollinen', description: 'Sinulla on henkilökohtainen vihollinen.', benefit: 2 },
  { id: 'poor', name: 'Köyhä', description: 'Saat vähemmän aloitusrahaa.', benefit: 2 },
  { id: 'outlaw', name: 'Lainsuojaton', description: 'Viranomaiset etsivät sinua.', benefit: 3 },
]

const starterEquipment: Equipment[] = [
  { id: 'backpack', name: 'Reppu', category: 'Varusteet', weight: 1, cost: 5, description: 'Tavallinen reppu.' },
  { id: 'waterskin', name: 'Juomaleili', category: 'Varusteet', weight: 1, cost: 2, description: 'Vesileili.' },
  { id: 'rations', name: 'Annos ruokaa', category: 'Ruoka', weight: 1, cost: 1, description: 'Yhden päivän annos.' },
  { id: 'torch', name: 'Soihtu', category: 'Varusteet', weight: 1, cost: 1, description: 'Valonlähde.' },
  { id: 'rope', name: 'Köysi', category: 'Varusteet', weight: 2, cost: 3, description: '10 metriä köyttä.' },
  { id: 'dagger', name: 'Tikari', category: 'Aseet', weight: 1, cost: 5, description: 'Pieni teräase.' },
]

export const useCharacterCreationStore = defineStore('characterCreation', {
  state: (): {
    currentStep: CharacterCreationStep
    draft: CharacterDraft
  } => {
    return {
      currentStep: 1,
      draft: {
        name: '',
        attributes: JSON.parse(JSON.stringify(defaultAttributes)) as Attr[],
        skills: [] as Skill[],
        background: null,
        advantages: [],
        disadvantages: [],
        subStats: null,
        equipment: [],
      },
    }
  },
  getters: {
    currentStepNum: (state) => state.currentStep,
    draftCharacter: (state) => state.draft,
    availableBackgrounds: () => backgrounds,
    availableAdvantages: () => advantages,
    availableDisadvantages: () => disadvantages,
    starterEquipment: () => starterEquipment,
    hasSelectedBackground: (state) => state.draft.background !== null,
    selectedAdvantages: (state) => state.draft.advantages,
    selectedDisadvantages: (state) => state.draft.disadvantages,
  },
  actions: {
    nextStep() {
      if (this.currentStep < 8) {
        this.currentStep++
      }
    },
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    goToStep(step: CharacterCreationStep) {
      this.currentStep = step
    },
    resetWizard() {
      this.currentStep = 1
      this.draft = {
        name: '',
        attributes: JSON.parse(JSON.stringify(defaultAttributes)) as Attr[],
        skills: [] as Skill[],
        background: null,
        advantages: [],
        disadvantages: [],
        subStats: null,
        equipment: [],
      }
    },
    setAttributes(attributes: Attr[]) {
      this.draft.attributes = attributes
    },
    setAttribute(name: string, value: number) {
      const attr = this.draft.attributes.find((a) => a.name === name)
      if (attr) {
        attr.value = value
      }
    },
    setBackground(background: Background) {
      this.draft.background = background
    },
    toggleAdvantage(advantage: Advantage) {
      const index = this.draft.advantages.findIndex((a) => a.id === advantage.id)
      if (index >= 0) {
        this.draft.advantages.splice(index, 1)
      } else {
        this.draft.advantages.push(advantage)
      }
    },
    toggleDisadvantage(disadvantage: Disadvantage) {
      const index = this.draft.disadvantages.findIndex((d) => d.id === disadvantage.id)
      if (index >= 0) {
        this.draft.disadvantages.splice(index, 1)
      } else {
        this.draft.disadvantages.push(disadvantage)
      }
    },
    setSubStats(subStats: SubStats) {
      this.draft.subStats = subStats
    },
    setSkills(skills: Skill[]) {
      this.draft.skills = skills
    },
    toggleEquipment(equipment: Equipment) {
      const index = this.draft.equipment.findIndex((e) => e.id === equipment.id)
      if (index >= 0) {
        this.draft.equipment.splice(index, 1)
      } else {
        this.draft.equipment.push(equipment)
      }
    },
    setName(name: string) {
      this.draft.name = name
    },
  },
})
