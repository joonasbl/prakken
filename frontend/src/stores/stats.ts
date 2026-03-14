import { defineStore } from 'pinia'
import { type Attr } from '../types/attributes'

export const useStatsStore = defineStore('attributes', {
  state: () => {
    return {
      attList: [
        { name: 'Voima', value: 10 },
        { name: 'Terveys', value: 10 },
        { name: 'Ketteryys', value: 10 },
        { name: 'Valppaus', value: 10 },
        { name: 'Sisukkuus', value: 10 },
        { name: 'Karisma', value: 10 },
      ] as Attr[],
    }
  },
  actions: {
    setVal(name: string, val: number) {
      this.attList.forEach((elem) => {
        if (elem.name == name) {
          elem.value = val
        }
      })
    },
  },
})
