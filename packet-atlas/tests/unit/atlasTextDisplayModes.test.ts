import { describe, expect, it } from 'vitest'
import {
  getScenarioTranslation,
  getTextDisplayModeLabel,
} from '../../src/features/packet-atlas/i18n/atlasI18n'

describe('atlas text display modes', () => {
  it('returns bilingual Polish + English source by default', () => {
    expect(getScenarioTranslation('pl', 'Encrypted session')).toEqual({
      primary: 'Szyfrowana sesja',
      secondary: 'Encrypted session',
    })
  })

  it('can show translated text only', () => {
    expect(getScenarioTranslation('pl', 'Encrypted session', 'translated')).toEqual({
      primary: 'Szyfrowana sesja',
      secondary: null,
    })
  })

  it('can force English source only', () => {
    expect(getScenarioTranslation('pl', 'Encrypted session', 'source')).toEqual({
      primary: 'Encrypted session',
      secondary: null,
    })
  })

  it('labels display modes for the current language', () => {
    expect(getTextDisplayModeLabel('pl', 'translated')).toBe('PL only')
    expect(getTextDisplayModeLabel('pl', 'bilingual')).toBe('PL + EN')
    expect(getTextDisplayModeLabel('pl', 'source')).toBe('EN only')
  })
})
