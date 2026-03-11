import { defineStore } from 'pinia'
import type { Skill, SkillBaseCode } from '@/types/skills'

const createSkill = (name: string, baseCode: SkillBaseCode): Skill => ({
  name,
  baseCode,
  bonus: 0,
  learned: false,
  backgroundSkill: false,
})

export const useSkillsStore = defineStore('skills', {
  state: () => ({
    skillList: [
      createSkill('Alkemia', 'ei'),
      createSkill('Erätaidot', 'val'),
      createSkill('Esiintyminen', 'kar'),
      createSkill('Haavojen hoito', 'val'),
      createSkill('Hallinto', 'val'),
      createSkill('Heittäminen', 'ket'),
      createSkill('Heraldiikka', 'ei'),
      createSkill('Hiivintä', 'ket'),
      createSkill('Historia', 'ei'),
      createSkill('Hyppy ja kiipeily', 'ket'),
      createSkill('Ihmistuntemus', 'val'),
      createSkill('Johtaminen', 'sis'),
      createSkill('Jouset', 'ket'),
      createSkill('Juonittelu', 'val'),
      createSkill('Kadut ja kapakat', 'val'),
      createSkill('Kaupanhieronta', 'kar'),
      createSkill('Kauppareitit', 'ei'),
      createSkill('Keihäät', 'ket'),
      createSkill('Kielitaito', 'ei'),
      createSkill('Kilvet', 'voi'),
      createSkill('Kirjat ja tieteet', 'ei'),
      createSkill('Kirottu maa', 'ei'),
      createSkill('Kovistelu', 'sis'),
      createSkill('Kädentaidot', 'ei'),
      createSkill('Laulu ja soitto', 'kar'),
      createSkill('Lukutaito', 'ei'),
      createSkill('Lyömäaseet', 'voi'),
      createSkill('Metsästys', 'val'),
      createSkill('Miekat', 'voi'),
      createSkill('Purjehdus', 'ei'),
      createSkill('Rakentaminen', 'ei'),
      createSkill('Ratsastus', 'ket'),
      createSkill('Runoniekka', 'kar'),
      createSkill('Salatieteet', 'ei'),
      createSkill('Sorminäppäryys', 'ei'),
      createSkill('Sotataito', 'val'),
      createSkill('Tappelu', 'erikois'),
      createSkill('Tarut ja legendat', 'ei'),
      createSkill('Tiirikointi', 'ei'),
      createSkill('Uhkapeli', 'val'),
      createSkill('Uiminen', 'voi'),
      createSkill('Uskonto', 'ei'),
      createSkill('Veitset', 'ket'),
      createSkill('Viettely', 'kar'),
      createSkill('Väistö', 'ket'),
      createSkill('Yrtit ja myrkyt', 'ei'),
    ] as Skill[],
  }),
  actions: {
    increaseBonus(name: string) {
      const skill = this.skillList.find((item) => item.name === name)
      if (!skill) return

      skill.bonus += 1
    },
    decreaseBonus(name: string) {
      const skill = this.skillList.find((item) => item.name === name)
      if (!skill || skill.bonus <= 0) return

      skill.bonus -= 1
    },
  },
})

