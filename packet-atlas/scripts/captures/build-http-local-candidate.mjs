import fs from 'node:fs'
import path from 'node:path'

const input =
  process.argv[2] ?? 'src/data/fixtures/http-local.real.fixture.json'
const output =
  process.argv[3] ?? 'src/data/fixtures/http-local.real.fixture.candidate.json'

if (!fs.existsSync(input)) {
  console.error(`❌ normalized HTTP local fixture not found: ${input}`)
  console.error('Run capture:export and capture:normalize for captures/http-local.pcapng first.')
  process.exit(1)
}

const source = JSON.parse(fs.readFileSync(input, 'utf8'))
const frames = Array.isArray(source.frames) ? source.frames : []

function stackIncludes(frame, protocol) {
  return Array.isArray(frame.protocolStack) && frame.protocolStack.includes(protocol)
}

function getPath(value, pathSegments) {
  let current = value
  for (const segment of pathSegments) {
    if (!current || typeof current !== 'object') return undefined
    current = current[segment]
  }
  if (typeof current === 'string') return current
  if (typeof current === 'number' || typeof current === 'boolean') return String(current)
  return undefined
}

function fieldText(frame) {
  return JSON.stringify(frame.fields ?? {})
}

function hasHttpRequest(frame) {
  const text = fieldText(frame)
  return stackIncludes(frame, 'http') && (
    text.includes('"http.request.method"') ||
    text.includes('GET / HTTP') ||
    text.includes('Request Method')
  )
}

function hasHttpResponse(frame) {
  const text = fieldText(frame)
  return stackIncludes(frame, 'http') && (
    text.includes('"http.response.code"') ||
    text.includes('HTTP/1.0 200') ||
    text.includes('Response Code')
  )
}

function tcpFlagHex(frame) {
  return getPath(frame, ['fields', 'tcp', 'tcp.flags']) ?? ''
}

function tcpLength(frame) {
  const raw = getPath(frame, ['fields', 'tcp', 'tcp.len'])
  const parsed = Number.parseInt(raw ?? '0', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function classify(frame) {
  const flags = tcpFlagHex(frame)
  const len = tcpLength(frame)

  if (hasHttpRequest(frame)) {
    return {
      stageHint: 'http-local-request',
      confidence: 'high',
      reason: 'Plain HTTP request is readable on the wire.',
    }
  }

  if (hasHttpResponse(frame)) {
    return {
      stageHint: 'http-local-response',
      confidence: 'high',
      reason: 'Plain HTTP response/status is readable on the wire.',
    }
  }

  if (flags === '0x0002') {
    return {
      stageHint: 'http-local-tcp-open',
      confidence: 'high',
      reason: 'TCP SYN starts the localhost HTTP connection.',
    }
  }

  if (flags === '0x0012') {
    return {
      stageHint: 'http-local-tcp-open',
      confidence: 'high',
      reason: 'TCP SYN/ACK accepts the localhost HTTP connection.',
    }
  }

  if (flags === '0x0011') {
    return {
      stageHint: 'http-local-tcp-close',
      confidence: 'high',
      reason: 'TCP FIN/ACK closes the localhost HTTP connection.',
    }
  }

  if (len > 0) {
    return {
      stageHint: 'http-local-response-body',
      confidence: 'medium',
      reason: 'TCP segment carries plaintext HTTP response bytes or reassembled body data.',
    }
  }

  return {
    stageHint: 'http-local-tcp-maintenance',
    confidence: 'medium',
    reason: 'TCP ACK/maintenance frame around the plaintext HTTP exchange.',
  }
}

const mappedFrames = frames.map((frame) => {
  const classification = classify(frame)
  return {
    ...frame,
    stageHint: classification.stageHint,
    stageHintConfidence: classification.confidence,
    stageHintReason: classification.reason,
  }
})

const stageFramePlan = [
  {
    stageId: 'http-local-tcp-open',
    expectedFrameKind: 'TCP SYN / SYN-ACK / ACK',
  },
  {
    stageId: 'http-local-request',
    expectedFrameKind: 'Readable HTTP GET request',
  },
  {
    stageId: 'http-local-response',
    expectedFrameKind: 'Readable HTTP response status',
  },
  {
    stageId: 'http-local-response-body',
    expectedFrameKind: 'Plaintext response bytes / body segment',
  },
  {
    stageId: 'http-local-tcp-close',
    expectedFrameKind: 'TCP FIN/ACK close',
  },
]

const candidate = {
  id: 'http-local-real-candidate',
  kind: 'real-capture-fixture',
  status: 'candidate',
  source: 'controlled localhost plaintext HTTP capture',
  captureScenario: 'http-local-plaintext-contrast',
  generatedAt: new Date().toISOString(),
  note:
    'Candidate built from loopback HTTP capture. Raw PCAP and raw JSON remain local-only.',
  redaction: {
    applied: true,
    strategy:
      'Loopback-only capture. 127.0.0.1 endpoints retained because they are non-routable localhost evidence.',
    rawArtifactsCommitted: false,
  },
  expectedContrast: {
    tlsFrames: 0,
    readableHttpFrames: 2,
    dnsFrames: 0,
  },
  stageFramePlan,
  frames: mappedFrames,
}

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(candidate, null, 2) + '\n')

const counts = {}
for (const frame of mappedFrames) {
  counts[frame.stageHint] = (counts[frame.stageHint] ?? 0) + 1
}

console.log(`🌐 HTTP local candidate written: ${output}`)
console.log(`Frames: ${mappedFrames.length}`)
console.table(counts)
