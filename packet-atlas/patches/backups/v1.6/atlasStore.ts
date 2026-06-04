import { create } from 'zustand'
import type { LayerLens } from '../schema/journeyScenarioSchema'

type AtlasState = {
  selectedVariantId: string
  selectedStageId: string
  selectedLayerLens: LayerLens
  setSelectedStageId: (stageId: string) => void
  setSelectedLayerLens: (lens: LayerLens) => void
  setSelectedVariantId: (variantId: string) => void
}

export const useAtlasStore = create<AtlasState>((set) => ({
  selectedStageId: 'url-intent',
  selectedVariantId: 'happy-path',
  selectedLayerLens: 'human',
  setSelectedStageId: (stageId) => set({ selectedStageId: stageId }),
  setSelectedLayerLens: (lens) => set({ selectedLayerLens: lens }),
  setSelectedVariantId: (variantId) => set({ selectedVariantId: variantId }),
}))
