import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getCaptureProjectionForStage } from '../../src/features/packet-atlas/capture-inspector/captureAwareInspectorModel'

describe('capture-aware inspector model', () => {
  it('prefers verified real capture projections by stage', () => {
    const dns = httpsExampleScenario.stages.find((stage) => stage.id === 'dns-query')
    expect(dns).toBeTruthy()

    const projection = getCaptureProjectionForStage(dns!)

    expect(projection.mode).toBe('verified-real')
    expect(projection.fixtureId).toBe('https-basic-real-fixture')
    expect(projection.frame?.frameNumber).toBe(1)
    expect(projection.frame?.redacted).toBe(true)
  })

  it('reports planned or missing capture projection for stages without a fixture', () => {
    const url = httpsExampleScenario.stages.find((stage) => stage.id === 'url-intent')
    expect(url).toBeTruthy()

    const projection = getCaptureProjectionForStage(url!)

    expect(['missing', 'real-placeholder']).toContain(projection.mode)
  })
})
