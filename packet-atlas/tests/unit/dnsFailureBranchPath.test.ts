import { describe, expect, it } from 'vitest'
import {
  buildDnsFailureBranchPath,
  summarizeDnsFailureBranchPath,
} from '../../src/features/packet-atlas/branching/dnsFailureBranchModel'
import {
  buildBranchJourneyChoiceCatalog,
  buildBranchJourneyChoicesForStage,
} from '../../src/features/packet-atlas/branching/branchingJourneyModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('DNS failure branch path', () => {
  it('models DNS failure as a pre-connection stop before TCP/TLS/HTTP', () => {
    const path = buildDnsFailureBranchPath('dns-query')
    const summary = summarizeDnsFailureBranchPath(path)

    expect(path.thesis).toContain('before TCP, TLS or HTTP')
    expect(path.steps).toHaveLength(4)
    expect(summary.observed).toBe(1)
    expect(summary.blocked).toBe(1)
    expect(summary.notStarted).toBe(1)
    expect(summary.diagnostic).toBe(1)
    expect(path.steps[2].networkEvidence).toContain('no TCP/443')
    expect(path.steps[2].networkEvidence).toContain('no TLS')
    expect(path.steps[2].networkEvidence).toContain('no HTTP')
  })

  it('attaches the DNS branch path to DNS failure choices', () => {
    const dnsStage = httpsExampleScenario.stages.find((stage) =>
      `${stage.id} ${stage.shortName} ${stage.stageKind}`.toLowerCase().includes('dns'),
    )

    expect(dnsStage).toBeDefined()

    const choices = buildBranchJourneyChoicesForStage(httpsExampleScenario, dnsStage!)
    const dnsFailure = choices.find((choice) => choice.kind === 'dns-failure')

    expect(dnsFailure).toBeDefined()
    expect(dnsFailure?.diagnosticPath).toHaveLength(4)
    expect(dnsFailure?.diagnosticPath?.[2].status).toBe('not-started')
  })

  it('keeps DNS failure discoverable in the full branch catalog', () => {
    const catalog = buildBranchJourneyChoiceCatalog(httpsExampleScenario)
    const dnsFailure = catalog.find((choice) => choice.kind === 'dns-failure')

    expect(dnsFailure).toBeDefined()
    expect(dnsFailure?.diagnosticPath?.some((step) => step.status === 'blocked')).toBe(true)
  })
})
