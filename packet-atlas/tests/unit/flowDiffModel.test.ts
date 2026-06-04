import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildFlowDiff, getFlowDiffSummary } from '../../src/features/packet-atlas/diff/flowDiffModel'

describe('flow diff model', () => {
  it('builds one diff row per journey stage', () => {
    const rows = buildFlowDiff(httpsExampleScenario, 'dns-failure')
    expect(rows).toHaveLength(httpsExampleScenario.stages.length)
  })

  it('marks not reached stages after a break stage', () => {
    const summary = getFlowDiffSummary(httpsExampleScenario, 'dns-failure')
    expect(summary.breakStage?.id).toBe('dns-response')
    expect(summary.notReachedCount).toBeGreaterThan(0)
  })

  it('keeps happy path as mostly same', () => {
    const rows = buildFlowDiff(httpsExampleScenario, 'happy-path')
    expect(rows.every((row) => row.status === 'same')).toBe(true)
  })
})
