import { PANTS, SHORTS, type Art } from './art'
import type { Garment } from './verdict'

export function hashString(input: string): number {
  let hash = 0x811c9dc5
  for (const char of input) {
    hash ^= char.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function pickIndex(seed: string, length: number): number {
  return hashString(seed) % length
}

export function pickArt(garment: Garment, seed: string, collection = garment === 'shorts' ? SHORTS : PANTS): Art {
  const art = collection[pickIndex(`${garment}:${seed}`, collection.length)]
  if (!art) throw new Error(`No art for ${garment}`)
  return art
}
