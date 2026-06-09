import { describe, expect, it } from 'vitest'
import { explainBranchDecision } from '../../src/features/packet-atlas/branching/branchDecisionExplainer'
import { buildBranchJourneyChoiceCatalog } from '../../src/features/packet-atlas/branching/branchingJourneyModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('branch decision explainer', () => {
  it('explains the DNS failure boundary before TCP/TLS/HTTP', () => {
    const catalog = buildBranchJourneyChoiceCatalog(httpsExampleScenario)
    const dnsFailure = catalog.find((choice) => choice.kind === 'dns-failure')

    expect(dnsFailure).toBeDefined()

    const explanation = explainBranchDecision(dnsFailure!)
    expect(explanation.boundary).toContain('before TCP')
    expect(explanation.evidenceRule).toContain('absence of TCP/443')
  })

  it('attaches decision explanations to branch choices', () => {
    const catalog = buildBranchJourneyChoiceCatalog(httpsExampleScenario)

    expect(catalog.length).toBeGreaterThan(0)
    expect(catalog.every((choice) => choice.decision)).toBe(true)
    expect(catalog.every((choice) => choice.decision?.doNotAssume.length)).toBe(true)
  })
})
