import { describe, expect, it } from 'vitest'
import {
  translateAtlasUi,
  translateScenarioText,
} from '../../src/features/packet-atlas/i18n/atlasI18n'

describe('play mode layer ladder i18n', () => {
  it('exposes layer ladder UI labels', () => {
    expect(translateAtlasUi('en', 'play.layerLadder')).toBe('Layer ladder')
    expect(translateAtlasUi('pl', 'play.layerLadder')).toBe('Drabina warstw')
    expect(translateAtlasUi('pl', 'play.layerLadderActive')).toBe('Aktywne teraz')
  })

  it('translates layer ladder learning prompts', () => {
    expect(translateScenarioText('pl', 'Human lens')).toBe('Soczewka człowieka')
    expect(
      translateScenarioText('pl', 'Which IP addresses and route decisions matter here?'),
    ).toBe('Jakie adresy IP i decyzje routingu mają tu znaczenie?')
    expect(
      translateScenarioText('pl', 'What would this look like as bits or signals on the medium?'),
    ).toBe('Jak wyglądałoby to jako bity albo sygnały w medium?')
  })
})
