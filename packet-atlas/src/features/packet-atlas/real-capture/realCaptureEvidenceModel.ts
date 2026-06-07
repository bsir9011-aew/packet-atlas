import realFixture from '../../../data/fixtures/https-basic.real.fixture.json'

type RealCaptureFrame = {
  frameNumber: number
  protocolStack?: string[]
  stageHint?: string
  summary?: {
    srcPort?: string
    dstPort?: string
    highestProtocol?: string
  }
}

type RealCaptureFixture = {
  id: string
  kind?: string
  status?: string
  source?: string
  generatedAt?: string
  promotedAt?: string
  redaction?: unknown
  frames?: RealCaptureFrame[]
}

export type RealCaptureEvidenceSummary = {
  fixtureId: string
  status: string
  kind: string
  frameCount: number
  dnsFrames: number
  tcp443Frames: number
  tlsFrames: number
  readableHttpFrames: number
  redactionApplied: boolean
  stageCounts: Record<string, number>
  keyClaim: string
}

const fixture = realFixture as RealCaptureFixture

export function buildRealCaptureEvidenceSummary(): RealCaptureEvidenceSummary {
  const frames = fixture.frames ?? []
  const stageCounts: Record<string, number> = {}

  for (const frame of frames) {
    const stage = frame.stageHint ?? 'unmapped'
    stageCounts[stage] = (stageCounts[stage] ?? 0) + 1
  }

  const dnsFrames = frames.filter((frame) =>
    frame.protocolStack?.includes('dns'),
  ).length

  const tlsFrames = frames.filter((frame) =>
    frame.protocolStack?.includes('tls'),
  ).length

  const tcp443Frames = frames.filter((frame) => {
    const src = frame.summary?.srcPort
    const dst = frame.summary?.dstPort
    return src === '443' || dst === '443' || frame.protocolStack?.includes('tls')
  }).length

  const readableHttpFrames = frames.filter((frame) =>
    frame.protocolStack?.includes('http'),
  ).length

  return {
    fixtureId: fixture.id,
    status: fixture.status ?? 'unknown',
    kind: fixture.kind ?? 'unknown',
    frameCount: frames.length,
    dnsFrames,
    tcp443Frames,
    tlsFrames,
    readableHttpFrames,
    redactionApplied: Boolean(fixture.redaction),
    stageCounts,
    keyClaim:
      readableHttpFrames === 0
        ? 'HTTP is not readable on the wire in this HTTPS capture; it is protected inside TLS.'
        : 'Readable HTTP frames exist in this capture.',
  }
}

export function buildRealCaptureEvidenceCards() {
  const summary = buildRealCaptureEvidenceSummary()

  return [
    {
      label: 'Real fixture',
      value: summary.fixtureId,
      detail: `${summary.status} • ${summary.kind}`,
    },
    {
      label: 'Frames',
      value: String(summary.frameCount),
      detail: 'clean sliced trace',
    },
    {
      label: 'DNS',
      value: String(summary.dnsFrames),
      detail: 'name lookup frames',
    },
    {
      label: 'TCP/443',
      value: String(summary.tcp443Frames),
      detail: 'encrypted web transport path',
    },
    {
      label: 'TLS',
      value: String(summary.tlsFrames),
      detail: 'security wrapper visible on the wire',
    },
    {
      label: 'HTTP readable',
      value: String(summary.readableHttpFrames),
      detail: 'expected 0 for HTTPS',
    },
    {
      label: 'Redaction',
      value: summary.redactionApplied ? 'applied' : 'missing',
      detail: 'review before commit',
    },
  ]
}
