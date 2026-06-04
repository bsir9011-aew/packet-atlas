import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildDraftFailureTrace } from '../../src/features/packet-atlas/failure-builder/failureBuilderModel'

describe('failure builder model', () => {
  it('cuts off stages after break point', () => {
    const rows = buildDraftFailureTrace(httpsExampleScenario, { title:'x', kind:'blocked', breakStageId:'arp-gateway', affectedStageIds:['lan-frame'], symptom:'x', rootCause:'x', observable:'x' })
    expect(rows.find((row) => row.stageId === 'arp-gateway')?.status).toBe('break')
    expect(rows.filter((row) => row.status === 'cut-off').length).toBeGreaterThan(0)
  })
})
