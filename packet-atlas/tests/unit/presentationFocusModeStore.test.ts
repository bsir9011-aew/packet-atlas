import { describe, expect, it } from 'vitest'
import { useAtlasStore } from '../../src/features/packet-atlas/store/atlasStore'

describe('presentation play mode store', () => {
  it('toggles between atlas and play presentation modes', () => {
    const store = useAtlasStore.getState()

    store.setPresentationMode('atlas')
    expect(useAtlasStore.getState().presentationMode).toBe('atlas')

    useAtlasStore.getState().togglePresentationMode()
    expect(useAtlasStore.getState().presentationMode).toBe('play')

    useAtlasStore.getState().togglePresentationMode()
    expect(useAtlasStore.getState().presentationMode).toBe('atlas')
  })
})
