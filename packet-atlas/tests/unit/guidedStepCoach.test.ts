import { describe, expect, it } from 'vitest'
import { buildAnimatedJourneyStepSummary } from '../../src/features/packet-atlas/cinematic/cinematicTraceModel'
import { buildGuidedStepCoach } from '../../src/features/packet-atlas/guide/guidedStepCoachModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('guided step coach', () => {
  it('builds a Before / Now / Next reading structure for the first stage', () => {
    const stage = httpsExampleScenario.stages[0]
    const narrative = buildAnimatedJourneyStepSummary(httpsExampleScenario, stage)
    const coach = buildGuidedStepCoach(httpsExampleScenario, stage, narrative)

    expect(coach.phaseLabel).toBe('Start')
    expect(coach.beforeLabel).toBe(stage.shortName)
    expect(coach.nowLabel).toBe(stage.shortName)
    expect(coach.nextLabel).toBe(httpsExampleScenario.stages[1].shortName)
    expect(coach.whatToDoNow).toContain('Do not look for packets yet')
  })

  it('turns every stage into a simple reading task', () => {
    for (const stage of httpsExampleScenario.stages) {
      const narrative = buildAnimatedJourneyStepSummary(httpsExampleScenario, stage)
      const coach = buildGuidedStepCoach(httpsExampleScenario, stage, narrative)

      expect(coach.plainEnglish.length).toBeGreaterThan(12)
      expect(coach.proofQuestion).toContain('What would prove this step exists?')
      expect(coach.notebookLine).toContain(stage.shortName)
      expect(coach.dontLookAtYet).toContain('Do not inspect every panel')
    }
  })
})
