import { describe, expect, it } from 'vitest'
import { parseScheme, resolveScheme, toggleScheme } from './scheme'

describe('scheme', () => {
  it('only accepts known schemes from storage', () => {
    expect(parseScheme('dark')).toBe('dark')
    expect(parseScheme('light')).toBe('light')
    expect(parseScheme('system')).toBeNull()
    expect(parseScheme(null)).toBeNull()
  })

  it('follows the system until the viewer picks one', () => {
    expect(resolveScheme(null, true)).toBe('dark')
    expect(resolveScheme(null, false)).toBe('light')
    expect(resolveScheme('light', true)).toBe('light')
    expect(resolveScheme('dark', false)).toBe('dark')
  })

  it('toggles between light and dark', () => {
    expect(toggleScheme('light')).toBe('dark')
    expect(toggleScheme('dark')).toBe('light')
  })
})
