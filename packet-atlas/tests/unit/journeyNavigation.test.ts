import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('journey navigation model', () => {
  it('keeps previous and next relations symmetric', () => {
    const stagesById = new Map(
      httpsExampleScenario.stages.map((stage) => [stage.id, stage]),
    )

    for (const stage of httpsExampleScenario.stages) {
      for (const nextId of stage.relations.nextIds) {
        const nextStage = stagesById.get(nextId)
        expect(nextStage, `${nextId} should exist`).toBeDefined()
        expect(nextStage?.relations.previousIds).toContain(stage.id)
      }

      for (const previousId of stage.relations.previousIds) {
        const previousStage = stagesById.get(previousId)
        expect(previousStage, `${previousId} should exist`).toBeDefined()
        expect(previousStage?.relations.nextIds).toContain(stage.id)
      }
    }
  })

  it('has one primary linear journey order for controls', () => {
    expect(httpsExampleScenario.stages[0].relations.previousIds).toHaveLength(0)
    expect(
      httpsExampleScenario.stages[httpsExampleScenario.stages.length - 1]
        .relations.nextIds,
    ).toHaveLength(0)
  })
})
