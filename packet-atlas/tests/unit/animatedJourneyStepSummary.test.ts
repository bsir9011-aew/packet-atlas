import { describe, expect, it } from 'vitest'
import { buildAnimatedJourneyStepSummary } from '../../src/features/packet-atlas/cinematic/cinematicTraceModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('animated journey step summary', () => {
  it('turns existing stage copy into guided narrative fields', () => {
    const stage = httpsExampleScenario.stages[0]
    const summary = buildAnimatedJourneyStepSummary(httpsExampleScenario, stage)

    expect(summary.stepLabel).toContain('Step 1')
    expect(summary.whatHappensNow.length).toBeGreaterThan(20)
    expect(summary.whyItMatters.length).toBeGreaterThan(20)
    expect(summary.userVisibleOutcome.length).toBeGreaterThan(10)
    expect(summary.networkEvidence.length).toBeGreaterThan(10)
    expect(summary.diagnosticHint.length).toBeGreaterThan(10)
    expect(summary.nextChoices.length).toBeGreaterThan(0)
  })
})
