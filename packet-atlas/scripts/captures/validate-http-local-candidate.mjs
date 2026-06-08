import fs from 'node:fs'
import path from 'node:path'

const input =
  process.argv[2] ?? 'src/data/fixtures/http-local.real.fixture.candidate.json'
const reportPath = 'reports/http-local-candidate-validation.json'

if (!fs.existsSync(input)) {
  console.error(`❌ HTTP local candidate not found: ${input}`)
  process.exit(1)
}

const candidate = JSON.parse(fs.readFileSync(input, 'utf8'))
const frames = Array.isArray(candidate.frames) ? candidate.frames : []
const failures = []
const warnings = []

function stackIncludes(frame, protocol) {
  return Array.isArray(frame.protocolStack) && frame.protocolStack.includes(protocol)
}

function text(frame) {
  return JSON.stringify(frame.fields ?? {})
}

function stageCount(stageId) {
  return frames.filter((frame) => frame.stageHint === stageId).length
}

if (candidate.kind !== 'real-capture-fixture') failures.push('kind must be real-capture-fixture')
if (!candidate.redaction?.applied) failures.push('redaction.applied must be true')
if (frames.length !== 12) warnings.push(`expected 12 frames from controlled run, got ${frames.length}`)
if (frames.length === 0) failures.push('frames[] must not be empty')

const nonLoopback = frames.filter((frame) => {
  const src = frame.summary?.srcIp
  const dst = frame.summary?.dstIp
  return src !== '127.0.0.1' || dst !== '127.0.0.1'
})

if (nonLoopback.length > 0) failures.push(`non-loopback frames found: ${nonLoopback.length}`)

if (frames.some((frame) => stackIncludes(frame, 'tls'))) failures.push('TLS frames must not exist in plaintext HTTP local capture')
if (frames.some((frame) => stackIncludes(frame, 'dns'))) failures.push('DNS frames must not exist in localhost IP capture')
if (!frames.some((frame) => stackIncludes(frame, 'http'))) failures.push('HTTP frames must exist')

if (stageCount('http-local-request') < 1) failures.push('missing http-local-request stage')
if (stageCount('http-local-response') < 1) failures.push('missing http-local-response stage')
if (stageCount('http-local-tcp-open') < 2) warnings.push('expected TCP open frames')
if (stageCount('http-local-tcp-close') < 1) warnings.push('expected TCP close frames')

const hasGet = frames.some((frame) => text(frame).includes('GET') || frame.summary?.highestProtocol === 'http')
const has200 = frames.some((frame) => text(frame).includes('200') || frame.stageHint === 'http-local-response')

if (!hasGet) failures.push('readable GET evidence not found')
if (!has200) failures.push('readable HTTP 200 evidence not found')

const report = {
  generatedAt: new Date().toISOString(),
  input,
  status: failures.length === 0 ? 'valid-http-local-candidate' : 'invalid',
  frameCount: frames.length,
  stageCounts: Object.fromEntries(
    [...new Set(frames.map((frame) => frame.stageHint ?? 'unknown'))].map((stage) => [
      stage,
      stageCount(stage),
    ]),
  ),
  failures,
  warnings,
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')

for (const warning of warnings) console.log(`⚠️ ${warning}`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  console.error(`📄 report: ${reportPath}`)
  process.exit(1)
}

console.log('✅ HTTP local candidate is valid')
console.log(`📄 report: ${reportPath}`)
