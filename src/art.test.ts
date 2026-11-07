import { describe, expect, it } from 'vitest'
import { LOCKED, PANTS, SHORTS } from './art'

describe('locked silhouettes', () => {
  it('give away nothing about the garments still to find', () => {
    for (const locked of Object.values(LOCKED)) {
      for (const art of [...SHORTS, ...PANTS]) {
        expect(locked).not.toContain(art.name)
        expect(locked).not.toBe(art.svg)
      }
    }
  })
})
