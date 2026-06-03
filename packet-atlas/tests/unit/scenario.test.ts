import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('httpsExampleScenario', () => {
  it('has a valid first journey with linked stages', () => {
    expect(httpsExampleScenario.id).toBe('https-example-basic')
    expect(httpsExampleScenario.stages[0].id).toBe('url-intent')
    expect(httpsExampleScenario.stages.length).toBeGreaterThanOrEqual(10)

    const ids = new Set(httpsExampleScenario.stages.map((stage) => stage.id))

    for (const stage of httpsExampleScenario.stages) {
      for (const nextId of stage.relations.nextIds) {
        expect(ids.has(nextId)).toBe(true)
      }

      for (const previousId of stage.relations.previousIds) {
        expect(ids.has(previousId)).toBe(true)
      }
    }
  })
})
