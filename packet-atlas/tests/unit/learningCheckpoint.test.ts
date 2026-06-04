import { describe, expect, it } from 'vitest'
import { buildLearningCheckpoint } from '../../src/features/packet-atlas/learning/ScenarioLearningPanel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('learning checkpoints', () => {
  it('creates notebook prompts for every stage', () => {
    for (const stage of httpsExampleScenario.stages) {
      const checkpoint = buildLearningCheckpoint(stage, httpsExampleScenario)

      expect(checkpoint.stageTitle).toBe(stage.shortName)
      expect(checkpoint.notebook.length).toBeGreaterThanOrEqual(4)
      expect(checkpoint.selfQuestions.length).toBeGreaterThanOrEqual(3)
      expect(checkpoint.troubleshootingCue.length).toBeGreaterThan(12)
      expect(checkpoint.socAngle.length).toBeGreaterThan(12)
      expect(checkpoint.commandPrompt.length).toBeGreaterThan(8)
    }
  })

  it('adds DNS-specific learning cues for DNS stages', () => {
    const dnsStage = httpsExampleScenario.stages.find((stage) =>
      stage.stageKind.includes('dns'),
    )

    expect(dnsStage).toBeTruthy()

    const checkpoint = buildLearningCheckpoint(dnsStage!, httpsExampleScenario)

    expect(checkpoint.notebook.join(' ')).toContain('DNS')
    expect(checkpoint.commandPrompt).toContain('dig')
  })
})
