import './style.css'
import { currentSlotTime, dayLabel, fetchForecast, groupByDate, todaySlots, weatherGlyph, type Forecast } from './forecast'
import { pickArt } from './garments'
import { geocodeUrl, parseGeocode, type Place } from './location'
import { formatHour, reasonFor, scoreHour, summarizeDay, type Confidence, type Factor } from './verdict'

type Source = 'gps' | 'ip' | 'search' | 'default'
type Located = Place & { source: Source }

const DEFAULT_PLACE: Located = { latitude: -36.85, longitude: 174.76, name: 'Auckland', source: 'default' }
const BIAS_KEY = 'sop:bias'
const CONFIDENCE_LABEL: Record<Confidence, string> = {
  strong: 'Strong call',
  likely: 'Pretty sure',
  borderline: 'Borderline, your call',
}

const app = document.querySelector<HTMLDivElement>('#app')!
let place: Located = DEFAULT_PLACE
let forecast: Forecast | null = null
let bias = readBias()

function readBias(): number {
  try {
    return Number(localStorage.getItem(BIAS_KEY) ?? 0) || 0
  } catch {
    return 0
  }
}

function saveBias(value: number) {
  try {
    localStorage.setItem(BIAS_KEY, String(value))
  } catch {}
}

function esc(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

function gpsCoords(): Promise<{ latitude: number; longitude: number } | null> {
  if (!('geolocation' in navigator)) return Promise.resolve(null)
  return new Promise((resolve) => {
    const giveUp = setTimeout(() => resolve(null), 10_000)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(giveUp)
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      },
      () => {
        clearTimeout(giveUp)
        resolve(null)
      },
      { maximumAge: 30 * 60_000, timeout: 8_000 },
    )
  })
}

async function ipPlace(): Promise<Place | null> {
  try {
    const res = await fetch('/api/location')
    if (!res.ok) return null
    return (await res.json()) as Place
  } catch {
    return null
  }
}

async function locate(): Promise<Located> {
  const [gps, ip] = await Promise.all([gpsCoords(), ipPlace()])
  if (gps) return { ...gps, name: ip?.name ?? 'Your location', source: 'gps' }
  if (ip) return { ...ip, source: 'ip' }
  return DEFAULT_PLACE
}

async function searchPlace(query: string): Promise<Located | null> {
  const res = await fetch(geocodeUrl(query))
  if (!res.ok) return null
  const found = parseGeocode(await res.json())
  return found ? { ...found, source: 'search' } : null
}

function factorLean(f: Factor): string {
  if (f.lean > 0.2) return '→ shorts'
  if (f.lean < -0.2) return '→ pants'
  return 'neutral'
}

function locationLabel(): string {
  const name = esc(place.name)
  if (place.source === 'ip') return `📍 Roughly ${name}?`
  if (place.source === 'default') return `📍 ${name} (couldn't find you)`
  return `📍 ${name}`
}

function renderStatus(message: string) {
  app.innerHTML = `<p class="status">${esc(message)}</p>`
}

function render() {
  if (!forecast) return
  const { now, hours } = forecast
  const today = now.slice(0, 10)
  const days = groupByDate(hours)
  const todayHours = days.get(today) ?? hours.slice(0, 24)
  const day = summarizeDay(todayHours, bias)
  const art = pickArt(day.garment, today)
  const slots = todaySlots(hours, now)
  const nowSlot = currentSlotTime(slots, now)
  document.body.className = day.garment

  const slotHtml = slots
    .map((h) => {
      const v = scoreHour(h, bias)
      return `<div class="slot ${v.garment}${h.time === nowSlot ? ' now' : ''}">
        <strong>${formatHour(h.time)}</strong>
        <div class="icon">${pickArt(v.garment, today).svg}</div>
        <span>${weatherGlyph(h.weatherCode, h.isDay)} ${Math.round(h.apparentTemp)}°</span>
      </div>`
    })
    .join('')

  const factorHtml = day.factors
    .map(
      (f) => `<div class="factor"><span>${f.label}</span><span class="value">${f.value}</span><span class="lean">${factorLean(f)}</span></div>`,
    )
    .join('')

  const weekHtml = [...days]
    .slice(0, 7)
    .map(([date, dayHours]) => {
      const v = summarizeDay(dayHours, bias)
      return `<div class="day${date === today ? ' today' : ''}">
        <span>${dayLabel(date, today)}</span>
        <div class="icon">${pickArt(v.garment, date).svg}</div>
        <span>${v.garment === 'shorts' ? 'Shorts' : 'Pants'}</span>
        <span class="temps">${Math.round(v.low)}° – ${Math.round(v.high)}°</span>
      </div>`
    })
    .join('')

  const chips = [`<span class="chip confidence">${CONFIDENCE_LABEL[day.confidence]}</span>`, ...day.caveats.map((c) => `<span class="chip">${esc(c)}</span>`)]

  app.innerHTML = `<main>
    <div class="location">
      <span>${locationLabel()}</span>
      <form id="search"><input name="q" placeholder="Change city" aria-label="City" /><button>Go</button></form>
    </div>
    <div class="hero">
      <h1 class="verdict">${day.garment}</h1>
      <div class="art" title="${esc(art.name)}">${art.svg}</div>
      <p class="reason">${esc(reasonFor(day))}</p>
      <div class="chips">${chips.join('')}</div>
    </div>
    <section><h2>Today</h2><div class="slots">${slotHtml}</div></section>
    <section><details><summary>Why?</summary><div class="factors">${factorHtml}</div></details></section>
    <section class="tuning">
      <label><span>I run cold</span><span>I run hot</span></label>
      <input id="bias" type="range" min="-3" max="3" step="1" value="${bias}" aria-label="Personal temperature bias" />
    </section>
    <section><h2>This week</h2><div class="week">${weekHtml}</div></section>
  </main>`
}

app.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement
  if (target.id !== 'bias') return
  bias = Number(target.value)
  saveBias(bias)
  render()
})

app.addEventListener('submit', async (e) => {
  e.preventDefault()
  const query = new FormData(e.target as HTMLFormElement).get('q')?.toString().trim()
  if (!query) return
  const found = await searchPlace(query).catch(() => null)
  if (!found) {
    alert(`Couldn't find "${query}"`)
    return
  }
  await load(found)
})

async function load(next: Located) {
  place = next
  try {
    forecast = await fetchForecast(place.latitude, place.longitude)
    render()
  } catch {
    renderStatus("Couldn't get the weather. Try again shortly.")
  }
}

renderStatus('Checking the sky…')
locate().then(load)
