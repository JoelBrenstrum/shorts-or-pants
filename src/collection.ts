import { hashString, pickIndex } from './garments'
import type { Garment } from './verdict'

export const COLLECTION_KEY = 'sop:wardrobe'

export interface Collection {
  unlocked: string[]
  date: string
  picks: Partial<Record<Garment, string>>
  fresh: string[]
}

export interface Choice {
  name: string
  collection: Collection
  changed: boolean
}

export function emptyCollection(): Collection {
  return { unlocked: [], date: '', picks: {}, fresh: [] }
}

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [])

export function parseCollection(raw: unknown): Collection {
  if (!raw || typeof raw !== 'object') return emptyCollection()
  const r = raw as Record<string, unknown>
  const picks = r.picks && typeof r.picks === 'object' ? (r.picks as Record<string, unknown>) : {}
  return {
    unlocked: strings(r.unlocked),
    date: typeof r.date === 'string' ? r.date : '',
    picks: {
      ...(typeof picks.shorts === 'string' ? { shorts: picks.shorts } : {}),
      ...(typeof picks.pants === 'string' ? { pants: picks.pants } : {}),
    },
    fresh: strings(r.fresh),
  }
}

const SEAL_KEY = 'legs-out-dont-be-a-hero'

const scramble = (text: string) =>
  Array.from(text, (c, i) => String.fromCharCode(c.charCodeAt(0) ^ SEAL_KEY.charCodeAt(i % SEAL_KEY.length))).join('')

const checksum = (body: string) => hashString(`${SEAL_KEY}:${body}`).toString(36)

export function sealCollection(collection: Collection): string {
  const body = btoa(scramble(encodeURIComponent(JSON.stringify(collection))))
  return `${body}.${checksum(body)}`
}

export function openCollection(sealed: string | null): Collection {
  const [body, sum] = sealed?.split('.') ?? []
  if (!body || sum !== checksum(body)) return emptyCollection()
  try {
    return parseCollection(JSON.parse(decodeURIComponent(scramble(atob(body)))))
  } catch {
    return emptyCollection()
  }
}

export function unlockOrder(names: string[]): string[] {
  return [...names].sort((a, b) => hashString(a) - hashString(b))
}

export function collectionDay(instant: number, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant)
}

export function choose(collection: Collection, garment: Garment, requested: string, names: string[]): Choice {
  const date = requested < collection.date ? collection.date : requested
  const sameDay = collection.date === date
  const existing = sameDay ? collection.picks[garment] : undefined
  if (existing && names.includes(existing)) return { name: existing, collection, changed: false }

  const nextLocked = unlockOrder(names).find((n) => !collection.unlocked.includes(n))
  const name = nextLocked ?? names[pickIndex(`${garment}:${date}`, names.length)] ?? names[0] ?? ''
  const fresh = sameDay ? collection.fresh : []
  return {
    name,
    changed: true,
    collection: {
      unlocked: collection.unlocked.includes(name) ? collection.unlocked : [...collection.unlocked, name],
      date,
      picks: { ...(sameDay ? collection.picks : {}), [garment]: name },
      fresh: nextLocked ? [...fresh, name] : fresh,
    },
  }
}

export function isFresh(collection: Collection, name: string, date: string): boolean {
  return collection.date === date && collection.fresh.includes(name)
}
