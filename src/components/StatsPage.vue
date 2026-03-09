<script setup lang="ts">
import { useStatsStore } from '@/stores/stats'
import NameComponent from './NameComponent.vue'
import SkillsList from './SkillsList.vue'

const statsStore = useStatsStore()

const setNewAttr = (name: string, event: InputEvent) => {
  const target = event.target as HTMLInputElement | null
  if (!target) return

  const parsed = Number.parseInt(target.value, 10)
  if (Number.isNaN(parsed)) return

  statsStore.setVal(name, parsed)
}
</script>

<template>
  <NameComponent />
  <div class="container">
    <div class="columns mt-3 ml-3 mr-3 mb-3">
      <div class="column is-half">
        <div class="columns is-multiline">
          <template v-for="attr in statsStore.attList" :key="attr.name">
            <div class="column is-half">
              <div class="columns is-flex-direction-row">
                <div class="column has-text-right">
                  <p>{{ attr.name }}</p>
                </div>
                <div class="column">
                  <input
                    class="has-text-centered stat-input"
                    type="number"
                    :value="attr.value"
                    @input="(event) => setNewAttr(attr.name, event as InputEvent)"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="column is-half">
        <SkillsList />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-input {
  width: 3rem;
  background-color: grey;
  border-radius: 20px;
  height: 2rem;
}

div .has-text-right {
  display: flex;
  justify-content: flex-end;
}

p {
  font-size: larger;
  margin-top: 0.3rem;
  padding-right: 0.5rem;
}
</style>

