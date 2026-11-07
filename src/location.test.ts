import { describe, expect, it } from 'vitest'
import { geocodeUrl, parseCfLocation, parseGeocodeResults, parseReverseGeocode, reverseGeocodeUrl } from './location'

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

describe('parseGeocodeResults', () => {
  it('maps results with region and country', () => {
    const json = {
      results: [
        { name: 'Wellington', admin1: 'Wellington', country: 'New Zealand', latitude: -41.28, longitude: 174.77 },
        { name: 'Wellington', admin1: 'Florida', country: 'United States', latitude: 26.65, longitude: -80.24 },
      ],
    }
    expect(parseGeocodeResults(json)).toEqual([
      { name: 'Wellington', region: 'New Zealand', latitude: -41.28, longitude: 174.77 },
      { name: 'Wellington', region: 'Florida, United States', latitude: 26.65, longitude: -80.24 },
    ])
  })

  it('skips malformed entries', () => {
    expect(parseGeocodeResults({ results: [{ name: 'Nowhere' }, null, { latitude: 1, longitude: 2 }] })).toEqual([])
  })

  it('returns an empty list when nothing matches', () => {
    expect(parseGeocodeResults({})).toEqual([])
    expect(parseGeocodeResults(null)).toEqual([])
  })
})

describe('geocodeUrl', () => {
  it('encodes the query', () => {
    const url = new URL(geocodeUrl('Palmerston North'))
    expect(url.searchParams.get('name')).toBe('Palmerston North')
    expect(url.searchParams.get('count')).toBe('6')
  })
})

describe('reverse geocoding', () => {
  it('prefers city, then locality, then region', () => {
    expect(parseReverseGeocode({ city: 'Wellington', locality: 'Wellington City' })).toBe('Wellington')
    expect(parseReverseGeocode({ city: '', locality: 'Raglan' })).toBe('Raglan')
    expect(parseReverseGeocode({ principalSubdivision: 'Otago' })).toBe('Otago')
  })

  it('returns null without a usable name', () => {
    expect(parseReverseGeocode({})).toBeNull()
    expect(parseReverseGeocode(null)).toBeNull()
  })

  it('rounds coordinates in the request', () => {
    const url = new URL(reverseGeocodeUrl(-41.28664, 174.77557))
    expect(url.searchParams.get('latitude')).toBe('-41.287')
    expect(url.searchParams.get('longitude')).toBe('174.776')
  })
})
