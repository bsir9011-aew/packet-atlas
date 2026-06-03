import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('stage deep dive data', () => {
  it('has teaching copy for every stage', () => {
    for (const stage of httpsExampleScenario.stages) {
      expect(stage.copy.whatUserSees.length).toBeGreaterThan(0)
      expect(stage.copy.whatReallyHappens.length).toBeGreaterThan(0)
      expect(stage.copy.samePayloadHereLooksLike.length).toBeGreaterThan(0)
      expect(stage.copy.easyToConfuse.length).toBeGreaterThan(0)
      expect(stage.copy.whyItMatters.length).toBeGreaterThan(0)
      expect(stage.copy.analogy.length).toBeGreaterThan(0)
    }
  })

  it('keeps every stage attached to at least one layer lens', () => {
    for (const stage of httpsExampleScenario.stages) {
      expect(stage.layerFocus.length).toBeGreaterThan(0)
    }
  })
})
