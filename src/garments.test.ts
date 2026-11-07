import { describe, expect, it } from 'vitest'
import { PANTS, SHORTS } from './art'
import { hashString, pickArt, pickIndex } from './garments'

describe('pickArt', () => {
  it('is stable for the same seed', () => {
    expect(pickArt('shorts', '2026-11-08')).toBe(pickArt('shorts', '2026-11-08'))
  })

  it('picks from the matching collection', () => {
    expect(SHORTS).toContain(pickArt('shorts', 'x'))
    expect(PANTS).toContain(pickArt('pants', 'x'))
  })

  it('spreads across the collection over a month of days', () => {
    const picks = new Set(Array.from({ length: 30 }, (_, d) => pickArt('shorts', `2026-11-${d}`).name))
    expect(picks.size).toBe(SHORTS.length)
  })
})

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
