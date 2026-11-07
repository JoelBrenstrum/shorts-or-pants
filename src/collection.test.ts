import { describe, expect, it } from 'vitest'
import { choose, emptyCollection, isFresh, parseCollection, unlockOrder, type Collection } from './collection'

const SHORTS = ['Cargo', 'Board', 'Bike', 'Swim']
const PANTS = ['Chinos', 'Joggers']

describe('choose', () => {
  it('unlocks the first garment in a stable order on a first visit', () => {
    const { name, collection, changed } = choose(emptyCollection(), 'shorts', '2026-11-08', SHORTS)
    expect(name).toBe(unlockOrder(SHORTS)[0])
    expect(changed).toBe(true)
    expect(collection.unlocked).toEqual([name])
    expect(isFresh(collection, name, '2026-11-08')).toBe(true)
  })

  it('keeps the same pick for the rest of the day', () => {
    const first = choose(emptyCollection(), 'shorts', '2026-11-08', SHORTS)
    const again = choose(first.collection, 'shorts', '2026-11-08', SHORTS)
    expect(again.name).toBe(first.name)
    expect(again.changed).toBe(false)
    expect(again.collection).toBe(first.collection)
  })

  it('unlocks something new each day until the set is complete', () => {
    let collection: Collection = emptyCollection()
    const seen: string[] = []
    for (let d = 1; d <= SHORTS.length; d++) {
      const result = choose(collection, 'shorts', `2026-11-0${d}`, SHORTS)
      seen.push(result.name)
      collection = result.collection
    }
    expect(new Set(seen).size).toBe(SHORTS.length)
    expect([...collection.unlocked].sort()).toEqual([...SHORTS].sort())
  })

  it('falls back to a repeat pick once everything is collected', () => {
    const complete: Collection = { ...emptyCollection(), unlocked: [...SHORTS] }
    const { name, collection } = choose(complete, 'shorts', '2026-12-01', SHORTS)
    expect(SHORTS).toContain(name)
    expect(isFresh(collection, name, '2026-12-01')).toBe(false)
  })

  it('tracks shorts and pants picks separately on the same day', () => {
    const shorts = choose(emptyCollection(), 'shorts', '2026-11-08', SHORTS)
    const pants = choose(shorts.collection, 'pants', '2026-11-08', PANTS)
    expect(pants.collection.picks).toEqual({ shorts: shorts.name, pants: pants.name })
    expect(pants.collection.unlocked).toEqual([shorts.name, pants.name])
    expect(pants.collection.fresh).toEqual([shorts.name, pants.name])
  })

  it('clears yesterday’s picks and new flags on a new day', () => {
    const yesterday = choose(emptyCollection(), 'shorts', '2026-11-08', SHORTS)
    const today = choose(yesterday.collection, 'pants', '2026-11-09', PANTS)
    expect(today.collection.picks).toEqual({ pants: today.name })
    expect(isFresh(today.collection, yesterday.name, '2026-11-09')).toBe(false)
  })

  it('ignores a stored pick that is no longer in the collection', () => {
    const stale: Collection = { ...emptyCollection(), date: '2026-11-08', picks: { shorts: 'Retired' } }
    expect(SHORTS).toContain(choose(stale, 'shorts', '2026-11-08', SHORTS).name)
  })
})

describe('parseCollection', () => {
  it('round-trips a stored collection', () => {
    const { collection } = choose(emptyCollection(), 'shorts', '2026-11-08', SHORTS)
    expect(parseCollection(JSON.parse(JSON.stringify(collection)))).toEqual(collection)
  })

  it('recovers from junk', () => {
    expect(parseCollection(null)).toEqual(emptyCollection())
    expect(parseCollection({ unlocked: [1, 'Cargo'], picks: { shorts: 3 }, date: 5 })).toEqual({
      unlocked: ['Cargo'],
      date: '',
      picks: {},
      fresh: [],
    })
  })
})
