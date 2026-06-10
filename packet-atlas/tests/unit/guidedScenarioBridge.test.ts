import { describe, expect, it } from 'vitest'
import { buildGuidedScenarioPacks } from '../../src/features/packet-atlas/guide/guidedScenarioPackModel'
import {
  buildGuidedScenarioBridge,
  evaluateGuidedScenarioBridgeReadiness,
  renderGuidedScenarioBridgeMarkdown,
} from '../../src/features/packet-atlas/guide/guidedScenarioBridgeModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('guided scenario bridge', () => {
  it('maps scenario steps to existing journey stages', () => {
    const bridges = buildGuidedScenarioBridge(buildGuidedScenarioPacks(), httpsExampleScenario)

    expect(bridges.length).toBeGreaterThanOrEqual(5)
    expect(bridges.every((bridge) => bridge.anchors.length > 0)).toBe(true)
    expect(bridges.some((bridge) => bridge.scenarioId === 'dns-failure')).toBe(true)
  })

  it('evaluates bridge readiness', () => {
    const bridges = buildGuidedScenarioBridge(buildGuidedScenarioPacks(), httpsExampleScenario)
    const readiness = evaluateGuidedScenarioBridgeReadiness(bridges)

    expect(readiness.ok).toBe(true)
    expect(readiness.totalScenarios).toBe(bridges.length)
    expect(readiness.totalAnchors).toBeGreaterThanOrEqual(bridges.length)
  })

  it('renders bridge markdown', () => {
    const bridges = buildGuidedScenarioBridge(buildGuidedScenarioPacks(), httpsExampleScenario)
    const markdown = renderGuidedScenarioBridgeMarkdown(bridges)

    expect(markdown).toContain('Guided Scenario Bridge')
    expect(markdown).toContain('DNS failure')
    expect(markdown).toContain('Anchors')
  })
})
