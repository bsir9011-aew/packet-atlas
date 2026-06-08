import fs from 'node:fs'
import path from 'node:path'

const httpsPath = 'src/data/fixtures/https-basic.real.fixture.json'
const httpPath = 'src/data/fixtures/http-local.real.fixture.json'
const reportPath = 'reports/https-http-contrast-audit.json'

function readFixture(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing fixture: ${file}`)
  }

  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function stackIncludes(frame, protocol) {
  return Array.isArray(frame.protocolStack) && frame.protocolStack.includes(protocol)
}

function text(frame) {
  return JSON.stringify(frame.fields ?? {})
}

function readableHttp(frame) {
  const raw = text(frame)
  return (
    stackIncludes(frame, 'http') ||
    raw.includes('http.request.method') ||
    raw.includes('http.response.code') ||
    raw.includes('GET / HTTP') ||
    raw.includes('HTTP/1.0 200')
  )
}

function portMatch(frame, port) {
  return frame.summary?.srcPort === port || frame.summary?.dstPort === port
}

function summarize(file, fixture) {
  const frames = Array.isArray(fixture.frames) ? fixture.frames : []

  return {
    file,
    fixtureId: fixture.id,
    status: fixture.status ?? 'unknown',
    kind: fixture.kind ?? 'unknown',
    frameCount: frames.length,
    dnsFrames: frames.filter((frame) => stackIncludes(frame, 'dns')).length,
    tcp443Frames: frames.filter((frame) => portMatch(frame, '443')).length,
    tcp8080Frames: frames.filter((frame) => portMatch(frame, '8080')).length,
    tlsFrames: frames.filter((frame) => stackIncludes(frame, 'tls')).length,
    readableHttpFrames: frames.filter(readableHttp).length,
    redacted: Boolean(fixture.redaction),
  }
}

const https = summarize(httpsPath, readFixture(httpsPath))
const httpLocal = summarize(httpPath, readFixture(httpPath))

const failures = []
const warnings = []

if (https.status !== 'attached') failures.push('HTTPS real fixture must be attached.')
if (httpLocal.status !== 'attached') failures.push('HTTP local real fixture must be attached.')

if (https.tlsFrames <= 0) failures.push('HTTPS fixture should contain TLS evidence.')
if (https.readableHttpFrames !== 0) failures.push('HTTPS fixture should not expose readable HTTP frames.')

if (httpLocal.tlsFrames !== 0) failures.push('HTTP local fixture should not contain TLS frames.')
if (httpLocal.readableHttpFrames <= 0) failures.push('HTTP local fixture should expose readable HTTP frames.')
if (httpLocal.tcp8080Frames <= 0) failures.push('HTTP local fixture should contain TCP/8080 evidence.')

if (!https.redacted) failures.push('HTTPS fixture must have redaction metadata.')
if (!httpLocal.redacted) failures.push('HTTP local fixture must have redaction metadata.')

if (httpLocal.dnsFrames !== 0) warnings.push('HTTP local fixture contains DNS frames; localhost IP capture usually should not.')

const report = {
  generatedAt: new Date().toISOString(),
  status: failures.length === 0 ? 'valid-contrast' : 'invalid',
  https,
  httpLocal,
  teachingContrast:
    'HTTPS shows DNS/TCP/TLS evidence without readable HTTP; plaintext local HTTP exposes request/response evidence.',
  failures,
  warnings,
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')

console.log('⚖️ HTTPS vs HTTP contrast audit')
console.log(`HTTPS: frames=${https.frameCount}, tls=${https.tlsFrames}, http-readable=${https.readableHttpFrames}`)
console.log(`HTTP local: frames=${httpLocal.frameCount}, tls=${httpLocal.tlsFrames}, http-readable=${httpLocal.readableHttpFrames}`)

for (const warning of warnings) console.log(`⚠️ ${warning}`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  console.error(`📄 report: ${reportPath}`)
  process.exit(1)
}

console.log('✅ contrast audit ok')
console.log(`📄 report: ${reportPath}`)
