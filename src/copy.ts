import type { HourWeather } from './types'
import {
  activeHours,
  capitalise,
  compass,
  formatHour,
  hourOf,
  MAX_BIAS,
  MIN_BIAS,
  summarizeDay,
  type DayVerdict,
  type FactorKey,
  type Garment,
} from './verdict'

export type Tone = Garment | 'neutral'

export interface FactorCard {
  key: FactorKey
  name: string
  value: string
  actual?: string
  note: string
  position: number
  tone: Tone
  leanLabel: string
}

export interface Slot {
  time: string
  garment: Garment
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function utcDate(date: string): Date {
  return new Date(`${date.slice(0, 10)}T00:00:00Z`)
}

export function weekday(date: string): string {
  return WEEKDAYS[utcDate(date).getUTCDay()] ?? ''
}

export function dateLabel(date: string): string {
  const d = utcDate(date)
  return `${weekday(date)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

export function formatClock(time: string): string {
  const h = hourOf(time)
  return `${h % 12 === 0 ? 12 : h % 12}:${time.slice(14, 16)}${h < 12 ? 'am' : 'pm'}`
}

function toneOf(lean: number): Tone {
  if (lean > 0.2) return 'shorts'
  if (lean < -0.2) return 'pants'
  return 'neutral'
}

const LEAN_LABEL: Record<Tone, string> = { shorts: 'Leans shorts', pants: 'Leans pants', neutral: 'Neutral' }

function humidityNote(humidity: number, feels: number): string {
  if (humidity >= 80 && feels < 14) return 'Damp. Gets into your bones.'
  if (humidity >= 75) return 'Sticky'
  if (humidity >= 60) return 'A touch muggy'
  if (humidity >= 35) return 'Comfortable, not sticky'
  return 'Dry air'
}

function windNote(kmh: number): string {
  if (kmh < 8) return 'Barely a breeze'
  if (kmh < 18) return 'Light breeze'
  if (kmh < 28) return 'Breezy'
  if (kmh < 40) return 'Properly windy'
  return 'Hold onto your hat'
}

function rainNote(maxProb: number): string {
  if (maxProb < 15) return 'Dry all day'
  if (maxProb < 35) return 'Small chance of a shower'
  if (maxProb < 65) return 'Showers likely'
  return 'Wet one'
}

export function uvBand(uv: number): string {
  if (uv < 3) return 'Low'
  if (uv < 6) return 'Moderate'
  if (uv < 8) return 'High'
  if (uv < 11) return 'Very high'
  return 'Extreme'
}

function uvNote(uv: number): string {
  if (uv >= 6) return 'Sun on your legs warms things up'
  if (uv >= 3) return 'Some sun about'
  return 'Not a factor today'
}

export function factorCards(hours: HourWeather[], day: DayVerdict): FactorCard[] {
  const basis = activeHours(hours)
  const avg = day.average
  const peak = basis.reduce((max, h) => (h.apparentTemp > max.apparentTemp ? h : max))
  const maxRain = Math.max(...basis.map((h) => h.precipProb))
  const maxUv = Math.max(...basis.map((h) => h.uv))
  const details: Record<FactorKey, { name: string; value: string; actual?: string; note: string }> = {
    feelsLike: {
      name: 'Feels like',
      value: `${Math.round(avg.apparentTemp)}°`,
      actual: `Actual ${Math.round(avg.temp)}°`,
      note: `Peaks at ${Math.round(peak.apparentTemp)}° around ${formatHour(peak.time)}`,
    },
    humidity: { name: 'Humidity', value: `${Math.round(avg.humidity)}%`, note: humidityNote(avg.humidity, avg.apparentTemp) },
    wind: { name: 'Wind', value: `${Math.round(avg.windKmh)} km/h ${compass(avg.windDir)}`, note: windNote(avg.windKmh) },
    rain: { name: 'Rain chance', value: `${Math.round(maxRain)}%`, note: rainNote(maxRain) },
    sun: { name: 'UV', value: `${Math.round(maxUv)} · ${uvBand(maxUv)}`, note: uvNote(maxUv) },
  }
  return day.factors.map((f) => {
    const tone = toneOf(f.lean)
    return {
      key: f.key,
      ...details[f.key],
      position: Math.round(50 + Math.max(-2.3, Math.min(2.3, f.lean)) * 21),
      tone,
      leanLabel: LEAN_LABEL[tone],
    }
  })
}

const TUNE_LABELS: Record<number, string> = {
  [-3]: 'Always cold',
  [-2]: 'Runs cold',
  [-1]: 'Bit chilly',
  0: 'Average human',
  1: 'Bit warm',
  2: 'Runs hot',
  3: 'Human radiator',
}

export function tuneLabel(bias: number): string {
  return TUNE_LABELS[bias] ?? 'Average human'
}

export function tuneHint(hours: HourWeather[], bias: number): string {
  const at = (b: number) => summarizeDay(hours, b).garment
  const current = at(bias)
  if (bias !== 0 && current !== at(0)) return `Your tuning flipped today to ${current}.`
  const neighbours = [bias - 1, bias + 1].filter((b) => b >= MIN_BIAS && b <= MAX_BIAS)
  if (neighbours.some((b) => at(b) !== current)) return 'Close call. One notch either way could flip today.'
  for (let b = MIN_BIAS; b <= MAX_BIAS; b++) {
    if (at(b) !== current) return 'Holds for now, but a big swing could flip it.'
  }
  return 'Today holds no matter how you run.'
}

export function switchSummary(slots: Slot[], nowTime: string | undefined, dayGarment: Garment): string {
  const nowIndex = slots.findIndex((s) => s.time === nowTime)
  const later = slots.slice(nowIndex + 1).find((s) => s.garment !== dayGarment)
  if (later) return `${capitalise(later.garment)} from ${formatHour(later.time)}`
  if (slots.some((s) => s.garment !== dayGarment)) return `${capitalise(dayGarment)} till late`
  return `${capitalise(dayGarment)} all day`
}

export function slotFlag(slots: Slot[], index: number, nowTime: string | undefined): 'Now' | 'Switch' | '' {
  const slot = slots[index]
  if (!slot) return ''
  if (slot.time === nowTime) return 'Now'
  const previous = slots[index - 1]
  return previous && previous.garment !== slot.garment ? 'Switch' : ''
}
