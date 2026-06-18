import { describe, expect, it } from 'vitest'
import {
  getScenarioTranslation,
  translateScenarioText,
} from '../../src/features/packet-atlas/i18n/atlasI18n'

describe('play mode Polish content pass', () => {
  it('translates common stage labels', () => {
    expect(translateScenarioText('pl', 'URL intent')).toBe('Intencja URL')
    expect(translateScenarioText('pl', 'DNS query')).toBe('Zapytanie DNS')
    expect(translateScenarioText('pl', 'TCP handshake')).toBe('Uzgodnienie TCP')
  })

  it('translates visible Play Mode learning content', () => {
    expect(translateScenarioText('pl', 'The page is loading.')).toBe('Strona się ładuje.')
    expect(
      translateScenarioText(
        'pl',
        'The router forwards the packet and translates the private source address to its public address.',
      ),
    ).toBe('Router przekazuje pakiet i tłumaczy prywatny adres źródłowy na adres publiczny.')
  })

  it('keeps source-only mode in English', () => {
    expect(getScenarioTranslation('pl', 'The page is loading.', 'source')).toEqual({
      primary: 'The page is loading.',
      secondary: null,
    })
  })

  it('keeps bilingual mode with Polish primary and English source', () => {
    expect(getScenarioTranslation('pl', 'The page is loading.', 'bilingual')).toEqual({
      primary: 'Strona się ładuje.',
      secondary: 'The page is loading.',
    })
  })
})
