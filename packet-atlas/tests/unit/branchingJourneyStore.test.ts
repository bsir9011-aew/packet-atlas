import { describe, expect, it } from 'vitest'
import { useAtlasStore } from '../../src/features/packet-atlas/store/atlasStore'

describe('branching journey store', () => {
  it('tracks selected branch preview separately from selected stage', () => {
    const store = useAtlasStore.getState()

    store.resetAnimatedJourney('url-intent')
    store.setSelectedBranchChoiceId('dns-query::dns-failure')

    expect(useAtlasStore.getState().selectedStageId).toBe('url-intent')
    expect(useAtlasStore.getState().selectedBranchChoiceId).toBe('dns-query::dns-failure')
    expect(useAtlasStore.getState().animatedJourneyPlaying).toBe(false)

    useAtlasStore.getState().setSelectedStageId('dns-query')

    expect(useAtlasStore.getState().selectedStageId).toBe('dns-query')
    expect(useAtlasStore.getState().selectedBranchChoiceId).toBeNull()
  })
})
