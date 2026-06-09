import { create } from 'zustand'
import type { LayerLens } from '../schema/journeyScenarioSchema'
import type { TraceSpeed } from '../cinematic/cinematicTraceModel'

type AtlasState = {
  selectedScenarioId: string
  selectedObserverId: string
  selectedVariantId: string
  selectedStageId: string
  selectedLayerLens: LayerLens
  animatedJourneyPlaying: boolean
  animatedJourneySpeed: TraceSpeed
  visitedStageIds: string[]
  setSelectedStageId: (stageId: string) => void
  setSelectedScenarioId: (scenarioId: string) => void
  setSelectedLayerLens: (lens: LayerLens) => void
  setSelectedVariantId: (variantId: string) => void
  setSelectedObserverId: (observerId: string) => void
  setAnimatedJourneyPlaying: (playing: boolean) => void
  setAnimatedJourneySpeed: (speed: TraceSpeed) => void
  resetAnimatedJourney: (stageId: string) => void
}

function rememberStage(stageId: string, visitedStageIds: string[]) {
  return visitedStageIds.includes(stageId)
    ? visitedStageIds
    : [...visitedStageIds, stageId]
}

export const useAtlasStore = create<AtlasState>((set) => ({
  selectedStageId: 'url-intent',
  selectedScenarioId: 'https-example-basic',
  selectedVariantId: 'happy-path',
  selectedObserverId: 'user',
  selectedLayerLens: 'human',
  animatedJourneyPlaying: false,
  animatedJourneySpeed: 'normal',
  visitedStageIds: ['url-intent'],
  setSelectedStageId: (stageId) =>
    set((state) => ({
      selectedStageId: stageId,
      visitedStageIds: rememberStage(stageId, state.visitedStageIds),
    })),
  setSelectedScenarioId: (scenarioId) => set({ selectedScenarioId: scenarioId }),
  setSelectedLayerLens: (lens) => set({ selectedLayerLens: lens }),
  setSelectedVariantId: (variantId) => set({ selectedVariantId: variantId }),
  setSelectedObserverId: (observerId) => set({ selectedObserverId: observerId }),
  setAnimatedJourneyPlaying: (playing) => set({ animatedJourneyPlaying: playing }),
  setAnimatedJourneySpeed: (speed) => set({ animatedJourneySpeed: speed }),
  resetAnimatedJourney: (stageId) =>
    set({
      selectedStageId: stageId,
      visitedStageIds: [stageId],
      animatedJourneyPlaying: false,
    }),
}))
