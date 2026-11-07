import { describe, expect, it } from 'vitest'
import { hour } from './fixtures'
import {
  currentSlotTime,
  dayWeather,
  forecastUrl,
  groupByDate,
  parseForecast,
  todaySlots,
  weatherKind,
  type OpenMeteoResponse,
} from './forecast'

const response: OpenMeteoResponse = {
  current: { time: '2026-11-08T10:15' },
  hourly: {
    time: ['2026-11-08T09:00', '2026-11-08T10:00', '2026-11-09T09:00'],
    temperature_2m: [18, 19, null],
    apparent_temperature: [17, null, 15],
    relative_humidity_2m: [60, 62, null],
    wind_speed_10m: [12, 14, 20],
    wind_direction_10m: [180, 190, null],
    precipitation_probability: [10, 20, null],
    uv_index: [3, 4, 1],
    weather_code: [1, 2, 61],
    is_day: [1, 1, 0],
  },
}

describe('parseForecast', () => {
  it('maps hourly arrays to hour objects and drops hours without a feels-like temp', () => {
    const { now, hours } = parseForecast(response)
    expect(now).toBe('2026-11-08T10:15')
    expect(hours.map((h) => h.time)).toEqual(['2026-11-08T09:00', '2026-11-09T09:00'])
    expect(hours[0]).toEqual({
      time: '2026-11-08T09:00',
      temp: 18,
      apparentTemp: 17,
      humidity: 60,
      windKmh: 12,
      windDir: 180,
      precipProb: 10,
      uv: 3,
      weatherCode: 1,
      isDay: true,
    })
  })

  it('works out the real instant from the location time and its UTC offset', () => {
    const { instant } = parseForecast({ ...response, utc_offset_seconds: 13 * 3600 })
    expect(new Date(instant).toISOString()).toBe('2026-11-07T21:15:00.000Z')
  })

  it('fills missing values with safe defaults', () => {
    const second = parseForecast(response).hours[1]
    expect(second).toMatchObject({ temp: 15, humidity: 0, precipProb: 0, isDay: false })
  })
})

describe('forecastUrl', () => {
  it('requests local-time hourly data for 7 days', () => {
    const url = new URL(forecastUrl(-36.8481, 174.7633))
    expect(url.searchParams.get('latitude')).toBe('-36.848')
    expect(url.searchParams.get('timezone')).toBe('auto')
    expect(url.searchParams.get('forecast_days')).toBe('7')
    expect(url.searchParams.get('hourly')).toContain('apparent_temperature')
  })
})

describe('groupByDate', () => {
  it('groups hours by local date in order', () => {
    const days = groupByDate([hour('2026-11-08T09:00'), hour('2026-11-08T10:00'), hour('2026-11-09T09:00')])
    expect([...days.keys()]).toEqual(['2026-11-08', '2026-11-09'])
    expect(days.get('2026-11-08')).toHaveLength(2)
  })
})

describe('todaySlots and currentSlotTime', () => {
  const hours = Array.from({ length: 48 }, (_, i) => {
    const date = i < 24 ? '2026-11-08' : '2026-11-09'
    return hour(`${date}T${String(i % 24).padStart(2, '0')}:00`)
  })

  it('picks the slot hours for today only', () => {
    const slots = todaySlots(hours, '2026-11-08T10:30')
    expect(slots.map((s) => s.time.slice(11, 13))).toEqual(['06', '09', '12', '15', '18', '21'])
    expect(slots.every((s) => s.time.startsWith('2026-11-08'))).toBe(true)
  })

  it('highlights the latest slot that has started', () => {
    const slots = todaySlots(hours, '2026-11-08T10:30')
    expect(currentSlotTime(slots, '2026-11-08T10:30')).toBe('2026-11-08T09:00')
    expect(currentSlotTime(slots, '2026-11-08T23:00')).toBe('2026-11-08T21:00')
  })

  it('falls back to the first slot before 6am', () => {
    const slots = todaySlots(hours, '2026-11-08T04:00')
    expect(currentSlotTime(slots, '2026-11-08T04:00')).toBe('2026-11-08T06:00')
  })
})

describe('weatherKind', () => {
  it.each([
    [{ weatherCode: 0, isDay: true }, 'sun'],
    [{ weatherCode: 1, isDay: false }, 'night'],
    [{ weatherCode: 3 }, 'cloud'],
    [{ weatherCode: 45 }, 'cloud'],
    [{ weatherCode: 61 }, 'rain'],
    [{ weatherCode: 95 }, 'rain'],
    [{ weatherCode: 2, windKmh: 35 }, 'wind'],
    [{ weatherCode: 63, windKmh: 35 }, 'rain'],
  ] as const)('%o → %s', (overrides, kind) => expect(weatherKind(hour('t', overrides))).toBe(kind))
})

describe('dayWeather', () => {
  const at = (h: number, overrides: Parameters<typeof hour>[1] = {}) => hour(`2026-11-08T${String(h).padStart(2, '0')}:00`, overrides)
  const daytime = (overrides: Parameters<typeof hour>[1] = {}) => [9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => at(h, overrides))

  it('calls a clear day sunny even when the night is cloudy', () => {
    expect(dayWeather([at(2, { weatherCode: 3 }), ...daytime({ weatherCode: 1 })])).toEqual({ kind: 'sun', rainChance: 0 })
  })

  it('calls a mostly overcast day cloudy', () => {
    expect(dayWeather(daytime({ weatherCode: 3 })).kind).toBe('cloud')
  })

  it('calls it rainy when a few daytime hours are wet', () => {
    const hours = daytime({ weatherCode: 2, precipProb: 30 })
    hours[3] = at(12, { weatherCode: 61, precipProb: 45 })
    hours[4] = at(13, { weatherCode: 61, precipProb: 45 })
    hours[5] = at(14, { weatherCode: 61, precipProb: 45 })
    expect(dayWeather(hours)).toEqual({ kind: 'rain', rainChance: 45 })
  })

  it('ignores drizzle codes when rain is unlikely', () => {
    expect(dayWeather(daytime({ weatherCode: 51, precipProb: 15 }))).toEqual({ kind: 'cloud', rainChance: 15 })
  })

  it('calls it rainy when rain is likely even without a rain code', () => {
    expect(dayWeather(daytime({ weatherCode: 3, precipProb: 70 })).kind).toBe('rain')
  })

  it('calls a dry blustery day windy', () => {
    expect(dayWeather(daytime({ weatherCode: 1, windKmh: 40 })).kind).toBe('wind')
  })
})
