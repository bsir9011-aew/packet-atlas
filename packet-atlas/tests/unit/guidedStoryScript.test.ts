import { describe, expect, it } from 'vitest'
import { buildAnimatedJourneyStepSummary } from '../../src/features/packet-atlas/cinematic/cinematicTraceModel'
import { buildGuidedStoryScript } from '../../src/features/packet-atlas/guide/guidedStoryScriptModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('guided story script', () => {
  it('creates a story script for every stage', () => {
    for (const stage of httpsExampleScenario.stages) {
      const narrative = buildAnimatedJourneyStepSummary(httpsExampleScenario, stage)
      const script = buildGuidedStoryScript(httpsExampleScenario, stage, narrative)

      expect(script.stageId).toBe(stage.id)
      expect(script.spokenLine.length).toBeGreaterThan(24)
      expect(script.mentalModel.length).toBeGreaterThan(12)
      expect(script.evidenceQuestion).toContain('What evidence')
      expect(script.avoidJumpingTo.length).toBeGreaterThan(12)
      expect(script.nextHandoff.length).toBeGreaterThan(8)
    }
  })

  it('starts from human intention and handles DNS as destination discovery', () => {
    const first = httpsExampleScenario.stages[0]
    const dns = httpsExampleScenario.stages.find((stage) =>
      `${stage.id} ${stage.shortName} ${stage.stageKind}`.toLowerCase().includes('dns'),
    )!

    const firstNarrative = buildAnimatedJourneyStepSummary(httpsExampleScenario, first)
    const dnsNarrative = buildAnimatedJourneyStepSummary(httpsExampleScenario, dns)

    const firstScript = buildGuidedStoryScript(httpsExampleScenario, first, firstNarrative)
    const dnsScript = buildGuidedStoryScript(httpsExampleScenario, dns, dnsNarrative)

    expect(firstScript.spokenLine).toContain('human intention')
    expect(dnsScript.mentalModel).toContain('address book')
  })
})
