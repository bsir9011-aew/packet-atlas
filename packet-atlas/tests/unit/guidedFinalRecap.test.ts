import { describe, expect, it } from 'vitest'
import { buildGuidedFinalRecap } from '../../src/features/packet-atlas/guide/guidedFinalRecapModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('guided final recap', () => {
  it('builds a simple final recap without dashboard metrics', () => {
    const recap = buildGuidedFinalRecap(httpsExampleScenario)

    expect(recap.title).toContain(`${httpsExampleScenario.stages.length}-step data journey`)
    expect(recap.simpleStory).toContain('human intention')
    expect(recap.checkpoints.length).toBe(5)
    expect(recap.notebookLine).toContain('human intent -> DNS -> TCP -> TLS -> HTTP')
    expect(recap.closingAction).toContain('own words')
  })
})
