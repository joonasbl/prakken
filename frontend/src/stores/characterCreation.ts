import { defineStore } from 'pinia'
import type { Attr } from '@/types/attributes'
import type { LearnedSkill } from '@/types/skills'
import type {
  Background,
  Advantage,
  Disadvantage,
  SubStats,
  Equipment,
  CharacterDraft,
  CharacterCreationStep,
  AdvantageEffect,
  DisadvantageEffect,
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
    id: 'aatelinen',
    name: 'Aatelinen',
    description: 'Olet syntynyt ylempään säätyyn ja nautit etuoikeuksista.',
    statBonuses: { Karisma: 2 },
    skillBonuses: { 'Heraldiikka': 0, 'Kilvet': 0, 'Lukutaito': 0, 'Ratsastus': 0, 'Uskonto': 0, 'Veitset': 0, 'Väistö': 0 },
  },
  {
    id: 'ritari',
    name: 'Ritari',
    description: 'Olet koulutettu taistelemaan ratsailta.',
    statBonuses: { Karisma: 1, Voima: 1 },
    skillBonuses: { 'Heraldiikka': 0, 'Keihäät': 0, 'Kilvet': 0, 'Miekat': 0, 'Ratsastus': 0, 'Sotataito': 0, 'Väistö': 0 },
  },
  {
    id: 'pappi',
    name: 'Pappi',
    description: 'Olet omistautunut uskonnolliselle palvelukselle.',
    statBonuses: { Karisma: 1, Valppaus: 1 },
    skillBonuses: { 'Esiintyminen': 0, 'Haavojen hoito': 0, 'Historia': 0, 'Kilvet': 0, 'Uskonto': 0, 'Lukutaito': 0, 'Väistö': 0 },
  },
  {
    id: 'porvari',
    name: 'Porvari',
    description: 'Olet varakas kaupunkilainen.',
    statBonuses: { Sisukkuus: 1, Valppaus: 1 },
    skillBonuses: { 'Esiintyminen': 0, 'Kaupanhieronta': 0, 'Kauppareitit': 0, 'Kilvet': 0, 'Lukutaito': 0, 'Veitset': 0, 'Väistö': 0 },
  },
  {
    id: 'kaupunkilainen',
    name: 'Kaupunkilainen',
    description: 'Asut kaupungissa ja elät työlläsi.',
    statBonuses: {},
    skillBonuses: { 'Esiintyminen': 0, 'Ihmistuntemus': 0, 'Kadut ja kapakat': 0, 'Kaupanhieronta': 0, 'Kilvet': 0, 'Kädentaidot': 0, 'Tappelu': 0, 'Veitset': 0, 'Väistö': 0 },
  },
  {
    id: 'maalainen',
    name: 'Maalainen',
    description: 'Asut maalla ja elät maanviljelyllä.',
    statBonuses: { Terveys: 1 },
    skillBonuses: { 'Haavojen hoito': 0, 'Kilvet': 0, 'Kädentaidot': 0, 'Lyömäaseet': 0, 'Tappelu': 0, 'Väistö': 0 },
  },
  {
    id: 'irtolainen',
    name: 'Irtolainen',
    description: 'Vaellat paikasta toiseen ilman kiinteää kotia.',
    statBonuses: {},
    skillBonuses: { 'Haavojen hoito': 0, 'Hiivintä': 0, 'Kadut ja kapakat': 0, 'Kaupanhieronta': 0, 'Kilvet': 0, 'Sorminäppäryys': 0, 'Tappelu': 0, 'Uhkapeli': 0, 'Väistö': 0 },
  },
  {
    id: 'rosvo',
    name: 'Rosvo',
    description: 'Elät ryöstämällä ja varastamalla.',
    statBonuses: {},
    skillBonuses: { 'Erätaidot': 0, 'Haavojen hoito': 0, 'Hiivintä': 0, 'Kilvet': 0, 'Kovistelu': 0, 'Lyömäaseet': 0, 'Tappelu': 0, 'Uhkapeli': 0, 'Väistö': 0 },
  },
  {
    id: 'paimentolainen',
    name: 'Paimentolainen',
    description: 'Vaellat laumojesi kanssa paikasta toiseen.',
    statBonuses: { Ketteryys: 2, Sisukkuus: 1, Karisma: -1 },
    skillBonuses: { 'Haavojen hoito': 0, 'Heittäminen': 0, 'Keihäät': 0, 'Kilvet': 0, 'Kirottu maa': 0, 'Ratsastus': 0, 'Tarut ja legendat': 0, 'Väistö': 0 },
  },
  {
    id: 'vuoristolainen',
    name: 'Vuoristolainen',
    description: 'Asut vuoristossa ja olet tottunut vaikeaan maastoon.',
    statBonuses: { Voima: 2, Terveys: 1, Ketteryys: -1 },
    skillBonuses: { 'Hyppy ja kiipeily': 0, 'Kilvet': 0, 'Erätaidot': 0, 'Kädentaidot': 0, 'Kovistelu': 0, 'Lyömäaseet': 0, 'Tappelu': 0, 'Uiminen': 0, 'Väistö': 0 },
  },
  {
    id: 'metsalainen',
    name: 'Metsäläinen',
    description: 'Asut syvällä metsässä ja elät metsän antimilla.',
    statBonuses: { Valppaus: 2, Ketteryys: 1, Karisma: -1 },
    skillBonuses: { 'Erätaidot': 0, 'Hiivintä': 0, 'Jouset': 0, 'Kilvet': 0, 'Metsästys': 0, 'Sorminäppäryys': 0, 'Veitset': 0, 'Väistö': 0, 'Yrtit ja myrkyt': 0 },
  },
]

const advantages: Advantage[] = [
  { id: 'aarre', name: 'Aarre', description: 'Sinulla on arvokas aarre tai esine.', cost: 2 },
  { id: 'alkemisti', name: 'Alkemisti', description: 'Osaat valmistaa alkemistisia aineita.', cost: 2 },
  { id: 'asiantuntija', name: 'Asiantuntija', description: 'Olet erityisen taitava yhdellä alalla.', cost: 1 },
  { id: 'elainkuiskaaja', name: 'Eläinkuiskaaja', description: 'Sinulla on erityinen side eläimiin.', cost: 2 },
  { id: 'haukankatse', name: 'Haukankatse', description: 'Näet erinomaisen hyvin kauas.', cost: 1 },
  { id: 'huuliltalukija', name: 'Huuliltalukija', description: 'Ymmärrät puhetta huulilta lukemalla.', cost: 1 },
  { id: 'hyvaimaineinen', name: 'Hyvämaineinen', description: 'Sinulla on hyvä maine yhteisössä.', cost: 1 },
  { id: 'ika_ja_kokemus', name: 'Ikä ja kokemus', description: 'Vuodet ovat tuoneet viisautta.', cost: 2, effect: { type: 'skillPoints', value: 120 } as AdvantageEffect, conflicts: ['nuori'] },
  { id: 'jaaverinen', name: 'Jääverinen', description: 'Kylmyys ei haittaa sinua.', cost: 1 },
  { id: 'kahlekuningas', name: 'Kahlekuningas', description: 'Olet taitava vapautumaan sidoksista.', cost: 1 },
  { id: 'kaunis', name: 'Kaunis', description: 'Ulkonäkösi avaa ovia.', cost: 1 },
  { id: 'kissajalat', name: 'Kissajalat', description: 'Putoat aina jaloillesi.', cost: 1 },
  { id: 'kookas', name: 'Kookas', description: 'Olet pitkä ja vaikuttava.', cost: 1, effect: { type: 'substat', stat: 'syvaHaava', value: 2 } as AdvantageEffect, conflicts: ['hentoluinen'] },
  { id: 'kovanaama', name: 'Kovanaama', description: 'Kestät kipua hyvin.', cost: 2 },
  { id: 'lahjakas', name: 'Lahjakas', description: 'Valitse kaksi ominaisuutta ja saat +1 niihin.', cost: 2, effect: { type: 'attributeChoice', count: 2, value: 1 } as AdvantageEffect },
  { id: 'laskupaa', name: 'Laskupää', description: 'Olet nopea laskemaan.', cost: 1 },
  { id: 'lemmikki', name: 'Lemmikki', description: 'Sinulla on uskollinen eläinkumppani.', cost: 1 },
  { id: 'nopea', name: 'Nopea', description: 'Olet erityisen nopea liikkeissäsi.', cost: 2 },
  { id: 'onnekas', name: 'Onnekas', description: 'Onni on usein puolellasi.', cost: 3 },
  { id: 'ottolapsi', name: 'Ottolapsi', description: 'Sinulla on rakastava adoptioperhe.', cost: 1 },
  { id: 'raudanvatsa', name: 'Rautavatsa', description: 'Vatsasi kestää mitä tahansa.', cost: 1 },
  { id: 'rohkea', name: 'Rohkea', description: 'Pelko ei tunne sinulle tietä.', cost: 1 },
  { id: 'sitkea', name: 'Sitkeä', description: '+5 veripistettä.', cost: 3, effect: { type: 'substat', stat: 'veripisteet', value: 5 } as AdvantageEffect },
  { id: 'suhteita', name: 'Suhteita', description: 'Tunnet tärkeitä henkilöitä.', cost: 2 },
  { id: 'sukeltaja', name: 'Sukeltaja', description: 'Pystyt pidättämään hengitystäsi pitkään.', cost: 1 },
  { id: 'suuntavaisto', name: 'Suuntavaisto', description: 'Et eksy koskaan.', cost: 1 },
  { id: 'tarkkakorvainen', name: 'Tarkkakorvainen', description: 'Kuulosi ovat erinomaiset.', cost: 1 },
  { id: 'tarkkamuistinen', name: 'Tarkkamuistinen', description: 'Muistisi on valokuvaava.', cost: 2 },
  { id: 'uhkaava', name: 'Uhkaava', description: 'Ulkonäkösi saa muut arastelemaan.', cost: 1 },
  { id: 'vaikukoira', name: 'Vaikukoira', description: 'Olet hyvä vaikuttamaan ihmisiin.', cost: 2 },
  { id: 'vaisto', name: 'Vaisto', description: 'Sinulla on hyvä kuudes aisti.', cost: 2 },
  { id: 'valevainu', name: 'Valevainu', description: 'Haistat valheen heti.', cost: 2 },
  { id: 'velhonverta', name: 'Velhonverta', description: 'Suonissasi virtaa maagista verta.', cost: 3 },
  { id: 'viinapaa', name: 'Viinapää', description: 'Kestät alkoholia hyvin.', cost: 1 },
  { id: 'ystava', name: 'Ystävä', description: 'Sinulla on erityisen hyvä ystävä.', cost: 1 },
  { id: 'yosilmat', name: 'Yösilmät', description: 'Näet pimeässä kuin päivällä.', cost: 2 },
]

const disadvantages: Disadvantage[] = [
  { id: 'ahne', name: 'Ahne', description: 'Haluat aina enemmän.', benefit: 1 },
  { id: 'arpi', name: 'Arpi', description: 'Sinulla on näkyvä arpi.', benefit: 1 },
  { id: 'hentoluinen', name: 'Hentoluinen', description: 'Luisi ovat hauraat.', benefit: 2, effect: { type: 'substat', stat: 'syvaHaava', value: -2 } as DisadvantageEffect, conflicts: ['kookas'] },
  { id: 'hidas', name: 'Hidas', description: 'Liikut hitaammin kuin muut.', benefit: 2 },
  { id: 'huono_kuulo', name: 'Huono kuulo', description: 'Kuulosi ovat heikot.', benefit: 1 },
  { id: 'hamarasokea', name: 'Hämäräsokea', description: 'Et näe hämärässä kunnolla.', benefit: 1 },
  { id: 'irstas', name: 'Irstas', description: 'Elät liioitellusti.', benefit: 1 },
  { id: 'juoppo', name: 'Juoppo', description: 'Olet riippuvainen alkoholista.', benefit: 2 },
  { id: 'kammo', name: 'Kammo', description: 'Sinulla on voimakas fobia.', benefit: 2 },
  { id: 'kostonhimoinen', name: 'Kostonhimoinen', description: 'Et unohda eikä anna.', benefit: 1 },
  { id: 'kunniallinen', name: 'Kunniallinen', description: 'Kunniasi on sinulle kaikki.', benefit: 1 },
  { id: 'kasipuoli', name: 'Käsipuoli', description: 'Toinen kätesi on heikompi.', benefit: 1 },
  { id: 'kaapyio', name: 'Kääpiö', description: 'Olet lyhytkasvuinen.', benefit: 1 },
  { id: 'lainsuojaton', name: 'Lainsuojaton', description: 'Viranomaiset etsivät sinua.', benefit: 3 },
  { id: 'lahinakoinen', name: 'Lähinäköinen', description: 'Et näe kauas kunnolla.', benefit: 1 },
  { id: 'lahimmaisia', name: 'Lähimmäisiä', description: 'Autat aina muita.', benefit: 1 },
  { id: 'muotopuoli', name: 'Muotopuoli', description: 'Sinulla on synnynnäinen vika.', benefit: 2 },
  { id: 'mykka', name: 'Mykkä', description: 'Et pysty puhumaan.', benefit: 3 },
  { id: 'nuori', name: 'Nuori', description: 'Olet kokematon.', benefit: 1, effect: { type: 'skillPoints', value: 70 } as DisadvantageEffect, conflicts: ['ika_ja_kokemus'] },
  { id: 'oikku', name: 'Oikku', description: 'Mielialasi vaihtelevat.', benefit: 1 },
  { id: 'pahamaineinen', name: 'Pahamaineinen', description: 'Maineesi on huono.', benefit: 2 },
  { id: 'painajaisia', name: 'Painajaisia', description: 'Kärsit yököisistä unista.', benefit: 1 },
  { id: 'peluri', name: 'Peluri', description: 'Olet koukussa uhkapeleihin.', benefit: 2 },
  { id: 'rampa', name: 'Rampa', description: 'Sinulla on liikuntarajoite.', benefit: 3 },
  { id: 'rasisti', name: 'Rasisti', description: 'Suhtaudut ennakkoluuloisesti muihin.', benefit: 2 },
  { id: 'riippuvuus', name: 'Riippuvuus', description: 'Olet riippuvainen aineesta.', benefit: 3 },
  { id: 'silmapuoli', name: 'Silmäpuoli', description: 'Toinen silmäsi on sokea.', benefit: 2 },
  { id: 'taikauskoinen', name: 'Taikauskoinen', description: 'Uskot taikauskomuksiin.', benefit: 1 },
  { id: 'tuntomerkki', name: 'Tuntomerkki', description: 'Sinut tunnistaa helposti.', benefit: 1 },
  { id: 'uninen', name: 'Uninen', description: 'Tarvitset paljon unta.', benefit: 1 },
  { id: 'uskovainen', name: 'Uskovainen', description: 'Uskosi on horjumaton.', benefit: 1 },
  { id: 'vallanahne', name: 'Vallanahne', description: 'Haluat aina enemmän valtaa.', benefit: 2 },
  { id: 'vasalli', name: 'Vasalli', description: 'Olet sidottu herraasi.', benefit: 2 },
  { id: 'velkaa', name: 'Velkaa', description: 'Sinulla on suuria velkoja.', benefit: 2 },
  { id: 'vihollinen', name: 'Vihollinen', description: 'Sinulla on henkilökohtainen vihollinen.', benefit: 2 },
  { id: 'akkipikainen', name: 'Äkkipikainen', description: 'Suutut helposti.', benefit: 1 },
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
    attributeChoices: Record<string, number>
  } => {
    return {
      currentStep: 1,
      draft: {
        name: '',
        attributes: JSON.parse(JSON.stringify(defaultAttributes)) as Attr[],
        learnedSkills: [] as LearnedSkill[],
        background: null,
        advantages: [],
        disadvantages: [],
        subStats: null,
        equipment: [],
      },
      attributeChoices: {},
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
    skillPointLimit: (state): number => {
      let base = 100
      for (const adv of state.draft.advantages) {
        if (adv.effect?.type === 'skillPoints') {
          base = adv.effect.value
        }
      }
      for (const dis of state.draft.disadvantages) {
        if (dis.effect?.type === 'skillPoints') {
          base = dis.effect.value
        }
      }
      return base
    },
    substatModifiers: (state): { veripisteet: number; syvaHaava: number } => {
      let veripisteet = 0
      let syvaHaava = 0
      for (const adv of state.draft.advantages) {
        if (adv.effect?.type === 'substat') {
          if (adv.effect.stat === 'veripisteet') veripisteet += adv.effect.value
          if (adv.effect.stat === 'syvaHaava') syvaHaava += adv.effect.value
        }
      }
      for (const dis of state.draft.disadvantages) {
        if (dis.effect?.type === 'substat') {
          if (dis.effect.stat === 'veripisteet') veripisteet += dis.effect.value
          if (dis.effect.stat === 'syvaHaava') syvaHaava += dis.effect.value
        }
      }
      return { veripisteet, syvaHaava }
    },
    attributeChoiceBonus: (state): Record<string, number> => {
      const bonus: Record<string, number> = {}
      for (const [attrName, value] of Object.entries(state.attributeChoices)) {
        bonus[attrName] = (bonus[attrName] || 0) + value
      }
      return bonus
    },
    effectiveAttributes: (state): Attr[] => {
      const baseAttrs = state.draft.attributes.map((attr) => ({ ...attr }))
      const background = state.draft.background
      const attributeChoices = state.attributeChoices

      // Apply background bonuses
      if (background) {
        for (const [attrName, bonus] of Object.entries(background.statBonuses)) {
          const attr = baseAttrs.find((a) => a.name === attrName)
          if (attr) {
            attr.value += bonus
          }
        }
      }

      // Apply Lahjakas bonuses
      for (const [attrName, bonus] of Object.entries(attributeChoices)) {
        const attr = baseAttrs.find((a) => a.name === attrName)
        if (attr && bonus > 0) {
          attr.value += bonus
        }
      }

      return baseAttrs
    },
    pendingAttributeChoices: (state): number => {
      const lahjakas = state.draft.advantages.find((a) => a.id === 'lahjakas')
      if (!lahjakas || !lahjakas.effect || lahjakas.effect.type !== 'attributeChoice') {
        return 0
      }
      const totalChoices = lahjakas.effect.count
      const usedChoices = Object.values(state.attributeChoices).reduce((sum, v) => sum + v, 0)
      return totalChoices - usedChoices
    },
    hasConflictingAdvantage: (state) => (advantageId: string): string | null => {
      const adv = advantages.find((a) => a.id === advantageId)
      if (!adv?.conflicts) return null
      for (const conflictId of adv.conflicts) {
        if (state.draft.disadvantages.some((d) => d.id === conflictId)) {
          const conflict = disadvantages.find((d) => d.id === conflictId)
          return conflict?.name || null
        }
      }
      return null
    },
    hasConflictingDisadvantage: (state) => (disadvantageId: string): string | null => {
      const dis = disadvantages.find((d) => d.id === disadvantageId)
      if (!dis?.conflicts) return null
      for (const conflictId of dis.conflicts) {
        if (state.draft.advantages.some((a) => a.id === conflictId)) {
          const conflict = advantages.find((a) => a.id === conflictId)
          return conflict?.name || null
        }
      }
      return null
    },
    isAdvAdvantageBalanced: (state): boolean => {
      return state.draft.advantages.length === state.draft.disadvantages.length
    },
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
        learnedSkills: [] as LearnedSkill[],
        background: null,
        advantages: [],
        disadvantages: [],
        subStats: null,
        equipment: [],
      }
      this.attributeChoices = {}
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
        // Clear attribute choices if removing Lahjakas
        if (advantage.id === 'lahjakas') {
          this.attributeChoices = {}
        }
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
    setAttributeChoice(attrName: string, value: number) {
      if (value <= 0) {
        delete this.attributeChoices[attrName]
      } else {
        this.attributeChoices[attrName] = value
      }
    },
    clearAttributeChoices() {
      this.attributeChoices = {}
    },
    setSubStats(subStats: SubStats) {
      this.draft.subStats = subStats
    },
    setLearnedSkills(learnedSkills: LearnedSkill[]) {
      this.draft.learnedSkills = learnedSkills
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
