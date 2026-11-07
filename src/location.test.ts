import { describe, expect, it } from 'vitest'
import { geocodeUrl, parseCfLocation, parseGeocode } from './location'

describe('parseCfLocation', () => {
  it('reads string coordinates and city from Cloudflare request data', () => {
    expect(parseCfLocation({ latitude: '-36.84850', longitude: '174.76330', city: 'Auckland', country: 'NZ' })).toEqual({
      latitude: -36.8485,
      longitude: 174.7633,
      name: 'Auckland',
    })
  })

  it('falls back to country when city is missing', () => {
    expect(parseCfLocation({ latitude: '1', longitude: '2', country: 'NZ' })?.name).toBe('NZ')
  })

  it.each([undefined, null, {}, { latitude: '', longitude: '' }, { latitude: 'abc', longitude: '1' }])(
    'returns null for unusable data %#',
    (cf) => expect(parseCfLocation(cf)).toBeNull(),
  )
})

describe('parseGeocode', () => {
  it('returns the first result with country', () => {
    const json = { results: [{ name: 'Wellington', country: 'New Zealand', latitude: -41.28, longitude: 174.77 }] }
    expect(parseGeocode(json)).toEqual({ latitude: -41.28, longitude: 174.77, name: 'Wellington, New Zealand' })
  })

  it('returns null when nothing matches', () => {
    expect(parseGeocode({})).toBeNull()
    expect(parseGeocode({ results: [] })).toBeNull()
  })
})

describe('geocodeUrl', () => {
  it('encodes the query', () => {
    expect(new URL(geocodeUrl('Palmerston North')).searchParams.get('name')).toBe('Palmerston North')
  })
})
