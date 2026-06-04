import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getFixtureForStage, summarizeFixtureCoverage } from '../../src/features/packet-atlas/captures/captureFixtureModel'
describe('capture fixture model', () => {
  it('attaches fixture to DNS query', () => { const fixture=getFixtureForStage('dns-query'); expect(fixture?.protocolStack).toContain('dns') })
  it('summarizes fixture coverage', () => { const summary=summarizeFixtureCoverage(httpsExampleScenario); expect(summary.attached).toBeGreaterThan(0); expect(summary.total).toBe(httpsExampleScenario.stages.length) })
})
