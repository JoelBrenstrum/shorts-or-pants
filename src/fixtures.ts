import type { HourWeather } from './types'

export function hour(time: string, overrides: Partial<HourWeather> = {}): HourWeather {
  return {
    time,
    temp: 20,
    apparentTemp: 20,
    humidity: 50,
    windKmh: 10,
    windDir: 0,
    precipProb: 0,
    uv: 0,
    weatherCode: 0,
    isDay: true,
    ...overrides,
  }
}

export function day(date: string, overrides: (h: number) => Partial<HourWeather> = () => ({})): HourWeather[] {
  return Array.from({ length: 24 }, (_, h) => hour(`${date}T${String(h).padStart(2, '0')}:00`, overrides(h)))
}
