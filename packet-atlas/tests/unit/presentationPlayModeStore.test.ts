import { afterEach, describe, expect, it } from 'vitest'
import { useAtlasStore } from '../../src/features/packet-atlas/store/atlasStore'

afterEach(() => {
  useAtlasStore.setState({
    presentationMode: 'atlas',
    animatedJourneyPlaying: false,
    selectedBranchChoiceId: null,
  })
})

describe('presentation mode store', () => {
  it('toggles between atlas and play presentation modes', () => {
    expect(useAtlasStore.getState().presentationMode).toBe('atlas')

    useAtlasStore.getState().togglePresentationMode()
    expect(useAtlasStore.getState().presentationMode).toBe('play')

    useAtlasStore.getState().togglePresentationMode()
    expect(useAtlasStore.getState().presentationMode).toBe('atlas')
  })

  it('stops autoplay when returning to atlas mode', () => {
    useAtlasStore.getState().setPresentationMode('play')
    useAtlasStore.getState().setAnimatedJourneyPlaying(true)

    useAtlasStore.getState().setPresentationMode('atlas')

    expect(useAtlasStore.getState().presentationMode).toBe('atlas')
    expect(useAtlasStore.getState().animatedJourneyPlaying).toBe(false)
  })
})
