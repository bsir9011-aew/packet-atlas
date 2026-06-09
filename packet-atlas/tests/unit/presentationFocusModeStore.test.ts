import { describe, expect, it } from 'vitest'
import { useAtlasStore } from '../../src/features/packet-atlas/store/atlasStore'

describe('presentation focus mode store', () => {
  it('toggles between atlas and focus presentation modes', () => {
    const store = useAtlasStore.getState()

    store.setPresentationMode('atlas')
    expect(useAtlasStore.getState().presentationMode).toBe('atlas')

    useAtlasStore.getState().togglePresentationMode()
    expect(useAtlasStore.getState().presentationMode).toBe('focus')

    useAtlasStore.getState().togglePresentationMode()
    expect(useAtlasStore.getState().presentationMode).toBe('atlas')
  })
})
