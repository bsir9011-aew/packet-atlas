import httpsFixture from '../../../data/fixtures/https-basic.real.fixture.json'
import httpLocalFixture from '../../../data/fixtures/http-local.real.fixture.json'

type FixtureFrame = {
  frameNumber: number
  protocolStack?: string[]
  stageHint?: string
  summary?: {
    srcPort?: string
    dstPort?: string
    highestProtocol?: string
  }
  fields?: Record<string, unknown>
}

type Fixture = {
  id: string
  kind?: string
  status?: string
  redaction?: unknown
  frames?: FixtureFrame[]
}

type CaptureEvidence = {
  fixtureId: string
  status: string
  frameCount: number
  dnsFrames: number
  tcp443Frames: number
  tcp8080Frames: number
  tlsFrames: number
  readableHttpFrames: number
  redacted: boolean
}

export type CaptureContrastSummary = {
  https: CaptureEvidence
  httpLocal: CaptureEvidence
  claims: {
    httpsProtectsHttp: boolean
    httpLocalExposesHttp: boolean
    contrastIsValid: boolean
  }
  teachingContrast: string
}

function stackIncludes(frame: FixtureFrame, protocol: string): boolean {
  return Array.isArray(frame.protocolStack) && frame.protocolStack.includes(protocol)
}

function text(frame: FixtureFrame): string {
  return JSON.stringify(frame.fields ?? {})
}

function readableHttp(frame: FixtureFrame): boolean {
  const raw = text(frame)
  return (
    stackIncludes(frame, 'http') ||
    raw.includes('http.request.method') ||
    raw.includes('http.response.code') ||
    raw.includes('GET / HTTP') ||
    raw.includes('HTTP/1.0 200')
  )
}

function portMatch(frame: FixtureFrame, port: string): boolean {
  return frame.summary?.srcPort === port || frame.summary?.dstPort === port
}

function summarizeFixture(fixture: Fixture): CaptureEvidence {
  const frames = fixture.frames ?? []

  return {
    fixtureId: fixture.id,
    status: fixture.status ?? 'unknown',
    frameCount: frames.length,
    dnsFrames: frames.filter((frame) => stackIncludes(frame, 'dns')).length,
    tcp443Frames: frames.filter((frame) => portMatch(frame, '443')).length,
    tcp8080Frames: frames.filter((frame) => portMatch(frame, '8080')).length,
    tlsFrames: frames.filter((frame) => stackIncludes(frame, 'tls')).length,
    readableHttpFrames: frames.filter(readableHttp).length,
    redacted: Boolean(fixture.redaction),
  }
}

export function buildCaptureContrastSummary(): CaptureContrastSummary {
  const https = summarizeFixture(httpsFixture as Fixture)
  const httpLocal = summarizeFixture(httpLocalFixture as Fixture)

  const httpsProtectsHttp =
    https.status === 'attached' &&
    https.tlsFrames > 0 &&
    https.readableHttpFrames === 0

  const httpLocalExposesHttp =
    httpLocal.status === 'attached' &&
    httpLocal.tlsFrames === 0 &&
    httpLocal.readableHttpFrames > 0

  return {
    https,
    httpLocal,
    claims: {
      httpsProtectsHttp,
      httpLocalExposesHttp,
      contrastIsValid: httpsProtectsHttp && httpLocalExposesHttp,
    },
    teachingContrast:
      'HTTPS shows DNS/TCP/TLS evidence without readable HTTP, while local plaintext HTTP exposes the request/response directly.',
  }
}
