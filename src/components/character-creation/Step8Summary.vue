<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterCreationStore } from '@/stores/characterCreation'
import type { SkillBaseCode } from '@/types/skills'

const emit = defineEmits<{
  save: []
}>()

const wizardStore = useCharacterCreationStore()

const baseCodeToAttributeName: Record<SkillBaseCode, string | null> = {
  voi: 'Voima',
  val: 'Valppaus',
  kar: 'Karisma',
  ket: 'Ketteryys',
  sis: 'Sisukkuus',
  ei: null,
  erikois: null,
}

const skillsWithLevels = computed(() =>
  wizardStore.draft.skills
    .filter((skill) => skill.learned)
    .map((skill) => {
      const attributeName = baseCodeToAttributeName[skill.baseCode]
      const attribute =
        attributeName != null
          ? wizardStore.draft.attributes.find((attr) => attr.name === attributeName)
          : undefined

      const baseLevel = attribute ? Math.ceil(attribute.value / 2) : 6
      const level = baseLevel + skill.bonus

      return { ...skill, level, baseLabel: attributeName }
    }),
)

const totalEquipmentWeight = computed(() =>
  wizardStore.draft.equipment.reduce((sum, e) => sum + e.weight, 0)
)

const handleSave = () => {
  emit('save')
}
</script>

<template>
  <div class="summary-step">
    <div class="card mb-4">
      <div class="card-content">
        <div class="is-size-4 has-text-weight-bold mb-2" style="font-family: 'MedievalSharp', cursive;">Hahmon nimi</div>
        <p class="title is-3 has-text-info">{{ wizardStore.draft.name }}</p>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Ominaisuudet</div>
        <div class="columns is-multiline">
          <div class="column is-4" v-for="attr in wizardStore.draft.attributes" :key="attr.name">
            <div class="box has-text-centered p-3">
              <div class="is-size-7 has-text-grey mb-1">{{ attr.name }}</div>
              <div class="is-size-4 has-text-weight-bold has-text-dark">{{ attr.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.background">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Tausta</div>
        <p class="subtitle is-5 mb-2">{{ wizardStore.draft.background.name }}</p>
        <p class="content has-text-grey-dark">{{ wizardStore.draft.background.description }}</p>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.advantages.length > 0">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Edut</div>
        <div class="tags are-medium">
          <span class="tag is-success is-light" v-for="adv in wizardStore.draft.advantages" :key="adv.id">
            {{ adv.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.disadvantages.length > 0">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Haitat</div>
        <div class="tags are-medium">
          <span class="tag is-danger is-light" v-for="dis in wizardStore.draft.disadvantages" :key="dis.id">
            {{ dis.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.subStats">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Johdannaiset</div>
        <div class="columns is-multiline">
          <div class="column is-3">
            <div class="box has-text-centered p-3">
              <div class="is-size-7 has-text-grey mb-1">Veripisteet</div>
              <div class="is-size-4 has-text-weight-bold has-text-success">{{ wizardStore.draft.subStats.veripisteet }}</div>
            </div>
          </div>
          <div class="column is-3">
            <div class="box has-text-centered p-3">
              <div class="is-size-7 has-text-grey mb-1">Vauriobonus</div>
              <div class="is-size-4 has-text-weight-bold has-text-success">{{ wizardStore.draft.subStats.vauriobonus }}</div>
            </div>
          </div>
          <div class="column is-3">
            <div class="box has-text-centered p-3">
              <div class="is-size-7 has-text-grey mb-1">Syvä haava</div>
              <div class="is-size-4 has-text-weight-bold has-text-success">{{ wizardStore.draft.subStats.syvaHaava }}</div>
            </div>
          </div>
          <div class="column is-3">
            <div class="box has-text-centered p-3">
              <div class="is-size-7 has-text-grey mb-1">Kantokyky</div>
              <div class="is-size-4 has-text-weight-bold has-text-success">{{ wizardStore.draft.subStats.kantokyky }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="skillsWithLevels.length > 0">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Taidot ({{ skillsWithLevels.length }} opittu)</div>
        <div class="columns is-multiline">
          <div class="column is-4" v-for="skill in skillsWithLevels" :key="skill.name">
            <div class="box p-3">
              <div class="is-size-7 has-text-grey">{{ skill.name }}</div>
              <div class="is-size-5 has-text-weight-bold has-text-success">{{ skill.level }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="wizardStore.draft.equipment.length > 0">
      <div class="card-content">
        <div class="is-size-5 has-text-weight-bold mb-3" style="font-family: 'MedievalSharp', cursive;">Varusteet ({{ wizardStore.draft.equipment.length }} kpl, {{ totalEquipmentWeight }} kg)</div>
        <ul class="content">
          <li v-for="item in wizardStore.draft.equipment" :key="item.id">
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>

    <div class="has-text-centered mt-6">
      <button type="button" class="button is-success is-large is-rounded" @click="handleSave">
        <span class="icon"><i class="fas fa-save"></i></span>
        <span>Tallenna hahmo</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.summary-step {
  max-width: 900px;
  margin: 0 auto;
}
</style>
