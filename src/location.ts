export interface Place {
  latitude: number
  longitude: number
  name: string
}

function toCoord(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') return Number(value)
  return Number.NaN
}

function nonEmpty(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

function toPlace(latitude: unknown, longitude: unknown, name: string): Place | null {
  const lat = toCoord(latitude)
  const lon = toCoord(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return { latitude: lat, longitude: lon, name }
}

export function parseCfLocation(cf: unknown): Place | null {
  if (!cf || typeof cf !== 'object') return null
  const c = cf as Record<string, unknown>
  return toPlace(c.latitude, c.longitude, nonEmpty(c.city) ?? nonEmpty(c.country) ?? 'Somewhere')
}

export function parseGeocode(json: unknown): Place | null {
  if (!json || typeof json !== 'object') return null
  const results = (json as { results?: unknown }).results
  const first = Array.isArray(results) ? (results[0] as Record<string, unknown> | undefined) : undefined
  if (!first) return null
  const name = nonEmpty(first.name)
  if (!name) return null
  const country = nonEmpty(first.country)
  return toPlace(first.latitude, first.longitude, country ? `${name}, ${country}` : name)
}

export function geocodeUrl(query: string): string {
  const params = new URLSearchParams({ name: query, count: '1', language: 'en', format: 'json' })
  return `https://geocoding-api.open-meteo.com/v1/search?${params}`
}
