import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getCaptureProjectionForStage } from '../../src/features/packet-atlas/capture-inspector/captureAwareInspectorModel'

describe('capture-aware inspector model', () => {
  it('finds synthetic frame projections by stage', () => {
    const dns = httpsExampleScenario.stages.find((stage) => stage.id === 'dns-query')
    expect(dns).toBeTruthy()
    const projection = getCaptureProjectionForStage(dns!)
    expect(projection.mode).toBe('synthetic')
    expect(projection.frame?.frameNumber).toBe(1)
  })

  it('reports planned or missing capture projection for stages without a synthetic frame', () => {
    const url = httpsExampleScenario.stages.find((stage) => stage.id === 'url-intent')
    expect(url).toBeTruthy()
    const projection = getCaptureProjectionForStage(url!)
    expect(['missing', 'real-placeholder']).toContain(projection.mode)
  })
})
