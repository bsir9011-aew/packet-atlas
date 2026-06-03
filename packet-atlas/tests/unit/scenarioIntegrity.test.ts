import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('scenario integrity', () => {
  it('uses existing payload references in every stage', () => {
    const payloadIds = new Set(
      httpsExampleScenario.payloads.map((payload) => payload.id),
    )

    for (const stage of httpsExampleScenario.stages) {
      expect(payloadIds.has(stage.payloadRef)).toBe(true)
    }
  })

  it('starts as request and ends as response', () => {
    expect(httpsExampleScenario.stages[0].direction).toBe('request')
    expect(
      httpsExampleScenario.stages[httpsExampleScenario.stages.length - 1]
        .direction,
    ).toBe('response')
  })
})
