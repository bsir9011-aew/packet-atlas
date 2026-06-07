import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import {
  getFixtureForStage,
  summarizeFixtureCoverage,
  summarizeRealCaptureFixture,
} from '../../src/features/packet-atlas/captures/captureFixtureModel'

describe('capture fixture model', () => {
  it('attaches the verified real fixture to DNS query', () => {
    const fixture = getFixtureForStage('dns-query')

    expect(fixture?.protocolStack).toContain('dns')
    expect(fixture?.fixtureId).toBe('https-basic-real-fixture')
    expect(fixture?.isReal).toBe(true)
    expect(fixture?.redacted).toBe(true)
  })

  it('summarizes fixture coverage', () => {
    const summary = summarizeFixtureCoverage(httpsExampleScenario)

    expect(summary.attached).toBeGreaterThan(0)
    expect(summary.total).toBe(httpsExampleScenario.stages.length)
  })

  it('summarizes the first verified real capture fixture', () => {
    const summary = summarizeRealCaptureFixture()

    expect(summary.attached).toBe(true)
    expect(summary.frameCount).toBe(23)
    expect(summary.redacted).toBe(true)
  })
})
