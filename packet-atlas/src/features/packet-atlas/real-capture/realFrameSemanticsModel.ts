import realFixture from '../../../data/fixtures/https-basic.real.fixture.json'

type RealCaptureFrame = {
  frameNumber: number
  timeRelative?: string | null
  protocolStack?: string[]
  stageHint?: string
  stageHintConfidence?: string
  stageHintReason?: string
  summary?: {
    srcIp?: string
    dstIp?: string
    srcPort?: string
    dstPort?: string
    highestProtocol?: string
  }
  fields?: Record<string, unknown>
}

type RealCaptureFixture = {
  id: string
  status?: string
  frames?: RealCaptureFrame[]
}

export type RealFrameSemanticCategory =
  | 'dns-query'
  | 'dns-response'
  | 'tcp-syn'
  | 'tcp-syn-ack'
  | 'tcp-ack'
  | 'tcp-fin'
  | 'tcp-data-carrier'
  | 'tls-handshake'
  | 'tls-encrypted-record'
  | 'tls-record'
  | 'unclassified'

export type RealFrameSemanticRow = {
  frameNumber: number
  stageHint?: string
  category: RealFrameSemanticCategory
  protocolStack: string[]
  summary: string
  reason: string
}

export type RealFrameSemanticSummary = {
  fixtureId: string
  status: string
  totalFrames: number
  categoryCounts: Record<RealFrameSemanticCategory, number>
  coarseStageCounts: Record<string, number>
  refinedCount: number
  rows: RealFrameSemanticRow[]
  teachingPoint: string
}

const fixture = realFixture as RealCaptureFixture

function getPathValue(value: unknown, path: string[]): string | undefined {
  let current = value

  for (const segment of path) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }

  if (typeof current === 'string') return current
  if (typeof current === 'number' || typeof current === 'boolean') return String(current)
  return undefined
}

function includesText(value: unknown, needle: string): boolean {
  return JSON.stringify(value ?? {}).toLowerCase().includes(needle.toLowerCase())
}

function tcpFlag(frame: RealCaptureFrame, flag: string): boolean {
  return getPathValue(frame, ['fields', 'tcp', 'tcp.flags_tree', `tcp.flags.${flag}`]) === '1'
}

function tcpLength(frame: RealCaptureFrame): number {
  const len = getPathValue(frame, ['fields', 'tcp', 'tcp.len'])
  const parsed = Number.parseInt(len ?? '0', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function classifyRealFrame(frame: RealCaptureFrame): {
  category: RealFrameSemanticCategory
  reason: string
} {
  const stack = frame.protocolStack ?? []
  const hasDns = stack.includes('dns')
  const hasTcp = stack.includes('tcp')
  const hasTls = stack.includes('tls')

  if (hasDns) {
    if (frame.stageHint === 'dns-response') {
      return {
        category: 'dns-response',
        reason: 'DNS response frame; resolver answered the name-to-address question.',
      }
    }

    return {
      category: 'dns-query',
      reason: 'DNS query frame; client asks for the address of the host.',
    }
  }

  if (hasTls) {
    const tlsFields = frame.fields?.tls
    const tlsText = JSON.stringify(tlsFields ?? {})
    const looksLikeHandshake =
      includesText(tlsFields, 'client hello') ||
      includesText(tlsFields, 'server hello') ||
      includesText(tlsFields, 'handshake protocol') ||
      tlsText.includes('"tls.record.content_type":"22"') ||
      tlsText.includes('"tls.record.content_type":["22"')

    const looksLikeEncryptedRecord =
      includesText(tlsFields, 'application data') ||
      tlsText.includes('"tls.record.content_type":"23"') ||
      tlsText.includes('"tls.record.content_type":["23"')

    if (looksLikeEncryptedRecord && !looksLikeHandshake) {
      return {
        category: 'tls-encrypted-record',
        reason: 'TLS record carries encrypted bytes; readable HTTP is not exposed on the wire.',
      }
    }

    if (looksLikeHandshake || frame.stageHint === 'tls-handshake') {
      return {
        category: 'tls-handshake',
        reason: 'TLS negotiation/wrapper information is visible before protected application data.',
      }
    }

    return {
      category: 'tls-record',
      reason: 'TLS layer is present; inspect record content type for exact meaning.',
    }
  }

  if (hasTcp) {
    const syn = tcpFlag(frame, 'syn')
    const ack = tcpFlag(frame, 'ack')
    const fin = tcpFlag(frame, 'fin')
    const len = tcpLength(frame)

    if (syn && !ack) {
      return {
        category: 'tcp-syn',
        reason: 'Opening TCP SYN; endpoint asks to start a connection.',
      }
    }

    if (syn && ack) {
      return {
        category: 'tcp-syn-ack',
        reason: 'Opening TCP SYN/ACK; remote endpoint accepts connection setup.',
      }
    }

    if (fin) {
      return {
        category: 'tcp-fin',
        reason: 'TCP FIN; one side is closing the stream.',
      }
    }

    if (len > 0) {
      return {
        category: 'tcp-data-carrier',
        reason: 'TCP segment carries bytes, but the HTTP meaning may be inside TLS.',
      }
    }

    if (ack) {
      return {
        category: 'tcp-ack',
        reason: 'TCP ACK/maintenance frame; not every TCP/443 frame is a handshake.',
      }
    }

    return {
      category: 'tcp-ack',
      reason: 'TCP frame without visible payload; likely transport bookkeeping.',
    }
  }

  return {
    category: 'unclassified',
    reason: 'No DNS, TCP or TLS layer was available for semantic classification.',
  }
}

function describeFrame(frame: RealCaptureFrame, category: RealFrameSemanticCategory): string {
  const srcIp = frame.summary?.srcIp ?? 'unknown-src'
  const dstIp = frame.summary?.dstIp ?? 'unknown-dst'
  const srcPort = frame.summary?.srcPort
  const dstPort = frame.summary?.dstPort
  const portText = srcPort && dstPort ? `:${srcPort} → ${dstIp}:${dstPort}` : ` → ${dstIp}`

  return `${category} • ${srcIp}${portText}`
}

export function buildRealFrameSemanticRows(): RealFrameSemanticRow[] {
  return (fixture.frames ?? []).map((frame) => {
    const classification = classifyRealFrame(frame)

    return {
      frameNumber: frame.frameNumber,
      stageHint: frame.stageHint,
      category: classification.category,
      protocolStack: frame.protocolStack ?? [],
      summary: describeFrame(frame, classification.category),
      reason: classification.reason,
    }
  })
}

export function buildRealFrameSemanticSummary(): RealFrameSemanticSummary {
  const rows = buildRealFrameSemanticRows()
  const categoryCounts = {} as Record<RealFrameSemanticCategory, number>
  const coarseStageCounts: Record<string, number> = {}

  for (const row of rows) {
    categoryCounts[row.category] = (categoryCounts[row.category] ?? 0) + 1

    const stage = row.stageHint ?? 'unmapped'
    coarseStageCounts[stage] = (coarseStageCounts[stage] ?? 0) + 1
  }

  const refinedCount = rows.filter(
    (row) => row.stageHint && row.stageHint !== row.category,
  ).length

  return {
    fixtureId: fixture.id,
    status: fixture.status ?? 'unknown',
    totalFrames: rows.length,
    categoryCounts,
    coarseStageCounts,
    refinedCount,
    rows,
    teachingPoint:
      'Stage hints explain the journey layer; frame semantics explain what an individual packet is doing.',
  }
}

export function getTopRealFrameSemanticRows(limit = 8): RealFrameSemanticRow[] {
  return buildRealFrameSemanticRows().slice(0, limit)
}
