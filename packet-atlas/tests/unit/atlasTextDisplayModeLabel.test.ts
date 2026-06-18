import { describe, expect, it } from 'vitest'
import { getTextDisplayModeLabel } from '../../src/features/packet-atlas/i18n/atlasI18n'

describe('atlas text display mode label', () => {
  it('labels canonical display modes', () => {
    expect(getTextDisplayModeLabel('pl', 'translated')).toBe('PL only')
    expect(getTextDisplayModeLabel('pl', 'bilingual')).toBe('PL + EN')
    expect(getTextDisplayModeLabel('pl', 'source')).toBe('EN only')

    expect(getTextDisplayModeLabel('en', 'translated')).toBe('PL only')
    expect(getTextDisplayModeLabel('en', 'bilingual')).toBe('PL + EN')
    expect(getTextDisplayModeLabel('en', 'source')).toBe('EN only')
  })

  it('supports legacy alias names', () => {
    expect(getTextDisplayModeLabel('pl', 'pl-only')).toBe('PL only')
    expect(getTextDisplayModeLabel('pl', 'plOnly')).toBe('PL only')
    expect(getTextDisplayModeLabel('pl', 'pl-plus-en')).toBe('PL + EN')
    expect(getTextDisplayModeLabel('pl', 'en-only')).toBe('EN only')
    expect(getTextDisplayModeLabel('pl', 'enOnly')).toBe('EN only')
  })

  it('falls back safely for unknown modes', () => {
    expect(getTextDisplayModeLabel('pl', 'custom')).toBe('custom')
  })
})
