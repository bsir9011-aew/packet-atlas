import { describe, expect, it } from 'vitest'
import { useAtlasStore } from '../../src/features/packet-atlas/store/atlasStore'

describe('atlas language store', () => {
  it('toggles between English and Polish', () => {
    useAtlasStore.getState().setLanguage('en')
    expect(useAtlasStore.getState().language).toBe('en')

    useAtlasStore.getState().toggleLanguage()
    expect(useAtlasStore.getState().language).toBe('pl')

    useAtlasStore.getState().toggleLanguage()
    expect(useAtlasStore.getState().language).toBe('en')
  })
})
