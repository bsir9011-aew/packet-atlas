import { create } from 'zustand'
import type { LayerLens } from '../schema/journeyScenarioSchema'

type AtlasState = {
  selectedObserverId: string
  selectedVariantId: string
  selectedStageId: string
  selectedLayerLens: LayerLens
  setSelectedStageId: (stageId: string) => void
  setSelectedLayerLens: (lens: LayerLens) => void
  setSelectedVariantId: (variantId: string) => void
  setSelectedObserverId: (observerId: string) => void
}

export const useAtlasStore = create<AtlasState>((set) => ({
  selectedStageId: 'url-intent',
  selectedVariantId: 'happy-path',
  selectedObserverId: 'user',
  selectedLayerLens: 'human',
  setSelectedStageId: (stageId) => set({ selectedStageId: stageId }),
  setSelectedLayerLens: (lens) => set({ selectedLayerLens: lens }),
  setSelectedVariantId: (variantId) => set({ selectedVariantId: variantId }),
  setSelectedObserverId: (observerId) => set({ selectedObserverId: observerId }),
}))
