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

export interface SearchResult extends Place {
  region: string
}

export function parseGeocodeResults(json: unknown): SearchResult[] {
  if (!json || typeof json !== 'object') return []
  const results = (json as { results?: unknown }).results
  if (!Array.isArray(results)) return []
  return results.flatMap((raw): SearchResult[] => {
    if (!raw || typeof raw !== 'object') return []
    const r = raw as Record<string, unknown>
    const name = nonEmpty(r.name)
    const place = name ? toPlace(r.latitude, r.longitude, name) : null
    if (!place) return []
    const region = [nonEmpty(r.admin1), nonEmpty(r.country)].filter((part) => part && part !== name).join(', ')
    return [{ ...place, region }]
  })
}

export function geocodeUrl(query: string, count = 6): string {
  const params = new URLSearchParams({ name: query, count: String(count), language: 'en', format: 'json' })
  return `https://geocoding-api.open-meteo.com/v1/search?${params}`
}

export function reverseGeocodeUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({ latitude: latitude.toFixed(3), longitude: longitude.toFixed(3), localityLanguage: 'en' })
  return `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`
}

export function parseReverseGeocode(json: unknown): string | null {
  if (!json || typeof json !== 'object') return null
  const r = json as Record<string, unknown>
  return nonEmpty(r.city) ?? nonEmpty(r.locality) ?? nonEmpty(r.principalSubdivision) ?? null
}
