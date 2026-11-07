import { describe, expect, it } from 'vitest'
import { day, hour } from './fixtures'
import { confidenceOf, formatHour, reasonFor, scoreHour, summarizeDay } from './verdict'

const lean = (h: ReturnType<typeof scoreHour>, key: string) => h.factors.find((f) => f.key === key)?.lean ?? NaN

describe('formatHour', () => {
  it.each([
    ['2026-11-08T00:00', '12am'],
    ['2026-11-08T09:00', '9am'],
    ['2026-11-08T12:00', '12pm'],
    ['2026-11-08T15:00', '3pm'],
  ])('%s → %s', (time, expected) => expect(formatHour(time)).toBe(expected))
})

describe('confidenceOf', () => {
  it.each([
    [5, 'strong'],
    [-4, 'strong'],
    [2, 'likely'],
    [-1.5, 'likely'],
    [0.5, 'borderline'],
    [-1, 'borderline'],
  ])('%d → %s', (score, expected) => expect(confidenceOf(score)).toBe(expected))
})

describe('scoreHour', () => {
  it('calls shorts when feels-like is above the threshold', () => {
    expect(scoreHour(hour('t', { apparentTemp: 26 })).garment).toBe('shorts')
  })

  it('calls pants when feels-like is below the threshold', () => {
    expect(scoreHour(hour('t', { apparentTemp: 12 })).garment).toBe('pants')
  })

  it('treats exactly the threshold as shorts', () => {
    expect(scoreHour(hour('t', { apparentTemp: 18 })).garment).toBe('shorts')
  })

  it('lets a hot-running bias flip a borderline pants hour to shorts', () => {
    const borderline = hour('t', { apparentTemp: 16.5 })
    expect(scoreHour(borderline, 0).garment).toBe('pants')
    expect(scoreHour(borderline, 2).garment).toBe('shorts')
  })

  it('lets a cold-running bias flip a borderline shorts hour to pants', () => {
    expect(scoreHour(hour('t', { apparentTemp: 19 }), -2).garment).toBe('pants')
  })

  it('only penalises wind above 25 km/h', () => {
    expect(lean(scoreHour(hour('t', { windKmh: 20 })), 'wind')).toBeCloseTo(0)
    expect(lean(scoreHour(hour('t', { windKmh: 45 })), 'wind')).toBeCloseTo(-2)
  })

  it('scales the rain penalty with probability', () => {
    expect(lean(scoreHour(hour('t', { precipProb: 0 })), 'rain')).toBeCloseTo(0)
    expect(lean(scoreHour(hour('t', { precipProb: 100 })), 'rain')).toBeCloseTo(-2)
  })

  it('pushes toward shorts when it is warm and muggy', () => {
    expect(lean(scoreHour(hour('t', { apparentTemp: 20, humidity: 90 })), 'humidity')).toBeCloseTo(1)
    expect(lean(scoreHour(hour('t', { apparentTemp: 10, humidity: 90 })), 'humidity')).toBeCloseTo(0)
  })

  it('counts sun only during the day and caps UV', () => {
    expect(lean(scoreHour(hour('t', { uv: 12, isDay: true })), 'sun')).toBeCloseTo(2.4)
    expect(lean(scoreHour(hour('t', { uv: 5, isDay: false })), 'sun')).toBeCloseTo(0)
  })

  it('can turn a mild hour into pants with wind and rain', () => {
    expect(scoreHour(hour('t', { apparentTemp: 20, windKmh: 40, precipProb: 80 })).garment).toBe('pants')
  })
})

describe('summarizeDay', () => {
  it('scores the active 9am–6pm window rather than the cold night', () => {
    const v = summarizeDay(day('2026-11-08', (h) => ({ apparentTemp: h >= 9 && h <= 18 ? 25 : 5 })))
    expect(v.garment).toBe('shorts')
    expect(v.feelsLike).toBeCloseTo(25)
    expect(v.low).toBe(5)
    expect(v.high).toBe(25)
  })

  it('warns to pack pants when the evening turns cold', () => {
    const v = summarizeDay(day('2026-11-08', (h) => ({ apparentTemp: h <= 18 ? 24 : 10 })))
    expect(v.garment).toBe('shorts')
    expect(v.caveats).toContain('Pack pants for tonight')
  })

  it('notes a shorts-worthy peak on a pants day', () => {
    const v = summarizeDay(day('2026-11-08', (h) => ({ apparentTemp: h === 14 ? 22 : 12 })))
    expect(v.garment).toBe('pants')
    expect(v.caveats).toContain('Shorts-worthy around 2pm')
  })

  it('flags when rain becomes likely', () => {
    const v = summarizeDay(day('2026-11-08', (h) => ({ precipProb: h >= 15 ? 70 : 10 })))
    expect(v.caveats).toContain('Rain likely from 3pm')
  })

  it('falls back to all hours when none are in the active window', () => {
    const v = summarizeDay([hour('2026-11-08T22:00', { apparentTemp: 8 })])
    expect(v.garment).toBe('pants')
  })
})

describe('reasonFor', () => {
  it('describes a strong shorts day', () => {
    expect(reasonFor(summarizeDay(day('2026-11-08', () => ({ apparentTemp: 27 }))))).toBe('Feels like 27°. Legs out.')
  })

  it('mentions the wind when it is the main drag', () => {
    const v = summarizeDay(day('2026-11-08', () => ({ apparentTemp: 9, windKmh: 45 })))
    expect(reasonFor(v)).toBe("Feels like 9° with a stiff wind. Don't be a hero.")
  })
})
