import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import type { LayerLens } from '../../src/features/packet-atlas/schema/journeyScenarioSchema'

const requiredLayers: LayerLens[] = [
  'human',
  'application',
  'tls',
  'transport',
  'network',
  'link',
  'physical',
]

describe('layer highlight coverage', () => {
  it('has at least one stage for every layer lens', () => {
    for (const layer of requiredLayers) {
      const matchingStages = httpsExampleScenario.stages.filter((stage) =>
        stage.layerFocus.includes(layer),
      )

      expect(
        matchingStages.length,
        `Expected at least one stage for layer ${layer}`,
      ).toBeGreaterThan(0)
    }
  })

  it('every stage declares at least one layer focus', () => {
    for (const stage of httpsExampleScenario.stages) {
      expect(stage.layerFocus.length, stage.id).toBeGreaterThan(0)
    }
  })
})
