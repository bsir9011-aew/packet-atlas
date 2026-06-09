import { describe, expect, it } from 'vitest'
import { useAtlasStore } from '../../src/features/packet-atlas/store/atlasStore'

describe('animated journey store', () => {
  it('tracks visited stages and playback controls centrally', () => {
    useAtlasStore.getState().resetAnimatedJourney('url-intent')

    expect(useAtlasStore.getState().selectedStageId).toBe('url-intent')
    expect(useAtlasStore.getState().visitedStageIds).toEqual(['url-intent'])

    useAtlasStore.getState().setSelectedStageId('dns-query')

    expect(useAtlasStore.getState().visitedStageIds).toContain('url-intent')
    expect(useAtlasStore.getState().visitedStageIds).toContain('dns-query')

    useAtlasStore.getState().setAnimatedJourneyPlaying(true)
    useAtlasStore.getState().setAnimatedJourneySpeed('fast')

    expect(useAtlasStore.getState().animatedJourneyPlaying).toBe(true)
    expect(useAtlasStore.getState().animatedJourneySpeed).toBe('fast')
  })
})
