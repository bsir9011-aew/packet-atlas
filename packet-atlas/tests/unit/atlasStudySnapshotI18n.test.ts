import { describe, expect, it } from 'vitest'
import {
  getScenarioTranslation,
  translateAtlasUi,
  translateScenarioText,
} from '../../src/features/packet-atlas/i18n/atlasI18n'

describe('atlas study snapshot i18n', () => {
  it('exposes study snapshot UI labels in both languages', () => {
    expect(translateAtlasUi('en', 'play.studySnapshot')).toBe('Study snapshot')
    expect(translateAtlasUi('pl', 'play.studySnapshot')).toBe('Migawka nauki')
    expect(translateAtlasUi('pl', 'play.realProcess')).toBe('Co naprawdę się dzieje')
    expect(translateAtlasUi('en', 'play.learningEvidence')).toBe('Learning evidence')
  })

  it('keeps source, translated and bilingual modes predictable', () => {
    expect(getScenarioTranslation('pl', 'Encrypted session', 'source')).toEqual({
      primary: 'Encrypted session',
      secondary: null,
    })

    expect(getScenarioTranslation('pl', 'Encrypted session', 'translated')).toEqual({
      primary: 'Szyfrowana sesja',
      secondary: null,
    })

    expect(getScenarioTranslation('pl', 'Encrypted session', 'bilingual')).toEqual({
      primary: 'Szyfrowana sesja',
      secondary: 'Encrypted session',
    })
  })

  it('adds Polish translations for common learning phrases', () => {
    expect(translateScenarioText('pl', 'Evidence beats guessing.')).toBe(
      'Dowód jest lepszy niż zgadywanie.',
    )
    expect(translateScenarioText('pl', 'DNS lookup')).toBe('Zapytanie DNS')
  })
})
