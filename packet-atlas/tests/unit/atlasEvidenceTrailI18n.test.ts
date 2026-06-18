import { describe, expect, it } from 'vitest'
import {
  translateAtlasUi,
  translateScenarioText,
} from '../../src/features/packet-atlas/i18n/atlasI18n'

describe('play mode evidence trail i18n', () => {
  it('exposes evidence trail UI labels', () => {
    expect(translateAtlasUi('en', 'play.evidenceTrail')).toBe('Evidence trail')
    expect(translateAtlasUi('pl', 'play.evidenceTrail')).toBe('Ścieżka dowodowa')
    expect(translateAtlasUi('pl', 'play.evidenceOperatorRule')).toBe('Zasada operatora')
  })

  it('translates evidence trail prompts', () => {
    expect(
      translateScenarioText('pl', 'Only claim what the evidence can support.'),
    ).toBe('Twierdź tylko to, co potwierdza dowód.')

    expect(
      translateScenarioText('pl', 'Where did the journey last look correct?'),
    ).toBe('Gdzie podróż ostatnio wyglądała poprawnie?')

    expect(
      translateScenarioText('pl', 'Do not debug by vibe. Debug by narrowing the boundary.'),
    ).toBe('Nie diagnozuj na wyczucie. Diagnozuj przez zawężanie granicy.')
  })
})
