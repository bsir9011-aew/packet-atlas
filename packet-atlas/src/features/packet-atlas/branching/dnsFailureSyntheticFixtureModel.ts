export type SyntheticDnsFailureFixture = {
  id: string
  kind: string
  status: string
  branchKind: string
  expectedAbsence: string[]
  frames: {
    id: string
    protocolStack: string[]
    summary: Record<string, string>
    fields: Record<string, string>
  }[]
}

export type SyntheticDnsFailureEvidenceSummary = {
  hasDnsQuery: boolean
  hasDnsFailureAnswer: boolean
  hasTcp443: boolean
  hasTls: boolean
  hasHttp: boolean
  provesPreConnectionStop: boolean
}

function frameText(frame: SyntheticDnsFailureFixture['frames'][number]) {
  return JSON.stringify(frame).toLowerCase()
}

export function summarizeSyntheticDnsFailureFixture(
  fixture: SyntheticDnsFailureFixture,
): SyntheticDnsFailureEvidenceSummary {
  const text = fixture.frames.map(frameText).join('\n')

  const hasDnsQuery = fixture.frames.some(
    (frame) =>
      frame.protocolStack.includes('dns') &&
      frame.fields['dns.flags.response'] === '0',
  )
  const hasDnsFailureAnswer = fixture.frames.some(
    (frame) =>
      frame.protocolStack.includes('dns') &&
      (frame.fields['dns.rcode'] === '3' || frameText(frame).includes('nxdomain')),
  )
  const hasTcp443 = text.includes('tcp/443') || text.includes('"443"')
  const hasTls = text.includes('"tls"')
  const hasHttp = text.includes('"http"')

  return {
    hasDnsQuery,
    hasDnsFailureAnswer,
    hasTcp443,
    hasTls,
    hasHttp,
    provesPreConnectionStop:
      hasDnsQuery && hasDnsFailureAnswer && !hasTcp443 && !hasTls && !hasHttp,
  }
}
