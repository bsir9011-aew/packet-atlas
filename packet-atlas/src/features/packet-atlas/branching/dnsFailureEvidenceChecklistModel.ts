export type DnsFailureEvidenceStatus = 'present' | 'absent' | 'diagnostic'

export type DnsFailureEvidenceChecklistItem = {
  id: string
  label: string
  expected: DnsFailureEvidenceStatus
  observed: DnsFailureEvidenceStatus
  meaning: string
}

export type DnsFailureEvidenceChecklist = {
  id: string
  title: string
  thesis: string
  items: DnsFailureEvidenceChecklistItem[]
}

export type DnsFailureEvidenceChecklistSummary = {
  totalItems: number
  presentEvidence: number
  expectedAbsence: number
  diagnosticConclusions: number
  provesPreConnectionStop: boolean
}

export function buildDnsFailureEvidenceChecklist(): DnsFailureEvidenceChecklist {
  return {
    id: 'dns-failure-evidence-checklist',
    title: 'DNS failure evidence checklist',
    thesis:
      'A DNS failure branch is proven by DNS evidence plus the absence of later TCP/TLS/HTTP evidence.',
    items: [
      {
        id: 'dns-query-present',
        label: 'DNS query exists',
        expected: 'present',
        observed: 'present',
        meaning:
          'The client tried to resolve the domain, so the journey reached the DNS layer.',
      },
      {
        id: 'dns-failure-answer-present',
        label: 'DNS failure answer exists',
        expected: 'present',
        observed: 'present',
        meaning:
          'The resolver did not produce a usable target IP address for the browser.',
      },
      {
        id: 'tcp-443-absent',
        label: 'TCP/443 is absent',
        expected: 'absent',
        observed: 'absent',
        meaning:
          'No target IP means no web-server TCP session can be opened.',
      },
      {
        id: 'tls-absent',
        label: 'TLS is absent',
        expected: 'absent',
        observed: 'absent',
        meaning:
          'TLS cannot start because TCP to the target web service never exists.',
      },
      {
        id: 'http-absent',
        label: 'HTTP is absent',
        expected: 'absent',
        observed: 'absent',
        meaning:
          'The browser never reaches an application request/response exchange.',
      },
    ],
  }
}

export function summarizeDnsFailureEvidenceChecklist(
  checklist: DnsFailureEvidenceChecklist,
): DnsFailureEvidenceChecklistSummary {
  const presentEvidence = checklist.items.filter(
    (item) => item.observed === 'present',
  ).length
  const expectedAbsence = checklist.items.filter(
    (item) => item.expected === 'absent' && item.observed === 'absent',
  ).length
  const diagnosticConclusions = checklist.items.filter(
    (item) => item.observed === 'diagnostic',
  ).length

  return {
    totalItems: checklist.items.length,
    presentEvidence,
    expectedAbsence,
    diagnosticConclusions,
    provesPreConnectionStop: presentEvidence >= 2 && expectedAbsence >= 3,
  }
}
