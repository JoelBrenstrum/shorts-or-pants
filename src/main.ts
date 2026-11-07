import './style.css'
import { dateLabel, factorCards, formatClock, slotFlag, switchSummary, tuneHint, tuneLabel, weekday, type Slot } from './copy'
import { currentSlotTime, dayWeather, fetchForecast, groupByDate, todaySlots, weatherKind, type Forecast, type WeatherKind } from './forecast'
import { LOCKED, PANTS, SHORTS, type Art } from './art'
import { choose, COLLECTION_KEY, collectionDay, emptyCollection, isFresh, openCollection, sealCollection, type Collection } from './collection'
import { parseScheme, resolveScheme, SCHEME_KEY, toggleScheme, type Scheme } from './scheme'
import { geocodeUrl, parseGeocodeResults, parseReverseGeocode, reverseGeocodeUrl, type Place, type SearchResult } from './location'
import {
  capitalise,
  confidenceLabel,
  confidenceSegments,
  formatHour,
  MAX_BIAS,
  MIN_BIAS,
  reasonFor,
  scoreHour,
  summarizeDay,
  type Garment,
} from './verdict'

type Source = 'gps' | 'ip' | 'manual' | 'default'
type Located = Place & { source: Source }

const DEFAULT_PLACE: Located = { latitude: -36.85, longitude: 174.76, name: 'Auckland', source: 'default' }
const BIAS_KEY = 'sop:bias'

const state = {
  loading: true,
  locating: false,
  error: false,
  gpsFailed: false,
  place: null as Located | null,
  ipPlace: null as Place | null,
  forecast: null as Forecast | null,
  bias: readBias(),
  whyOpen: true,
  searchOpen: false,
  query: '',
  results: null as SearchResult[] | null,
  animate: true,
}

const app = document.querySelector<HTMLDivElement>('#app')!
const ART: Record<Garment, Art[]> = { shorts: SHORTS, pants: PANTS }
let collection = readCollection()

function readCollection(): Collection {
  try {
    return openCollection(localStorage.getItem(COLLECTION_KEY))
  } catch {
    return emptyCollection()
  }
}

function heroArt(garment: Garment, date: string): Art {
  const set = ART[garment]
  const result = choose(collection, garment, date, set.map((a) => a.name))
  if (result.changed) {
    collection = result.collection
    try {
      localStorage.setItem(COLLECTION_KEY, sealCollection(collection))
    } catch {}
  }
  return set.find((a) => a.name === result.name) ?? set[0]!
}
const systemDark = matchMedia('(prefers-color-scheme: dark)')
let savedScheme = readScheme()

function readScheme(): Scheme | null {
  try {
    return parseScheme(localStorage.getItem(SCHEME_KEY))
  } catch {
    return null
  }
}

function currentScheme(): Scheme {
  return resolveScheme(savedScheme, systemDark.matches)
}

function applyScheme() {
  document.documentElement.dataset.scheme = currentScheme()
}

function setScheme(scheme: Scheme) {
  savedScheme = scheme
  try {
    localStorage.setItem(SCHEME_KEY, scheme)
  } catch {}
  applyScheme()
  render()
}

function readBias(): number {
  try {
    const value = Number(localStorage.getItem(BIAS_KEY) ?? 0)
    return Number.isInteger(value) ? Math.max(MIN_BIAS, Math.min(MAX_BIAS, value)) : 0
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

const STROKE = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"'

const icon = (size: number, body: string, attrs: string, label?: string) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} ${attrs}>${body}</svg>`

const GARMENT_PATHS: Record<Garment, string> = {
  shorts: '<path d="M4 5h16l1.3 11H14l-2-6.2L10 16H2.7z"/>',
  pants: '<path d="M5.2 2.5h13.6l1.2 19h-5.6L12 9.2 9.6 21.5H4z"/>',
}

const garmentIcon = (garment: Garment, size: number) => icon(size, GARMENT_PATHS[garment], 'fill="currentColor"', capitalise(garment))

const WEATHER: Record<WeatherKind, [string, string]> = {
  sun: ['Sunny', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>'],
  night: ['Clear', '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'],
  cloud: ['Cloudy', '<path d="M7 18.5h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 11 3.75 3.75 0 0 0 7 18.5z"/>'],
  rain: ['Rain', '<path d="M7 14h10a3.5 3.5 0 0 0 .5-6.96A5.5 5.5 0 0 0 7 7.5 3.25 3.25 0 0 0 7 14z"/><path d="M8.5 17l-1 3M12.5 17l-1 3M16.5 17l-1 3"/>'],
  wind: ['Windy', '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h14a3 3 0 1 1-3 3M3 12h7"/>'],
}

const weatherIcon = (kind: WeatherKind) => icon(20, WEATHER[kind][1], `${STROKE} stroke-width="2"`, WEATHER[kind][0])

const SPINNER = icon(18, '<path d="M12 3a9 9 0 1 1-9 9"/>', `class="spin" ${STROKE} stroke-width="3"`)
const PIN = icon(
  18,
  '<path d="M12 21.5s-7-6.2-7-11.7A7 7 0 0 1 19 9.8c0 5.5-7 11.7-7 11.7z"/><circle cx="12" cy="9.6" r="2.4" fill="var(--card)"/>',
  'fill="var(--accent)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"',
)
const PIN_DASHED = icon(18, '<path d="M12 21.5s-7-6.2-7-11.7A7 7 0 0 1 19 9.8c0 5.5-7 11.7-7 11.7z"/>', `${STROKE} stroke-width="2" stroke-dasharray="3 2.5"`)
const CHEVRON = (size: number, cls = '') => icon(size, '<path d="M6 9l6 6 6-6"/>', `${cls ? `class="${cls}" ` : ''}${STROKE} stroke-width="2.5"`)
const NO_LOCATION = icon(22, '<circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M4 4l16 16"/>', `${STROKE} stroke-width="2.2"`)
const SEARCH = icon(20, '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>', `${STROKE} stroke-width="2.4"`)
const TARGET = icon(
  20,
  '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
  `${STROKE} stroke-width="2.2"`,
)
const WARNING = icon(18, '<path d="M12 8v5M12 16.5v.5"/><path d="M10.3 3.6L2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/>', `${STROKE} stroke-width="2.4"`)
const SUN = icon(20, WEATHER.sun[1], `${STROKE} stroke-width="2.2"`)
const MOON = icon(20, WEATHER.night[1], `${STROKE} stroke-width="2.2"`)
const HANGER_ICON = icon(20, '<path d="M12 7c0-2 3-2 3-4.5S12 0 11 1.5"/><path d="M12 7L2.5 14.5h19z"/>', `${STROKE} stroke-width="2.2"`)
const CLOSE = icon(22, '<path d="M6 6l12 12M18 6L6 18"/>', `${STROKE} stroke-width="2.6"`)
const HANGER =
  '<svg class="sway" width="170" height="190" viewBox="0 0 170 190" aria-hidden="true" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M85 34c0-12 18-12 18-24S85-2 80 6"/><path d="M85 34L14 78h142z"/><path d="M50 98h70l6 76H96l-11-48-11 48H44z" stroke-dasharray="9 9" opacity=".55"/></svg>'

function gpsCoords(): Promise<{ latitude: number; longitude: number } | null> {
  if (!('geolocation' in navigator)) return Promise.resolve(null)
  return new Promise((resolve) => {
    const giveUp = setTimeout(() => resolve(null), 12_000)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(giveUp)
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      },
      () => {
        clearTimeout(giveUp)
        resolve(null)
      },
      { maximumAge: 30 * 60_000, timeout: 10_000 },
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

async function gpsPlaceName(latitude: number, longitude: number): Promise<string | null> {
  try {
    const res = await fetch(reverseGeocodeUrl(latitude, longitude))
    return res.ok ? parseReverseGeocode(await res.json()) : null
  } catch {
    return null
  }
}

async function gpsPlace(coords: { latitude: number; longitude: number }): Promise<Located> {
  const name = (await gpsPlaceName(coords.latitude, coords.longitude)) ?? state.ipPlace?.name ?? 'Your location'
  return { ...coords, name, source: 'gps' }
}

async function searchPlaces(query: string): Promise<SearchResult[]> {
  const res = await fetch(geocodeUrl(query))
  if (!res.ok) return []
  return parseGeocodeResults(await res.json())
}

function renderPill(): string {
  if (state.locating || (state.loading && !state.place)) return `${SPINNER}<span>Locating…</span>`
  const place = state.place ?? DEFAULT_PLACE
  if (place.source === 'ip' || place.source === 'default') {
    return `${PIN_DASHED}<span class="pill-city">Roughly ${esc(place.name)}?</span><span class="pill-link">Change</span>`
  }
  return `${PIN}<span class="pill-city">${esc(place.name)}</span><span class="pill-tag">${place.source === 'manual' ? 'Set' : 'GPS'}</span>${CHEVRON(16)}`
}

function renderBanner(): string {
  const place = state.place
  if (state.loading || !place || place.source === 'gps' || place.source === 'manual') return ''
  const name = esc(place.name)
  const [title, text] = state.gpsFailed
    ? ["GPS didn't come through.", `Check this site's location permission, or pick your city. For now, we're guessing ${name}.`]
    : place.source === 'ip'
      ? ["Location's off, so we guessed.", `Your connection puts you roughly in ${name}. Close enough for trousers? If not, pick your city.`]
      : [`Couldn't find you, so we picked ${name}.`, 'Pick your city for a verdict that actually applies to your legs.']
  return `<section class="card" aria-label="Location fallback">
    <div class="banner-row">
      <span class="banner-icon" aria-hidden="true">${NO_LOCATION}</span>
      <div><p class="banner-title">${title}</p><p class="banner-text">${text}</p></div>
    </div>
    <div class="actions">
      <button type="button" class="btn-solid" data-action="open-search">Change city</button>
      <button type="button" class="btn-outline" data-action="use-gps">Try GPS again</button>
    </div>
  </section>`
}

function renderResults(): string {
  if (state.results === null) return ''
  return state.results
    .map(
      (r, i) => `<li><button type="button" data-action="pick" data-index="${i}">
        <span class="result-name">${esc(r.name)}</span><span class="result-region">${esc(r.region)}</span>
      </button></li>`,
    )
    .join('')
}

function renderNoResults(): string {
  return state.results?.length === 0 && state.query.trim()
    ? '<p class="muted-note">Nowhere by that name. Check the spelling, or it might just be a very small town.</p>'
    : ''
}

function renderSearch(): string {
  if (!state.searchOpen) return ''
  return `<section class="card" aria-label="Choose a city">
    <label for="sop-city" class="search-label">Pick a city</label>
    <div class="search-box">${SEARCH}<input id="sop-city" type="search" placeholder="Try Wellington, Dunedin…" value="${esc(state.query)}" autocomplete="off" /></div>
    <button type="button" class="link-btn" data-action="use-gps">${TARGET}Use my current location</button>
    <ul class="results" id="sop-results">${renderResults()}</ul>
    <div id="sop-noresults">${renderNoResults()}</div>
  </section>`
}

function renderLoading(): string {
  return `<section class="loading-hero" aria-label="Loading" aria-busy="true">
      <p class="eyebrow">Today, wear</p>
      <p class="hmm pulse">Hmm…</p>
      <div class="loading-art"><div class="halo" aria-hidden="true"></div>${HANGER}</div>
      <p class="loading-title">Checking the sky above your actual head…</p>
      <p class="loading-sub">Allow location for the most accurate verdict. Takes a second.</p>
    </section>
    <section class="skeleton" aria-hidden="true">
      <div class="skel-title pulse"></div>
      <div class="skel-slots">${'<div class="skel-slot pulse"></div>'.repeat(6)}</div>
      <div class="skel-row first pulse"></div>
      <div class="skel-row pulse"></div>
    </section>`
}

function renderError(): string {
  return `<section class="error">
    <p class="hmm">Huh.</p>
    <p class="loading-title">Couldn't get the weather. The sky is keeping secrets.</p>
    <button type="button" class="btn-solid" data-action="retry">Try again</button>
  </section>`
}

function todayHoursOf(forecast: Forecast) {
  return groupByDate(forecast.hours).get(forecast.now.slice(0, 10)) ?? forecast.hours.slice(0, 24)
}

function renderReady(forecast: Forecast): string {
  const { now, hours } = forecast
  const today = now.slice(0, 10)
  const todayHours = todayHoursOf(forecast)
  const day = summarizeDay(todayHours, state.bias)
  const baseline = summarizeDay(todayHours, 0)
  const unlockDay = collectionDay(forecast.instant)
  const art = heroArt(day.garment, unlockDay)
  const fresh = isFresh(collection, art.name, unlockDay)

  const slotHours = todaySlots(hours, now)
  const slots: Slot[] = slotHours.map((h) => ({ time: h.time, garment: scoreHour(h, state.bias).garment }))
  const nowTime = currentSlotTime(slotHours, now)
  const segments = confidenceSegments(day.score)

  const slotHtml = slotHours
    .map((h, i) => {
      const slot = slots[i]!
      const flag = slotFlag(slots, i, nowTime)
      return `<div class="slot-col">
        <span class="flag ${flag.toLowerCase()}">${flag || '&nbsp;'}</span>
        <div class="slot slide tone-${slot.garment}${flag === 'Now' ? ' is-now' : ''}" style="animation-delay:${(0.25 + i * 0.07).toFixed(2)}s">
          <span class="slot-time">${formatHour(h.time)}</span>
          ${garmentIcon(slot.garment, 26)}
          <span class="slot-temp">${Math.round(h.temp)}°</span>
          <span class="slot-feels">feels ${Math.round(h.apparentTemp)}°</span>
          ${weatherIcon(weatherKind(h))}
          <span class="slot-word">${capitalise(slot.garment)}</span>
        </div>
      </div>`
    })
    .join('')

  const stripHtml = slots.map((s) => `<span class="tone-${s.garment}"></span>`).join('')

  const factorHtml = factorCards(todayHours, day)
    .map(
      (f) => `<div class="factor">
        <span class="factor-name">${f.name}</span>
        <span class="factor-value">${f.value}${f.actual ? ` <span class="factor-actual">${f.actual}</span>` : ''}</span>
        <span class="factor-note">${f.note}</span>
        <div class="lean-bar" role="img" aria-label="${f.leanLabel}">
          <span class="lean-mid"></span>
          <span class="lean-dot${f.tone === 'neutral' ? '' : ` tone-${f.tone}`}" style="left:${f.position}%"></span>
        </div>
        <div class="lean-scale"><span>Pants</span><span class="${f.tone}">${f.leanLabel}</span><span>Shorts</span></div>
      </div>`,
    )
    .join('')

  const weekHtml = [...groupByDate(hours)]
    .slice(0, 7)
    .map(([date, dayHours], i) => {
      const v = summarizeDay(dayHours, state.bias)
      const isToday = date === today
      const wx = dayWeather(dayHours)
      return `<li class="day slide${isToday ? ' today' : ''}" style="animation-delay:${(0.3 + i * 0.05).toFixed(2)}s">
        <span class="day-name"><span>${weekday(date)}</span><span class="day-tag">${isToday ? 'Today' : ''}</span></span>
        <span class="day-icon tone-${v.garment}">${garmentIcon(v.garment, 22)}</span>
        <span class="day-word ${v.garment}">${capitalise(v.garment)}</span>
        <span class="day-wx">${weatherIcon(wx.kind)}<span class="day-rain">${wx.rainChance >= 20 ? `${wx.rainChance}%` : ''}</span></span>
        <span class="day-temps"><span class="day-actual">${Math.round(v.tempHigh)}° <span>/ ${Math.round(v.tempLow)}°</span></span><span class="day-feels">feels ${Math.round(v.high)}° / ${Math.round(v.low)}°</span></span>
      </li>`
    })
    .join('')

  return `<div class="columns">
      <div class="column main">
        <section class="hero" aria-label="Today's verdict">
          <p class="eyebrow">${dateLabel(today)} · today, wear</p>
          <h1 class="word pop ${day.garment}">${day.garment.toUpperCase()}</h1>
          <div class="hero-art">
            <div class="halo" aria-hidden="true"></div>
            <button type="button" class="garment drop" data-action="open-wardrobe" aria-label="${art.name}. See the wardrobe">${art.svg}</button>
            ${fresh ? `<button type="button" class="new-badge" data-action="open-wardrobe">New in your wardrobe!</button>` : ''}
          </div>
          <p class="reason">${esc(reasonFor(day, baseline))}</p>
          ${day.caveat ? `<span class="caveat">${WARNING}${esc(day.caveat)}</span>` : ''}
          <div class="confidence">
            <div class="segments" role="img" aria-label="Confidence ${segments} out of 5">${[0, 1, 2, 3, 4].map((i) => `<span${i < segments ? ' class="on"' : ''}></span>`).join('')}</div>
            <span class="confidence-label">${confidenceLabel(day)}</span>
          </div>
        </section>
        <section class="hourly" aria-labelledby="sop-hourly">
          <div class="section-head">
            <h2 id="sop-hourly">Today, hour by hour</h2>
            <span class="switch-summary">${switchSummary(slots, nowTime, day.garment)}</span>
          </div>
          <div class="slots">${slotHtml}</div>
          <div class="strip" aria-hidden="true">${stripHtml}</div>
        </section>
      </div>
      <div class="column side">
        <section class="why${state.whyOpen ? ' open' : ''}">
          <button type="button" class="why-toggle" data-action="toggle-why" aria-expanded="${state.whyOpen}" aria-controls="sop-why">
            <span class="why-title"><strong>Why?</strong><span>5 things we weighed</span></span>
            ${CHEVRON(22, 'chevron')}
          </button>
          ${state.whyOpen ? `<div id="sop-why" class="factors">${factorHtml}</div>` : ''}
        </section>
        <section class="card tuning" aria-labelledby="sop-tune-h">
          <div class="tuning-head">
            <h2 id="sop-tune-h">Personal tuning</h2>
            <span class="tune-label">${tuneLabel(state.bias)}</span>
          </div>
          <label for="sop-tune">How do you usually run?</label>
          <input id="sop-tune" type="range" min="${MIN_BIAS}" max="${MAX_BIAS}" step="1" value="${state.bias}" />
          <div class="tune-ends"><span>← I run cold</span><span>I run hot →</span></div>
          <p class="tune-hint">${tuneHint(todayHours, state.bias)}</p>
        </section>
      </div>
    </div>
    <section class="week-section" aria-labelledby="sop-week">
      <h2 id="sop-week">This week</h2>
      <ol class="week">${weekHtml}</ol>
    </section>
    <div class="wardrobe-cta">
      <button type="button" class="btn-outline" data-action="open-wardrobe">${HANGER_ICON}See the wardrobe</button>
    </div>
    <footer>
      <span>Verdicts use feels-like temps · updated ${formatClock(now)}</span>
      <span>Not responsible for chilly knees.</span>
    </footer>`
}

const wardrobe = document.createElement('dialog')
wardrobe.className = 'wardrobe'
wardrobe.setAttribute('aria-labelledby', 'sop-wardrobe-h')
document.body.append(wardrobe)

function openWardrobe() {
  const today = state.forecast ? collectionDay(state.forecast.instant) : ''
  const shown = state.forecast ? heroArt(summarizeDay(todayHoursOf(state.forecast), state.bias).garment, today).name : undefined
  const owned = (a: Art) => collection.unlocked.includes(a.name)
  const card = (garment: Garment) => (a: Art) => {
    if (!owned(a)) {
      return `<li class="wardrobe-item wardrobe-${garment} locked">
        <div class="wardrobe-art" aria-hidden="true">${LOCKED[garment]}</div>
        <span class="wardrobe-name">???</span>
        <span class="wardrobe-note">Turns up on a ${garment} day</span>
      </li>`
    }
    const tag = isFresh(collection, a.name, today) ? 'New' : a.name === shown ? 'Today' : ''
    return `<li class="wardrobe-item wardrobe-${garment}${a.name === shown ? ' picked' : ''}">
      ${tag ? `<span class="picked-tag">${tag}</span>` : ''}
      <div class="wardrobe-art">${a.svg}</div>
      <span class="wardrobe-name">${a.name}</span>
      <span class="wardrobe-note">${a.note}</span>
    </li>`
  }
  const count = (set: Art[]) => set.filter(owned).length
  const total = count(SHORTS) + count(PANTS)
  const all = SHORTS.length + PANTS.length
  const progress =
    total === all
      ? 'Full set. Absolute legend.'
      : `You've collected ${total} of ${all}. A new one turns up each day you visit.`
  wardrobe.innerHTML = `<div class="wardrobe-inner">
      <div class="wardrobe-head">
        <div>
          <h2 id="sop-wardrobe-h">The wardrobe</h2>
          <p>${progress}</p>
          <div class="progress" role="img" aria-label="${total} of ${all} collected"><span style="width:${Math.round((total / all) * 100)}%"></span></div>
        </div>
        <button type="button" class="scheme-toggle" data-action="close-wardrobe" aria-label="Close">${CLOSE}</button>
      </div>
      <h3>Shorts · ${count(SHORTS)}/${SHORTS.length}</h3>
      <ul class="wardrobe-grid">${SHORTS.map(card('shorts')).join('')}</ul>
      <h3>Pants · ${count(PANTS)}/${PANTS.length}</h3>
      <ul class="wardrobe-grid">${PANTS.map(card('pants')).join('')}</ul>
    </div>`
  wardrobe.showModal()
}

wardrobe.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target === wardrobe || target.closest('[data-action="close-wardrobe"]')) wardrobe.close()
})

function render() {
  const ready = !state.loading && !state.error && state.forecast
  document.body.dataset.theme = ready && state.forecast ? summarizeDay(todayHoursOf(state.forecast), state.bias).garment : 'neutral'
  const body = state.error ? renderError() : ready && state.forecast ? renderReady(state.forecast) : renderLoading()
  app.innerHTML = `<div class="wrap${state.animate ? ' animate' : ''}">
    <header>
      <button type="button" class="pill" data-action="toggle-search" aria-expanded="${state.searchOpen}" aria-label="Change location">${renderPill()}</button>
      <div class="brand">
        <button type="button" class="scheme-toggle" data-action="toggle-scheme" aria-label="Switch to ${currentScheme() === 'dark' ? 'light' : 'dark'} mode">${currentScheme() === 'dark' ? SUN : MOON}</button>
        <span class="logo">shorts<br>or pants</span>
      </div>
    </header>
    ${renderBanner()}
    ${renderSearch()}
    ${body}
  </div>`
  if (ready) state.animate = false
}

function paintResults() {
  const list = document.getElementById('sop-results')
  const empty = document.getElementById('sop-noresults')
  if (list) list.innerHTML = renderResults()
  if (empty) empty.innerHTML = renderNoResults()
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
let searchSeq = 0

function onQuery(query: string) {
  state.query = query
  clearTimeout(searchTimer)
  if (!query.trim()) {
    state.results = null
    paintResults()
    return
  }
  searchTimer = setTimeout(async () => {
    const seq = ++searchSeq
    const results = await searchPlaces(query.trim()).catch(() => [])
    if (seq !== searchSeq) return
    state.results = results
    paintResults()
  }, 250)
}

function openSearch(open: boolean) {
  state.searchOpen = open
  render()
  if (open) document.getElementById('sop-city')?.focus()
}

async function useGps() {
  state.locating = true
  state.searchOpen = false
  render()
  const gps = await gpsCoords()
  state.locating = false
  if (gps) {
    state.gpsFailed = false
    await load(await gpsPlace(gps))
  } else {
    state.gpsFailed = true
    render()
  }
}

async function load(place: Located) {
  state.place = place
  state.loading = true
  state.error = false
  render()
  try {
    state.forecast = await fetchForecast(place.latitude, place.longitude)
    state.animate = true
  } catch {
    state.error = true
  }
  state.loading = false
  render()
}

async function start() {
  render()
  const [gps, ip] = await Promise.all([gpsCoords(), ipPlace()])
  state.ipPlace = ip
  if (gps) await load(await gpsPlace(gps))
  else if (ip) await load({ ...ip, source: 'ip' })
  else await load(DEFAULT_PLACE)
}

app.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!target) return
  const action = target.dataset.action
  if (action === 'open-wardrobe') {
    openWardrobe()
  } else if (action === 'toggle-scheme') {
    setScheme(toggleScheme(currentScheme()))
  } else if (action === 'toggle-why') {
    state.whyOpen = !state.whyOpen
    render()
  } else if (action === 'toggle-search') {
    if (!state.loading && !state.locating) openSearch(!state.searchOpen)
  } else if (action === 'open-search') {
    openSearch(true)
  } else if (action === 'use-gps') {
    void useGps()
  } else if (action === 'retry' && state.place) {
    void load(state.place)
  } else if (action === 'pick') {
    const picked = state.results?.[Number(target.dataset.index)]
    if (!picked) return
    state.searchOpen = false
    state.query = ''
    state.results = null
    state.gpsFailed = false
    void load({ ...picked, source: 'manual' })
  }
})

app.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement
  if (target.id === 'sop-city') onQuery(target.value)
})

app.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement
  if (target.id !== 'sop-tune') return
  state.bias = Number(target.value)
  saveBias(state.bias)
  render()
})

systemDark.addEventListener('change', () => {
  applyScheme()
  render()
})

applyScheme()
void start()
