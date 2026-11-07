import type { HourWeather } from './types'

export type Garment = 'shorts' | 'pants'
export type Confidence = 'strong' | 'likely' | 'borderline'
export type FactorKey = 'feelsLike' | 'humidity' | 'wind' | 'rain' | 'sun'

export interface Factor {
  key: FactorKey
  lean: number
}

export interface Verdict {
  garment: Garment
  score: number
  confidence: Confidence
  factors: Factor[]
}

export interface DayVerdict extends Verdict {
  average: HourWeather
  high: number
  low: number
  tempHigh: number
  tempLow: number
  caveat?: string
}

export const BASE_THRESHOLD_C = 18
export const BIAS_STEP_C = 1.5
export const MIN_BIAS = -3
export const MAX_BIAS = 3
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

export function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function confidenceOf(score: number): Confidence {
  const magnitude = Math.abs(score)
  if (magnitude >= 4) return 'strong'
  if (magnitude >= 1.5) return 'likely'
  return 'borderline'
}

export function confidenceSegments(score: number): number {
  const magnitude = Math.abs(score)
  if (magnitude >= 6) return 5
  if (magnitude >= 4) return 4
  if (magnitude >= 2.5) return 3
  if (magnitude >= 1.5) return 2
  return 1
}

export function confidenceLabel(v: Pick<Verdict, 'garment' | 'confidence'>): string {
  if (v.confidence === 'strong') return `Strong ${v.garment} day`
  if (v.confidence === 'likely') return `Leaning ${v.garment}`
  return 'Borderline, your call'
}

export function scoreHour(h: HourWeather, bias = 0): Verdict {
  const threshold = BASE_THRESHOLD_C - bias * BIAS_STEP_C
  const factors: Factor[] = [
    { key: 'feelsLike', lean: h.apparentTemp - threshold },
    { key: 'humidity', lean: h.humidity > 70 && h.apparentTemp > 15 ? ((h.humidity - 70) / 10) * 0.5 : 0 },
    { key: 'wind', lean: Math.min(0, (25 - h.windKmh) / 10) },
    { key: 'rain', lean: (h.precipProb / 100) * -2 },
    { key: 'sun', lean: h.isDay ? Math.min(h.uv, 8) * 0.3 : 0 },
  ]
  const score = factors.reduce((sum, f) => sum + f.lean, 0)
  return { garment: score >= 0 ? 'shorts' : 'pants', score, confidence: confidenceOf(score), factors }
}

export function averageWeather(hours: HourWeather[]): HourWeather {
  const first = hours[0]
  if (!first) throw new Error('averageWeather needs at least one hour')
  const mean = (pick: (h: HourWeather) => number) => hours.reduce((sum, h) => sum + pick(h), 0) / hours.length
  const windiest = hours.reduce((max, h) => (h.windKmh > max.windKmh ? h : max))
  return {
    time: first.time,
    temp: mean((h) => h.temp),
    apparentTemp: mean((h) => h.apparentTemp),
    humidity: mean((h) => h.humidity),
    windKmh: mean((h) => h.windKmh),
    windDir: windiest.windDir,
    precipProb: mean((h) => h.precipProb),
    uv: mean((h) => h.uv),
    weatherCode: Math.max(...hours.map((h) => h.weatherCode)),
    isDay: hours.some((h) => h.isDay),
  }
}

export function activeHours(hours: HourWeather[]): HourWeather[] {
  const active = hours.filter((h) => hourOf(h.time) >= ACTIVE_START && hourOf(h.time) <= ACTIVE_END)
  return active.length > 0 ? active : hours
}

function caveatFor(garment: Garment, hours: HourWeather[], basis: HourWeather[], bias: number): string | undefined {
  const rainy = basis.filter((h) => h.precipProb >= 50)
  if (garment === 'shorts') {
    const evening = hours.filter((h) => hourOf(h.time) > ACTIVE_END && hourOf(h.time) <= EVENING_END)
    if (evening.some((h) => scoreHour(h, bias).garment === 'pants')) return 'Shorts, but pack pants for tonight'
    const firstRain = rainy[0]
    return firstRain ? `Shorts, but rain from ${formatHour(firstRain.time)}` : undefined
  }
  const firstRain = rainy[0]
  if (rainy.length >= 3 && rainy.length >= basis.length / 2) return 'Pants. Rain on and off all day.'
  if (firstRain) return `Pants. Rain from ${formatHour(firstRain.time)}.`
  const peak = basis
    .map((h) => ({ h, score: scoreHour(h, bias).score }))
    .reduce((best, next) => (next.score > best.score ? next : best))
  return peak.score >= 0 ? `Pants, but ${formatHour(peak.h.time)} flirts with shorts` : undefined
}

export function summarizeDay(hours: HourWeather[], bias = 0): DayVerdict {
  const basis = activeHours(hours)
  const average = averageWeather(basis)
  const verdict = scoreHour(average, bias)
  const feels = hours.map((h) => h.apparentTemp)
  const temps = hours.map((h) => h.temp)
  return {
    ...verdict,
    average,
    high: Math.max(...feels),
    low: Math.min(...feels),
    tempHigh: Math.max(...temps),
    tempLow: Math.min(...temps),
    caveat: caveatFor(verdict.garment, hours, basis, bias),
  }
}

const WIND_NAMES = ['northerly', "nor'easterly", 'easterly', "sou'easterly", 'southerly', "sou'westerly", 'westerly', "nor'westerly"]
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

function octant(deg: number): number {
  return Math.round((((deg % 360) + 360) % 360) / 45) % 8
}

export function windName(deg: number): string {
  return WIND_NAMES[octant(deg)] ?? 'wind'
}

export function compass(deg: number): string {
  return COMPASS[octant(deg)] ?? ''
}

const PHRASES: Record<Garment, Record<Confidence, string>> = {
  shorts: { strong: 'Legs out.', likely: 'Shorts it is.', borderline: 'Legs out, just.' },
  pants: { strong: "Don't be a hero.", likely: 'Pants today.', borderline: 'Pants, just.' },
}

export function reasonFor(day: DayVerdict, baseline: DayVerdict): string {
  const feelsLike = Math.round(day.average.apparentTemp)
  const actual = Math.round(day.average.temp)
  const feels = actual === feelsLike ? `Feels like ${feelsLike}°` : `${actual}°, feels like ${feelsLike}°`
  if (day.garment !== baseline.garment) {
    return day.garment === 'pants' ? `${feels}, but you run cold. Pants, no shame.` : `${feels}, but you run hot. Legs out.`
  }
  const lean = (key: FactorKey) => day.factors.find((f) => f.key === key)?.lean ?? 0
  let detail = ''
  if (lean('wind') <= -1 && lean('wind') <= lean('rain')) detail = ` with a stiff ${windName(day.average.windDir)}`
  else if (lean('rain') <= -1) detail = ' with rain about'
  else if (day.garment === 'shorts' && day.average.windKmh < 12) detail = ', barely a breeze'
  return `${feels}${detail}. ${PHRASES[day.garment][day.confidence]}`
}
