import syntheticFixtureJson from '../../../data/fixtures/https-example.synthetic.fixture.json'
import realFixtureJson from '../../../data/fixtures/https-basic.real.fixture.json'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

type RawFrame = {
  frameNumber: number
  timeRelative?: string | null
  protocolStack?: string[]
  summary?: Record<string, unknown>
  fields?: Record<string, unknown>
  stageHint?: string
  stageHintConfidence?: string
  stageHintReason?: string
}

type RawFixture = {
  id: string
  source?: string
  note?: string
  kind?: string
  status?: string
  redaction?: unknown
  frames?: RawFrame[]
}

export type CaptureFrameFixture = {
  stageId: string
  frameNumber: number
  timeRelative?: string | null
  protocolStack: string[]
  summary: string
  fields: Record<string, string>
  fixtureId: string
  source: string
  kind: 'synthetic-fixture' | 'real-capture-fixture'
  status?: string
  isReal: boolean
  redacted: boolean
  confidence?: string
  reason?: string
}

export type RealCaptureSummary = {
  fixtureId: string
  attached: boolean
  status?: string
  frameCount: number
  stageCount: number
  redacted: boolean
}

const syntheticFixture = syntheticFixtureJson as RawFixture
const realFixture = realFixtureJson as RawFixture

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

function addField(
  fields: Record<string, string>,
  label: string,
  value: string | undefined,
) {
  if (value && value !== '<MISSING>') fields[label] = value
}

function buildFieldMap(frame: RawFrame): Record<string, string> {
  const fields: Record<string, string> = {}

  addField(fields, 'ip.src', getPathValue(frame, ['summary', 'srcIp']))
  addField(fields, 'ip.dst', getPathValue(frame, ['summary', 'dstIp']))
  addField(fields, 'src.port', getPathValue(frame, ['summary', 'srcPort']))
  addField(fields, 'dst.port', getPathValue(frame, ['summary', 'dstPort']))
  addField(fields, 'highest.protocol', getPathValue(frame, ['summary', 'highestProtocol']))

  addField(fields, 'dns.qry.name', getPathValue(frame, ['fields', 'dns', 'Queries', 'example.com: type A, class IN', 'dns.qry.name']))
  addField(fields, 'dns.flags.response', getPathValue(frame, ['fields', 'dns', 'dns.flags_tree', 'dns.flags.response']))
  addField(fields, 'dns.count.answers', getPathValue(frame, ['fields', 'dns', 'dns.count.answers']))
  addField(fields, 'tcp.flags', getPathValue(frame, ['fields', 'tcp', 'tcp.flags']))
  addField(fields, 'tcp.flags.syn', getPathValue(frame, ['fields', 'tcp', 'tcp.flags_tree', 'tcp.flags.syn']))
  addField(fields, 'tcp.flags.ack', getPathValue(frame, ['fields', 'tcp', 'tcp.flags_tree', 'tcp.flags.ack']))
  addField(fields, 'tls.record.version', getPathValue(frame, ['fields', 'tls', 'tls.record.version']))
  addField(fields, 'tls.handshake.type', getPathValue(frame, ['fields', 'tls', 'tls.handshake', 'tls.handshake.type']))
  addField(fields, 'stage.confidence', frame.stageHintConfidence)
  addField(fields, 'stage.reason', frame.stageHintReason)

  return fields
}

function buildSummary(frame: RawFrame, isReal: boolean): string {
  const highest = getPathValue(frame, ['summary', 'highestProtocol'])
  const srcIp = getPathValue(frame, ['summary', 'srcIp'])
  const dstIp = getPathValue(frame, ['summary', 'dstIp'])
  const srcPort = getPathValue(frame, ['summary', 'srcPort'])
  const dstPort = getPathValue(frame, ['summary', 'dstPort'])
  const prefix = isReal ? 'Verified real capture' : 'Synthetic fixture'

  if (highest && srcIp && dstIp) {
    const destination = dstPort ? `${dstIp}:${dstPort}` : dstIp
    const source = srcPort ? `${srcIp}:${srcPort}` : srcIp
    return `${prefix}: ${highest.toUpperCase()} ${source} → ${destination}`
  }

  return `${prefix}: frame ${frame.frameNumber}`
}

function normalizeFrames(
  fixture: RawFixture,
  isReal: boolean,
): CaptureFrameFixture[] {
  return (fixture.frames ?? [])
    .filter((frame) => frame.stageHint)
    .map((frame) => ({
      stageId: frame.stageHint as string,
      frameNumber: frame.frameNumber,
      timeRelative: frame.timeRelative,
      protocolStack: frame.protocolStack ?? [],
      summary: buildSummary(frame, isReal),
      fields: buildFieldMap(frame),
      fixtureId: fixture.id,
      source: isReal
        ? 'verified redacted real capture'
        : fixture.source ?? 'synthetic',
      kind: isReal ? 'real-capture-fixture' : 'synthetic-fixture',
      status: fixture.status,
      isReal,
      redacted: Boolean(fixture.redaction),
      confidence: frame.stageHintConfidence,
      reason: frame.stageHintReason,
    }))
}

const realCaptureFixtures =
  realFixture.status === 'attached'
    ? normalizeFrames(realFixture, true)
    : []

const syntheticCaptureFixtures = normalizeFrames(syntheticFixture, false)

export const captureFixtures: CaptureFrameFixture[] = [
  ...realCaptureFixtures,
  ...syntheticCaptureFixtures,
]

export function getFixtureForStage(stageId: string): CaptureFrameFixture | null {
  return captureFixtures.find((fixture) => fixture.stageId === stageId) ?? null
}

export function getFixturesForStage(stageId: string): CaptureFrameFixture[] {
  return captureFixtures.filter((fixture) => fixture.stageId === stageId)
}

export function summarizeFixtureCoverage(
  scenario: JourneyScenario,
): { attached: number; missing: number; total: number } {
  const attached = scenario.stages.filter((stage) => getFixtureForStage(stage.id)).length

  return {
    attached,
    missing: scenario.stages.length - attached,
    total: scenario.stages.length,
  }
}

export function summarizeRealCaptureFixture(): RealCaptureSummary {
  const stageIds = new Set(realCaptureFixtures.map((fixture) => fixture.stageId))

  return {
    fixtureId: realFixture.id,
    attached: realFixture.status === 'attached',
    status: realFixture.status,
    frameCount: realFixture.frames?.length ?? 0,
    stageCount: stageIds.size,
    redacted: Boolean(realFixture.redaction),
  }
}

export function isFixtureRelevantToStage(stage: JourneyStage): boolean {
  return Boolean(getFixtureForStage(stage.id))
}
