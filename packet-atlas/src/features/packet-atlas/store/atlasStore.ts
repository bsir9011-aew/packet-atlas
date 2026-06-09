import { create } from 'zustand'
import type { TraceSpeed } from '../cinematic/cinematicTraceModel'
import type { LayerLens } from '../schema/journeyScenarioSchema'

export type PresentationMode = 'atlas' | 'focus'

type AtlasState = {
  selectedScenarioId: string
  selectedObserverId: string
  selectedVariantId: string
  selectedStageId: string
  selectedLayerLens: LayerLens
  animatedJourneyPlaying: boolean
  animatedJourneySpeed: TraceSpeed
  visitedStageIds: string[]
  selectedBranchChoiceId: string | null
  presentationMode: PresentationMode
  setSelectedStageId: (stageId: string) => void
  setSelectedScenarioId: (scenarioId: string) => void
  setSelectedLayerLens: (lens: LayerLens) => void
  setSelectedVariantId: (variantId: string) => void
  setSelectedObserverId: (observerId: string) => void
  setAnimatedJourneyPlaying: (playing: boolean) => void
  setAnimatedJourneySpeed: (speed: TraceSpeed) => void
  setSelectedBranchChoiceId: (choiceId: string | null) => void
  setPresentationMode: (mode: PresentationMode) => void
  togglePresentationMode: () => void
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
  animatedJourneySpeed: 'slow',
  visitedStageIds: ['url-intent'],
  selectedBranchChoiceId: null,
  presentationMode: 'atlas',
  setSelectedStageId: (stageId) =>
    set((state) => ({
      selectedStageId: stageId,
      visitedStageIds: rememberStage(stageId, state.visitedStageIds),
      selectedBranchChoiceId: null,
    })),
  setSelectedScenarioId: (scenarioId) => set({ selectedScenarioId: scenarioId }),
  setSelectedLayerLens: (lens) => set({ selectedLayerLens: lens }),
  setSelectedVariantId: (variantId) => set({ selectedVariantId: variantId }),
  setSelectedObserverId: (observerId) => set({ selectedObserverId: observerId }),
  setAnimatedJourneyPlaying: (playing) => set({ animatedJourneyPlaying: playing }),
  setAnimatedJourneySpeed: (speed) => set({ animatedJourneySpeed: speed }),
  setSelectedBranchChoiceId: (choiceId) =>
    set({
      selectedBranchChoiceId: choiceId,
      animatedJourneyPlaying: false,
    }),
  setPresentationMode: (mode) => set({ presentationMode: mode }),
  togglePresentationMode: () =>
    set((state) => ({
      presentationMode: state.presentationMode === 'focus' ? 'atlas' : 'focus',
    })),
  resetAnimatedJourney: (stageId) =>
    set({
      selectedStageId: stageId,
      visitedStageIds: [stageId],
      animatedJourneyPlaying: false,
      selectedBranchChoiceId: null,
    }),
}))
