import type { HourWeather } from './types'
import { hourOf } from './verdict'

const HOURLY = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'wind_speed_10m',
  'wind_direction_10m',
  'precipitation_probability',
  'uv_index',
  'weather_code',
  'is_day',
] as const

type HourlyKey = (typeof HOURLY)[number]

export interface OpenMeteoResponse {
  current: { time: string }
  hourly: { time: string[] } & Record<HourlyKey, (number | null)[]>
}

export interface Forecast {
  now: string
  hours: HourWeather[]
}

export const SLOT_HOURS = [6, 9, 12, 15, 18, 21]

export function forecastUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(3),
    longitude: longitude.toFixed(3),
    hourly: HOURLY.join(','),
    current: 'temperature_2m',
    timezone: 'auto',
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  })
  return `https://api.open-meteo.com/v1/forecast?${params}`
}

export function parseForecast(res: OpenMeteoResponse): Forecast {
  const at = (key: HourlyKey, i: number) => res.hourly[key][i] ?? null
  const hours = res.hourly.time.flatMap((time, i): HourWeather[] => {
    const apparentTemp = at('apparent_temperature', i)
    if (apparentTemp === null) return []
    return [
      {
        time,
        apparentTemp,
        temp: at('temperature_2m', i) ?? apparentTemp,
        humidity: at('relative_humidity_2m', i) ?? 0,
        windKmh: at('wind_speed_10m', i) ?? 0,
        windDir: at('wind_direction_10m', i) ?? 0,
        precipProb: at('precipitation_probability', i) ?? 0,
        uv: at('uv_index', i) ?? 0,
        weatherCode: at('weather_code', i) ?? 0,
        isDay: at('is_day', i) === 1,
      },
    ]
  })
  return { now: res.current.time, hours }
}

export function groupByDate(hours: HourWeather[]): Map<string, HourWeather[]> {
  const days = new Map<string, HourWeather[]>()
  for (const h of hours) {
    const date = h.time.slice(0, 10)
    days.set(date, [...(days.get(date) ?? []), h])
  }
  return days
}

export function todaySlots(hours: HourWeather[], now: string, slotHours = SLOT_HOURS): HourWeather[] {
  const today = now.slice(0, 10)
  return hours.filter((h) => h.time.startsWith(today) && slotHours.includes(hourOf(h.time)))
}

export function currentSlotTime(slots: HourWeather[], now: string): string | undefined {
  const past = slots.filter((s) => hourOf(s.time) <= hourOf(now))
  return (past[past.length - 1] ?? slots[0])?.time
}

export type WeatherKind = 'sun' | 'night' | 'cloud' | 'rain' | 'wind'

export function weatherKind(h: HourWeather): WeatherKind {
  if (h.weatherCode >= 51) return 'rain'
  if (h.windKmh >= 30) return 'wind'
  if (h.weatherCode >= 2) return 'cloud'
  return h.isDay ? 'sun' : 'night'
}

export async function fetchForecast(latitude: number, longitude: number): Promise<Forecast> {
  const res = await fetch(forecastUrl(latitude, longitude))
  if (!res.ok) throw new Error(`Forecast request failed: ${res.status}`)
  return parseForecast(await res.json())
}
