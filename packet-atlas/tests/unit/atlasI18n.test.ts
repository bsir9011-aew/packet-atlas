import { describe, expect, it } from 'vitest'
import {
  translateAtlasUi,
  translateScenarioText,
  translateMotionLabel,
} from '../../src/features/packet-atlas/i18n/atlasI18n'

describe('atlas i18n helpers', () => {
  it('translates play shell labels', () => {
    expect(translateAtlasUi('pl', 'play.exit')).toBe('Wyjdź z Play')
    expect(translateAtlasUi('en', 'play.exit')).toBe('Exit Play')
  })

  it('falls back to English scenario text when no Polish translation exists', () => {
    expect(translateScenarioText('pl', 'Encrypted session')).toBe('Szyfrowana sesja')
    expect(translateScenarioText('pl', 'Unknown packet story')).toBe('Unknown packet story')
  })

  it('translates motion labels by direction', () => {
    expect(translateMotionLabel('pl', 'request')).toBe('Żądanie idzie do przodu')
    expect(translateMotionLabel('en', 'request')).toBe('Request moves forward')
  })
})
