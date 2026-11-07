import { describe, expect, it } from 'vitest'
import { day, hour } from './fixtures'
import {
  compass,
  confidenceLabel,
  confidenceOf,
  confidenceSegments,
  formatHour,
  reasonFor,
  scoreHour,
  summarizeDay,
  windName,
} from './verdict'

const lean = (v: ReturnType<typeof scoreHour>, key: string) => v.factors.find((f) => f.key === key)?.lean ?? NaN
const DATE = '2026-11-08'

describe('formatHour', () => {
  it.each([
    ['2026-11-08T00:00', '12am'],
    ['2026-11-08T09:00', '9am'],
    ['2026-11-08T12:00', '12pm'],
    ['2026-11-08T15:00', '3pm'],
  ])('%s → %s', (time, expected) => expect(formatHour(time)).toBe(expected))
})

describe('confidence', () => {
  it.each([
    [5, 'strong'],
    [-4, 'strong'],
    [2, 'likely'],
    [-1.5, 'likely'],
    [0.5, 'borderline'],
    [-1, 'borderline'],
  ])('confidenceOf(%d) → %s', (score, expected) => expect(confidenceOf(score)).toBe(expected))

  it.each([
    [7, 5],
    [-4.5, 4],
    [3, 3],
    [1.6, 2],
    [0.2, 1],
  ])('confidenceSegments(%d) → %d', (score, expected) => expect(confidenceSegments(score)).toBe(expected))

  it('labels confidence per garment', () => {
    expect(confidenceLabel({ garment: 'shorts', confidence: 'strong' })).toBe('Strong shorts day')
    expect(confidenceLabel({ garment: 'pants', confidence: 'likely' })).toBe('Leaning pants')
    expect(confidenceLabel({ garment: 'pants', confidence: 'borderline' })).toBe('Borderline, your call')
  })
})

describe('wind direction', () => {
  it.each([
    [0, 'N', 'northerly'],
    [180, 'S', 'southerly'],
    [200, 'S', 'southerly'],
    [225, 'SW', "sou'westerly"],
    [350, 'N', 'northerly'],
    [-90, 'W', 'westerly'],
  ])('%d° → %s / %s', (deg, short, name) => {
    expect(compass(deg)).toBe(short)
    expect(windName(deg)).toBe(name)
  })
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
    const v = summarizeDay(day(DATE, (h) => ({ apparentTemp: h >= 9 && h <= 18 ? 25 : 5 })))
    expect(v.garment).toBe('shorts')
    expect(v.average.apparentTemp).toBeCloseTo(25)
    expect(v.low).toBe(5)
    expect(v.high).toBe(25)
  })

  it('uses the wind direction of the windiest hour', () => {
    const v = summarizeDay(day(DATE, (h) => ({ windKmh: h === 12 ? 40 : 10, windDir: h === 12 ? 180 : 90 })))
    expect(v.average.windDir).toBe(180)
  })

  it('warns to pack pants when the evening turns cold', () => {
    const v = summarizeDay(day(DATE, (h) => ({ apparentTemp: h <= 18 ? 24 : 10 })))
    expect(v.garment).toBe('shorts')
    expect(v.caveat).toBe('Shorts, but pack pants for tonight')
  })

  it('warns about rain on a shorts day', () => {
    const v = summarizeDay(day(DATE, (h) => ({ apparentTemp: 26, precipProb: h >= 15 ? 60 : 0 })))
    expect(v.caveat).toBe('Shorts, but rain from 3pm')
  })

  it('notes a shorts-worthy peak on a pants day', () => {
    const v = summarizeDay(day(DATE, (h) => ({ apparentTemp: h === 14 ? 22 : 12 })))
    expect(v.garment).toBe('pants')
    expect(v.caveat).toBe('Pants, but 2pm flirts with shorts')
  })

  it('flags when rain arrives on a pants day', () => {
    const v = summarizeDay(day(DATE, (h) => ({ apparentTemp: 10, precipProb: h >= 15 ? 70 : 10 })))
    expect(v.caveat).toBe('Pants. Rain from 3pm.')
  })

  it('calls out rain on and off all day', () => {
    const v = summarizeDay(day(DATE, (h) => ({ apparentTemp: 10, precipProb: h % 2 === 0 ? 80 : 40 })))
    expect(v.caveat).toBe('Pants. Rain on and off all day.')
  })

  it('has no caveat on a settled day', () => {
    expect(summarizeDay(day(DATE, () => ({ apparentTemp: 26 }))).caveat).toBeUndefined()
  })

  it('falls back to all hours when none are in the active window', () => {
    const v = summarizeDay([hour('2026-11-08T22:00', { apparentTemp: 8 })])
    expect(v.garment).toBe('pants')
  })
})

describe('reasonFor', () => {
  const reason = (hours: ReturnType<typeof day>, bias = 0) => reasonFor(summarizeDay(hours, bias), summarizeDay(hours, 0))

  it('describes a calm strong shorts day', () => {
    expect(reason(day(DATE, () => ({ apparentTemp: 27, windKmh: 5 })))).toBe('Feels like 27°, barely a breeze. Legs out.')
  })

  it('names the wind when it is the main drag', () => {
    expect(reason(day(DATE, () => ({ apparentTemp: 9, windKmh: 45, windDir: 180 })))).toBe(
      "Feels like 9° with a stiff southerly. Don't be a hero.",
    )
  })

  it('mentions rain when it is the main drag', () => {
    expect(reason(day(DATE, () => ({ apparentTemp: 12, precipProb: 90 })))).toBe("Feels like 12° with rain about. Don't be a hero.")
  })

  it('owns up when a cold bias flips the day to pants', () => {
    expect(reason(day(DATE, () => ({ apparentTemp: 19, windKmh: 15 })), -3)).toBe('Feels like 19°, but you run cold. Pants, no shame.')
  })

  it('owns up when a hot bias flips the day to shorts', () => {
    expect(reason(day(DATE, () => ({ apparentTemp: 15, windKmh: 15 })), 3)).toBe('Feels like 15°, but you run hot. Legs out.')
  })
})
