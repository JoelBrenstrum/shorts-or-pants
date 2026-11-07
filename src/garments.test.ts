import { describe, expect, it } from 'vitest'
import { PANTS, SHORTS } from './art'
import { hashString, pickIndex } from './garments'

describe('pickIndex', () => {
  it('stays within bounds', () => {
    for (const seed of ['a', 'b', 'shorts:2026-01-01', '']) {
      const i = pickIndex(seed, 4)
      expect(i).toBeGreaterThanOrEqual(0)
      expect(i).toBeLessThan(4)
    }
  })

  it('hashes to an unsigned 32-bit integer', () => {
    expect(hashString('hello')).toBe(hashString('hello'))
    expect(hashString('hello')).toBeGreaterThanOrEqual(0)
    expect(hashString('hello')).toBeLessThan(2 ** 32)
  })
})

describe('wardrobe', () => {
  it('has ten of each with unique names and notes', () => {
    expect(SHORTS).toHaveLength(10)
    expect(PANTS).toHaveLength(10)
    const names = [...SHORTS, ...PANTS].map((a) => a.name)
    expect(new Set(names).size).toBe(names.length)
    for (const art of [...SHORTS, ...PANTS]) expect(art.note).not.toBe('')
  })
})
