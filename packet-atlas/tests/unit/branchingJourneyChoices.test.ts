import { describe, expect, it } from 'vitest'
import {
  buildBranchJourneyChoiceCatalog,
  buildBranchJourneyChoicesForStage,
  findBranchJourneyChoice,
} from '../../src/features/packet-atlas/branching/branchingJourneyModel'
import { buildStageNarrativeMetadata } from '../../src/features/packet-atlas/narrative/stageNarrativeModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('branching journey choices', () => {
  it('builds a diagnostic branch catalog without creating a second route', () => {
    const catalog = buildBranchJourneyChoiceCatalog(httpsExampleScenario)

    expect(catalog.length).toBeGreaterThan(0)
    expect(catalog.some((choice) => choice.kind === 'dns-failure')).toBe(true)
    expect(catalog.some((choice) => choice.kind === 'tcp-blocked')).toBe(true)
    expect(catalog.some((choice) => choice.kind === 'tls-failure')).toBe(true)
    expect(catalog.every((choice) => choice.stageId.length > 0)).toBe(true)
  })

  it('adds DNS failure choices to DNS-like stages', () => {
    const dnsStage = httpsExampleScenario.stages.find((stage) =>
      `${stage.id} ${stage.shortName} ${stage.stageKind}`.toLowerCase().includes('dns'),
    )

    expect(dnsStage).toBeDefined()

    const choices = buildBranchJourneyChoicesForStage(httpsExampleScenario, dnsStage!)

    expect(choices.some((choice) => choice.kind === 'dns-failure')).toBe(true)
    expect(choices[0].networkEvidence).toContain('no TCP/443')
  })

  it('surfaces branch choices through the stage narrative contract', () => {
    const dnsStage = httpsExampleScenario.stages.find((stage) =>
      `${stage.id} ${stage.shortName} ${stage.stageKind}`.toLowerCase().includes('dns'),
    )

    expect(dnsStage).toBeDefined()

    const narrative = buildStageNarrativeMetadata(httpsExampleScenario, dnsStage!)

    expect(narrative.branchChoices.length).toBeGreaterThan(0)
    expect(narrative.branchChoices[0].whatChanges.length).toBeGreaterThan(30)
  })

  it('finds selected branch previews by id', () => {
    const catalog = buildBranchJourneyChoiceCatalog(httpsExampleScenario)
    const first = catalog[0]

    expect(findBranchJourneyChoice(httpsExampleScenario, first.id)).toEqual(first)
    expect(findBranchJourneyChoice(httpsExampleScenario, 'missing')).toBeNull()
    expect(findBranchJourneyChoice(httpsExampleScenario, null)).toBeNull()
  })
})
