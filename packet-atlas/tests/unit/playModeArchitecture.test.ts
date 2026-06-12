import { afterEach, describe, expect, it } from 'vitest'
import { useAtlasStore } from '../../src/features/packet-atlas/store/atlasStore'

afterEach(() => {
  useAtlasStore.setState({
    presentationMode: 'atlas',
    animatedJourneyPlaying: false,
    selectedBranchChoiceId: null,
  })
})

describe('true play mode architecture state', () => {
  it('treats play as a first-class mode instead of focus overlay', () => {
    useAtlasStore.getState().setPresentationMode('play')

    expect(useAtlasStore.getState().presentationMode).toBe('play')
  })

  it('stops autoplay when returning to atlas mode', () => {
    useAtlasStore.getState().setPresentationMode('play')
    useAtlasStore.getState().setAnimatedJourneyPlaying(true)

    useAtlasStore.getState().setPresentationMode('atlas')

    expect(useAtlasStore.getState().presentationMode).toBe('atlas')
    expect(useAtlasStore.getState().animatedJourneyPlaying).toBe(false)
  })

  it('toggles between atlas and play mode', () => {
    useAtlasStore.getState().togglePresentationMode()
    expect(useAtlasStore.getState().presentationMode).toBe('play')

    useAtlasStore.getState().togglePresentationMode()
    expect(useAtlasStore.getState().presentationMode).toBe('atlas')
  })
})
