import { describe, expect, it } from 'vitest'
import { dateLabel, factorCards, formatClock, slotFlag, switchSummary, tuneHint, tuneLabel, uvBand, weekday, type Slot } from './copy'
import { day } from './fixtures'
import { summarizeDay } from './verdict'

const DATE = '2026-11-08'

describe('dates and times', () => {
  it('formats the hero date', () => {
    expect(dateLabel('2026-11-08T10:15')).toBe('Sun 8 Nov')
  })

  it('gives short weekdays', () => {
    expect(weekday('2026-11-09')).toBe('Mon')
  })

  it.each([
    ['2026-11-08T11:52', '11:52am'],
    ['2026-11-08T00:05', '12:05am'],
    ['2026-11-08T15:30', '3:30pm'],
  ])('formatClock(%s) → %s', (time, expected) => expect(formatClock(time)).toBe(expected))
})

describe('factorCards', () => {
  const hours = day(DATE, (h) => ({
    apparentTemp: h === 15 ? 28 : 24,
    humidity: 58,
    windKmh: 6,
    windDir: 45,
    precipProb: h === 12 ? 10 : 0,
    uv: h === 13 ? 9 : 4,
  }))
  const cards = factorCards(hours, summarizeDay(hours))
  const card = (key: string) => cards.find((c) => c.key === key)!

  it('returns the five factors in order', () => {
    expect(cards.map((c) => c.key)).toEqual(['feelsLike', 'humidity', 'wind', 'rain', 'sun'])
  })

  it('describes the feels-like peak', () => {
    expect(card('feelsLike').note).toBe('Peaks at 28° around 3pm')
    expect(card('feelsLike').tone).toBe('shorts')
    expect(card('feelsLike').position).toBe(98)
  })

  it('shows wind with a compass direction', () => {
    expect(card('wind').value).toBe('6 km/h NE')
    expect(card('wind').note).toBe('Barely a breeze')
    expect(card('wind').tone).toBe('neutral')
    expect(card('wind').position).toBe(50)
  })

  it('uses the peak rain chance and UV', () => {
    expect(card('rain').value).toBe('10%')
    expect(card('rain').note).toBe('Dry all day')
    expect(card('sun').value).toBe('9 · Very high')
  })

  it('describes comfortable humidity', () => {
    expect(card('humidity').note).toBe('Comfortable, not sticky')
  })

  it('places pants-leaning factors left of centre', () => {
    const wet = day(DATE, () => ({ apparentTemp: 8, windKmh: 45, precipProb: 90, humidity: 90 }))
    const cards = factorCards(wet, summarizeDay(wet))
    const wind = cards.find((c) => c.key === 'wind')!
    expect(wind.tone).toBe('pants')
    expect(wind.leanLabel).toBe('Leans pants')
    expect(wind.position).toBeLessThan(50)
    expect(cards.find((c) => c.key === 'humidity')!.note).toBe('Damp. Gets into your bones.')
  })
})

describe('uvBand', () => {
  it.each([
    [1, 'Low'],
    [4, 'Moderate'],
    [7, 'High'],
    [9, 'Very high'],
    [12, 'Extreme'],
  ])('%d → %s', (uv, band) => expect(uvBand(uv)).toBe(band))
})

describe('tuning', () => {
  it('labels each notch', () => {
    expect(tuneLabel(-3)).toBe('Always cold')
    expect(tuneLabel(0)).toBe('Average human')
    expect(tuneLabel(3)).toBe('Human radiator')
  })

  it('says a clear day holds whatever the setting', () => {
    expect(tuneHint(day(DATE, () => ({ apparentTemp: 30, windKmh: 5 })), 0)).toBe('Today holds no matter how you run.')
  })

  it('warns when one notch could flip it', () => {
    expect(tuneHint(day(DATE, () => ({ apparentTemp: 18.5, windKmh: 15 })), 0)).toBe('Close call. One notch either way could flip today.')
  })

  it('reports when tuning flipped the day', () => {
    expect(tuneHint(day(DATE, () => ({ apparentTemp: 19, windKmh: 15 })), -3)).toBe('Your tuning flipped today to pants.')
  })

  it('notes when only a big swing would flip it', () => {
    expect(tuneHint(day(DATE, () => ({ apparentTemp: 22, windKmh: 15 })), 0)).toBe('Holds for now, but a big swing could flip it.')
  })
})

describe('hourly slots', () => {
  const t = (h: number) => `${DATE}T${String(h).padStart(2, '0')}:00`
  const slots: Slot[] = [
    { time: t(6), garment: 'pants' },
    { time: t(9), garment: 'shorts' },
    { time: t(12), garment: 'shorts' },
    { time: t(15), garment: 'shorts' },
    { time: t(18), garment: 'pants' },
    { time: t(21), garment: 'pants' },
  ]

  it('summarises an upcoming switch', () => {
    expect(switchSummary(slots, t(12), 'shorts')).toBe('Pants from 6pm')
  })

  it('says till late when the only switch has passed', () => {
    expect(switchSummary(slots.slice(0, 4), t(12), 'shorts')).toBe('Shorts till late')
  })

  it('says all day when nothing changes', () => {
    expect(switchSummary(slots.slice(1, 4), t(12), 'shorts')).toBe('Shorts all day')
  })

  it('flags now and switch points', () => {
    expect(slots.map((_, i) => slotFlag(slots, i, t(12)))).toEqual(['', 'Switch', 'Now', '', 'Switch', ''])
  })
})
