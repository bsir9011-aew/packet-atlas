import { create } from 'zustand'
import type { LayerLens } from '../schema/journeyScenarioSchema'

type AtlasState = {
  selectedStageId: string
  selectedLayerLens: LayerLens
  setSelectedStageId: (stageId: string) => void
  setSelectedLayerLens: (lens: LayerLens) => void
}

export const useAtlasStore = create<AtlasState>((set) => ({
  selectedStageId: 'url-intent',
  selectedLayerLens: 'human',
  setSelectedStageId: (stageId) => set({ selectedStageId: stageId }),
  setSelectedLayerLens: (lens) => set({ selectedLayerLens: lens }),
}))
