import { create } from 'zustand'
import type { TraceSpeed } from '../cinematic/cinematicTraceModel'
import type { LayerLens } from '../schema/journeyScenarioSchema'

export type PresentationMode = 'atlas' | 'focus' | 'play'
export type AtlasLanguage = 'en' | 'pl'

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
  language: AtlasLanguage
  setSelectedStageId: (stageId: string) => void
  setSelectedScenarioId: (scenarioId: string) => void
  setSelectedLayerLens: (lens: LayerLens) => void
  setSelectedVariantId: (variantId: string) => void
  setSelectedObserverId: (observerId: string) => void
  setAnimatedJourneyPlaying: (playing: boolean) => void
  setAnimatedJourneySpeed: (speed: TraceSpeed) => void
  setSelectedBranchChoiceId: (choiceId: string | null) => void
  setPresentationMode: (mode: PresentationMode) => void
  setLanguage: (language: AtlasLanguage) => void
  toggleLanguage: () => void
  togglePresentationMode: () => void
  resetAnimatedJourney: (stageId: string) => void
}


const atlasLanguageStorageKey = 'packet-atlas-language'

function readInitialLanguage(): AtlasLanguage {
  if (typeof window === 'undefined') return 'en'

  try {
    const stored = window.localStorage.getItem(atlasLanguageStorageKey)
    return stored === 'pl' ? 'pl' : 'en'
  } catch {
    return 'en'
  }
}

function persistLanguage(language: AtlasLanguage) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(atlasLanguageStorageKey, language)
  } catch {
    // Non-critical: language switch still works for the current session.
  }
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
  language: readInitialLanguage(),
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
  setPresentationMode: (mode) =>
    set((state) => ({
      presentationMode: mode,
      animatedJourneyPlaying: mode === 'atlas' ? false : state.animatedJourneyPlaying,
    })),
  setLanguage: (language) => {
    persistLanguage(language)
    set({ language })
  },
  toggleLanguage: () =>
    set((state) => {
      const language = state.language === 'pl' ? 'en' : 'pl'
      persistLanguage(language)
      return { language }
    }),
  togglePresentationMode: () =>
    set((state) => ({
      presentationMode: state.presentationMode === 'play' ? 'atlas' : 'play',
    })),
  resetAnimatedJourney: (stageId) =>
    set({
      selectedStageId: stageId,
      visitedStageIds: [stageId],
      animatedJourneyPlaying: false,
      selectedBranchChoiceId: null,
    }),
}))
