import { describe, it, expect } from 'vitest'

describe('Derived Stats Calculations', () => {
  describe('Veripisteet (Hit Points)', () => {
    const calculateVeripisteet = (terveys: number): number => {
      if (terveys === 1) return 10
      if (terveys <= 3) return 11
      if (terveys <= 5) return 12
      if (terveys <= 7) return 13
      if (terveys <= 9) return 14
      if (terveys <= 11) return 15
      if (terveys <= 13) return 16
      if (terveys <= 15) return 17
      if (terveys <= 17) return 18
      if (terveys <= 19) return 19
      return 20
    }

    it('calculates hit points for low Terveys', () => {
      expect(calculateVeripisteet(1)).toBe(10)
      expect(calculateVeripisteet(2)).toBe(11)
      expect(calculateVeripisteet(3)).toBe(11)
    })

    it('calculates hit points for medium Terveys', () => {
      expect(calculateVeripisteet(10)).toBe(15)
      expect(calculateVeripisteet(11)).toBe(15)
      expect(calculateVeripisteet(12)).toBe(16)
    })

    it('calculates hit points for high Terveys', () => {
      expect(calculateVeripisteet(20)).toBe(20)
      expect(calculateVeripisteet(19)).toBe(19)
    })
  })

  describe('Vauriobonus (Damage Bonus)', () => {
    const calculateVauriobonus = (voima: number): number => {
      if (voima <= 5) return -2
      if (voima <= 9) return -1
      if (voima <= 14) return 0
      if (voima <= 17) return 1
      if (voima <= 19) return 2
      return 3
    }

    it('calculates negative damage bonus for low Voima', () => {
      expect(calculateVauriobonus(5)).toBe(-2)
      expect(calculateVauriobonus(6)).toBe(-1)
      expect(calculateVauriobonus(9)).toBe(-1)
    })

    it('calculates zero damage bonus for average Voima', () => {
      expect(calculateVauriobonus(10)).toBe(0)
      expect(calculateVauriobonus(14)).toBe(0)
    })

    it('calculates positive damage bonus for high Voima', () => {
      expect(calculateVauriobonus(15)).toBe(1)
      expect(calculateVauriobonus(18)).toBe(2)
      expect(calculateVauriobonus(20)).toBe(3)
    })
  })

  describe('Syvä haava (Severe Wound Threshold)', () => {
    const calculateSyvaHaava = (voima: number, terveys: number): number => {
      const sum = voima + terveys
      if (sum <= 10) return 5
      if (sum <= 17) return 6
      if (sum <= 24) return 7
      if (sum <= 31) return 8
      if (sum <= 38) return 9
      return 10
    }

    it('calculates severe wound for low stats', () => {
      expect(calculateSyvaHaava(5, 5)).toBe(5)
      expect(calculateSyvaHaava(10, 10)).toBe(7)  // sum = 20, which is in 18-24 range
    })

    it('calculates severe wound for medium stats', () => {
      expect(calculateSyvaHaava(12, 12)).toBe(7)
      expect(calculateSyvaHaava(15, 15)).toBe(8)
    })

    it('calculates severe wound for high stats', () => {
      expect(calculateSyvaHaava(20, 20)).toBe(10)
      expect(calculateSyvaHaava(18, 18)).toBe(9)
    })
  })

  describe('Kantokyky (Carrying Capacity)', () => {
    const calculateKantokyky = (voima: number): number => {
      return voima * 20
    }

    it('calculates carrying capacity', () => {
      expect(calculateKantokyky(10)).toBe(200)
      expect(calculateKantokyky(15)).toBe(300)
      expect(calculateKantokyky(20)).toBe(400)
    })
  })

  describe('Attribute Modifier', () => {
    const calculateModifier = (attribute: number): number => {
      return Math.floor((attribute - 10) / 2)
    }

    it('calculates positive modifiers', () => {
      expect(calculateModifier(12)).toBe(1)
      expect(calculateModifier(14)).toBe(2)
      expect(calculateModifier(16)).toBe(3)
    })

    it('calculates negative modifiers', () => {
      expect(calculateModifier(8)).toBe(-1)
      expect(calculateModifier(6)).toBe(-2)
      expect(calculateModifier(4)).toBe(-3)
    })

    it('calculates zero modifier for average', () => {
      expect(calculateModifier(10)).toBe(0)
      expect(calculateModifier(11)).toBe(0)
    })
  })
})
