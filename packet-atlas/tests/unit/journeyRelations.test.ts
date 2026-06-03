import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('journey relations', () => {
  it('keeps next and previous relations reciprocal', () => {
    const byId = new Map(
      httpsExampleScenario.stages.map((stage) => [stage.id, stage]),
    )

    for (const stage of httpsExampleScenario.stages) {
      for (const nextId of stage.relations.nextIds) {
        const nextStage = byId.get(nextId)
        expect(nextStage, `Missing next stage ${nextId}`).toBeDefined()
        expect(nextStage?.relations.previousIds).toContain(stage.id)
      }

      for (const previousId of stage.relations.previousIds) {
        const previousStage = byId.get(previousId)
        expect(previousStage, `Missing previous stage ${previousId}`).toBeDefined()
        expect(previousStage?.relations.nextIds).toContain(stage.id)
      }
    }
  })
})
