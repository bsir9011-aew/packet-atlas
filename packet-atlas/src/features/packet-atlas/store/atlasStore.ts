import { create } from 'zustand'
import type { TraceSpeed } from '../cinematic/cinematicTraceModel'
import type { LayerLens } from '../schema/journeyScenarioSchema'

export type PresentationMode = 'atlas' | 'focus' | 'play'
export type AtlasLanguage = 'en' | 'pl'
export type AtlasTextDisplayMode = 'translated' | 'bilingual' | 'source'

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
  textDisplayMode: AtlasTextDisplayMode
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
  setTextDisplayMode: (mode: AtlasTextDisplayMode) => void
  cycleTextDisplayMode: () => void
  togglePresentationMode: () => void
  resetAnimatedJourney: (stageId: string) => void
}


const atlasLanguageStorageKey = 'packet-atlas-language'
const atlasTextDisplayModeStorageKey = 'packet-atlas-text-display-mode'

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


function readInitialTextDisplayMode(): AtlasTextDisplayMode {
  if (typeof window === 'undefined') return 'bilingual'

  try {
    const stored = window.localStorage.getItem(atlasTextDisplayModeStorageKey)
    if (stored === 'translated' || stored === 'source') return stored
    return 'bilingual'
  } catch {
    return 'bilingual'
  }
}

function persistTextDisplayMode(mode: AtlasTextDisplayMode) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(atlasTextDisplayModeStorageKey, mode)
  } catch {
    // Non-critical: text display mode still works for the current session.
  }
}

function getNextTextDisplayMode(mode: AtlasTextDisplayMode): AtlasTextDisplayMode {
  if (mode === 'translated') return 'bilingual'
  if (mode === 'bilingual') return 'source'
  return 'translated'
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
  textDisplayMode: readInitialTextDisplayMode(),
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
  setTextDisplayMode: (mode) => {
    persistTextDisplayMode(mode)
    set({ textDisplayMode: mode })
  },
  cycleTextDisplayMode: () =>
    set((state) => {
      const textDisplayMode = getNextTextDisplayMode(state.textDisplayMode)
      persistTextDisplayMode(textDisplayMode)
      return { textDisplayMode }
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
