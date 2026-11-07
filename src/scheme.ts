export type Scheme = 'light' | 'dark'

export const SCHEME_KEY = 'sop:scheme'

export function parseScheme(value: unknown): Scheme | null {
  return value === 'light' || value === 'dark' ? value : null
}

export function resolveScheme(saved: Scheme | null, systemDark: boolean): Scheme {
  return saved ?? (systemDark ? 'dark' : 'light')
}

export function toggleScheme(current: Scheme): Scheme {
  return current === 'dark' ? 'light' : 'dark'
}
