import { describe, expect, it } from 'vitest'
import {
  translateAtlasUi,
  translateScenarioText,
} from '../../src/features/packet-atlas/i18n/atlasI18n'

describe('play mode memory drill i18n', () => {
  it('exposes memory drill labels in Polish and English', () => {
    expect(translateAtlasUi('en', 'play.memoryDrill')).toBe('Memory drill')
    expect(translateAtlasUi('pl', 'play.memoryDrill')).toBe('Drill pamięci')
    expect(translateAtlasUi('pl', 'play.memoryOperatorMove')).toBe('Ruch operatora')
  })

  it('translates memory drill prompts', () => {
    expect(
      translateScenarioText('pl', 'Which system is holding the packet now?'),
    ).toBe('Który system trzyma teraz pakiet?')

    expect(
      translateScenarioText('pl', 'What evidence would prove this stage happened?'),
    ).toBe('Jaki dowód potwierdziłby, że ten etap się wydarzył?')

    expect(
      translateScenarioText('pl', 'One packet journey, many lenses.'),
    ).toBe('Jedna podróż pakietu, wiele soczewek.')
  })
})
