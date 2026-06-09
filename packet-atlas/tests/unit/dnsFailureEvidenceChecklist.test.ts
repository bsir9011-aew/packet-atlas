import { describe, expect, it } from 'vitest'
import {
  buildDnsFailureEvidenceChecklist,
  summarizeDnsFailureEvidenceChecklist,
} from '../../src/features/packet-atlas/branching/dnsFailureEvidenceChecklistModel'
import { buildBranchJourneyChoiceCatalog } from '../../src/features/packet-atlas/branching/branchingJourneyModel'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('DNS failure evidence checklist', () => {
  it('summarizes DNS failure as DNS evidence plus later protocol absence', () => {
    const checklist = buildDnsFailureEvidenceChecklist()
    const summary = summarizeDnsFailureEvidenceChecklist(checklist)

    expect(checklist.items.map((item) => item.label)).toContain('DNS query exists')
    expect(checklist.items.map((item) => item.label)).toContain('TCP/443 is absent')
    expect(summary.presentEvidence).toBe(2)
    expect(summary.expectedAbsence).toBe(3)
    expect(summary.provesPreConnectionStop).toBe(true)
  })

  it('attaches the checklist to DNS failure branch choices', () => {
    const catalog = buildBranchJourneyChoiceCatalog(httpsExampleScenario)
    const dnsFailure = catalog.find((choice) => choice.kind === 'dns-failure')

    expect(dnsFailure).toBeDefined()
    expect(dnsFailure?.evidenceChecklist?.items).toHaveLength(5)
    expect(dnsFailure?.evidenceChecklist?.thesis).toContain('absence of later')
  })
})
