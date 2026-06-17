import { describe, expect, it } from 'vitest'
import { getScenarioTranslation } from '../../src/features/packet-atlas/i18n/atlasI18n'

describe('atlas bilingual scenario text', () => {
  it('returns Polish primary text with English secondary source when translated', () => {
    expect(getScenarioTranslation('pl', 'Encrypted session')).toEqual({
      primary: 'Szyfrowana sesja',
      secondary: 'Encrypted session',
    })
  })

  it('does not duplicate English when English is selected', () => {
    expect(getScenarioTranslation('en', 'Encrypted session')).toEqual({
      primary: 'Encrypted session',
      secondary: null,
    })
  })

  it('falls back safely when Polish translation is missing', () => {
    expect(getScenarioTranslation('pl', 'Unknown packet boundary')).toEqual({
      primary: 'Unknown packet boundary',
      secondary: null,
    })
  })
})
