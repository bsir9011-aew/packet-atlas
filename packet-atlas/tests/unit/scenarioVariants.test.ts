import { describe, expect, it } from 'vitest'
import {
  getScenarioVariant,
  scenarioVariants,
} from '../../src/features/packet-atlas/variants/scenarioVariants'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('scenario variants', () => {
  it('includes a baseline and failure variants', () => {
    expect(scenarioVariants.some((variant) => variant.id === 'happy-path')).toBe(
      true,
    )
    expect(scenarioVariants.length).toBeGreaterThanOrEqual(5)
  })

  it('references existing stage ids', () => {
    const stageIds = new Set(httpsExampleScenario.stages.map((stage) => stage.id))

    for (const variant of scenarioVariants) {
      for (const stageId of variant.affectedStageIds) {
        expect(stageIds.has(stageId)).toBe(true)
      }

      if (variant.breakStageId) {
        expect(stageIds.has(variant.breakStageId)).toBe(true)
      }
    }
  })

  it('falls back to happy path for unknown variant id', () => {
    expect(getScenarioVariant('missing').id).toBe('happy-path')
  })
})
