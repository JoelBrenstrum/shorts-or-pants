import type { HourWeather } from './types'

export type Garment = 'shorts' | 'pants'
export type Confidence = 'strong' | 'likely' | 'borderline'
export type FactorKey = 'feelsLike' | 'humidity' | 'wind' | 'rain' | 'sun'

export interface Factor {
  key: FactorKey
  label: string
  value: string
  lean: number
}

export interface Verdict {
  garment: Garment
  score: number
  confidence: Confidence
  factors: Factor[]
}

export interface DayVerdict extends Verdict {
  feelsLike: number
  high: number
  low: number
  caveats: string[]
}

export const BASE_THRESHOLD_C = 18
export const BIAS_STEP_C = 1.5
const ACTIVE_START = 9
const ACTIVE_END = 18
const EVENING_END = 22

export function hourOf(time: string): number {
  return Number(time.slice(11, 13))
}

export function formatHour(time: string): string {
  const h = hourOf(time)
  return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`
}

export function confidenceOf(score: number): Confidence {
  const magnitude = Math.abs(score)
  if (magnitude >= 4) return 'strong'
  if (magnitude >= 1.5) return 'likely'
  return 'borderline'
}

export function scoreHour(h: HourWeather, bias = 0): Verdict {
  const threshold = BASE_THRESHOLD_C - bias * BIAS_STEP_C
  const factors: Factor[] = [
    { key: 'feelsLike', label: 'Feels like', value: `${Math.round(h.apparentTemp)}°`, lean: h.apparentTemp - threshold },
    {
      key: 'humidity',
      label: 'Humidity',
      value: `${Math.round(h.humidity)}%`,
      lean: h.humidity > 70 && h.apparentTemp > 15 ? ((h.humidity - 70) / 10) * 0.5 : 0,
    },
    { key: 'wind', label: 'Wind', value: `${Math.round(h.windKmh)} km/h`, lean: Math.min(0, (25 - h.windKmh) / 10) },
    { key: 'rain', label: 'Rain chance', value: `${Math.round(h.precipProb)}%`, lean: (h.precipProb / 100) * -2 },
    { key: 'sun', label: 'UV', value: `${Math.round(h.uv)}`, lean: h.isDay ? Math.min(h.uv, 8) * 0.3 : 0 },
  ]
  const score = factors.reduce((sum, f) => sum + f.lean, 0)
  return { garment: score >= 0 ? 'shorts' : 'pants', score, confidence: confidenceOf(score), factors }
}

export function averageWeather(hours: HourWeather[]): HourWeather {
  const first = hours[0]
  if (!first) throw new Error('averageWeather needs at least one hour')
  const mean = (pick: (h: HourWeather) => number) => hours.reduce((sum, h) => sum + pick(h), 0) / hours.length
  return {
    time: first.time,
    temp: mean((h) => h.temp),
    apparentTemp: mean((h) => h.apparentTemp),
    humidity: mean((h) => h.humidity),
    windKmh: mean((h) => h.windKmh),
    precipProb: mean((h) => h.precipProb),
    uv: mean((h) => h.uv),
    weatherCode: Math.max(...hours.map((h) => h.weatherCode)),
    isDay: hours.some((h) => h.isDay),
  }
}

export function summarizeDay(hours: HourWeather[], bias = 0): DayVerdict {
  const active = hours.filter((h) => hourOf(h.time) >= ACTIVE_START && hourOf(h.time) <= ACTIVE_END)
  const basis = active.length > 0 ? active : hours
  const average = averageWeather(basis)
  const verdict = scoreHour(average, bias)
  const feels = hours.map((h) => h.apparentTemp)
  const caveats: string[] = []

  if (verdict.garment === 'shorts') {
    const evening = hours.filter((h) => hourOf(h.time) > ACTIVE_END && hourOf(h.time) <= EVENING_END)
    if (evening.some((h) => scoreHour(h, bias).garment === 'pants')) caveats.push('Pack pants for tonight')
  } else {
    const peak = basis
      .map((h) => ({ h, score: scoreHour(h, bias).score }))
      .reduce((best, next) => (next.score > best.score ? next : best))
    if (peak.score >= 0) caveats.push(`Shorts-worthy around ${formatHour(peak.h.time)}`)
  }

  const wet = basis.find((h) => h.precipProb >= 50)
  if (wet) caveats.push(`Rain likely from ${formatHour(wet.time)}`)

  return {
    ...verdict,
    feelsLike: average.apparentTemp,
    high: Math.max(...feels),
    low: Math.min(...feels),
    caveats,
  }
}

const PHRASES: Record<Garment, Record<Confidence, string>> = {
  shorts: { strong: 'Legs out.', likely: 'Shorts it is.', borderline: 'Shorts, just.' },
  pants: { strong: "Don't be a hero.", likely: 'Pants today.', borderline: 'Pants, just.' },
}

const DRAGS: Partial<Record<FactorKey, string>> = {
  wind: 'with a stiff wind',
  rain: 'with rain about',
}

export function reasonFor(day: DayVerdict): string {
  const drag = day.factors.filter((f) => DRAGS[f.key] && f.lean <= -1).sort((a, b) => a.lean - b.lean)[0]
  const feel = `Feels like ${Math.round(day.feelsLike)}°${drag ? ` ${DRAGS[drag.key]}` : ''}.`
  return `${feel} ${PHRASES[day.garment][day.confidence]}`
}
