import { describe, expect, it } from 'vitest'
import {
  buildStageNarrativeMetadata,
  resolveStageNarrativeChoices,
  validateStageNarrativeCoverage,
} from '../../src/features/packet-atlas/narrative/stageNarrativeModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildAnimatedJourneyStepSummary } from '../../src/features/packet-atlas/cinematic/cinematicTraceModel'

describe('stage narrative metadata', () => {
  it('builds one reusable narrative contract from existing stage data', () => {
    const stage = httpsExampleScenario.stages[0]
    const narrative = buildStageNarrativeMetadata(httpsExampleScenario, stage)

    expect(narrative.stageId).toBe(stage.id)
    expect(narrative.stepLabel).toContain('Step 1')
    expect(narrative.whatHappensNow).toBe(stage.copy.whatReallyHappens)
    expect(narrative.whyItMatters).toBe(stage.copy.whyItMatters)
    expect(narrative.userVisibleOutcome).toBe(stage.copy.whatUserSees)
    expect(narrative.networkEvidence).toBe(stage.copy.samePayloadHereLooksLike)
    expect(narrative.diagnosticHint).toBe(stage.copy.easyToConfuse)
    expect(narrative.layerFocus).toEqual(stage.layerFocus)
    expect(narrative.deviceRole).toBe(stage.device.role)
  })

  it('resolves next choices from stage relations without inventing a second flow', () => {
    const stageWithNext = httpsExampleScenario.stages.find(
      (stage) => stage.relations.nextIds.length > 0,
    )

    expect(stageWithNext).toBeDefined()

    const choices = resolveStageNarrativeChoices(httpsExampleScenario, stageWithNext!)

    expect(choices.length).toBe(stageWithNext!.relations.nextIds.length)
    expect(choices[0].kind).toBe('next')
    expect(choices[0].label.length).toBeGreaterThan(0)
  })

  it('keeps the cinematic summary backed by the same narrative model', () => {
    const stage = httpsExampleScenario.stages[0]
    const narrative = buildStageNarrativeMetadata(httpsExampleScenario, stage)
    const cinematic = buildAnimatedJourneyStepSummary(httpsExampleScenario, stage)

    expect(cinematic).toEqual(narrative)
  })

  it('reports narrative coverage for every HTTPS scenario stage', () => {
    const coverage = validateStageNarrativeCoverage(httpsExampleScenario)

    expect(coverage.totalStages).toBe(httpsExampleScenario.stages.length)
    expect(coverage.coveredStages).toBe(httpsExampleScenario.stages.length)
    expect(coverage.missingNarrative).toEqual([])
    expect(coverage.stagesWithChoices).toBeGreaterThan(0)
  })
})
