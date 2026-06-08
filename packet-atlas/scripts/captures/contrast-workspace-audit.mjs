import fs from 'node:fs'
import path from 'node:path'

const httpsPath = 'src/data/fixtures/https-basic.real.fixture.json'
const httpPath = 'src/data/fixtures/http-local.real.fixture.json'
const modelPath = 'src/features/packet-atlas/contrast-workspace/httpsHttpContrastWorkspaceModel.ts'
const panelPath = 'src/features/packet-atlas/contrast-workspace/HttpsHttpContrastPanel.tsx'
const workspacePath = 'src/features/packet-atlas/workspace/WorkspaceTabs.tsx'
const reportPath = 'reports/contrast-workspace-audit.json'

function readText(file) {
  if (!fs.existsSync(file)) return ''
  return fs.readFileSync(file, 'utf8')
}

function readJson(file) {
  if (!fs.existsSync(file)) return null
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

function summarizeFixture(file) {
  const fixture = readJson(file)
  const frames = fixture?.frames ?? []

  return {
    file,
    exists: Boolean(fixture),
    id: fixture?.id ?? 'missing',
    status: fixture?.status ?? 'missing',
    frameCount: frames.length,
    tlsFrames: frames.filter((frame) => stackIncludes(frame, 'tls')).length,
    readableHttpFrames: frames.filter(readableHttp).length,
    tcp443Frames: frames.filter((frame) => portMatch(frame, '443')).length,
    tcp8080Frames: frames.filter((frame) => portMatch(frame, '8080')).length,
    redacted: Boolean(fixture?.redaction),
  }
}

const https = summarizeFixture(httpsPath)
const httpLocal = summarizeFixture(httpPath)
const model = readText(modelPath)
const panel = readText(panelPath)
const workspace = readText(workspacePath)

const failures = []
const warnings = []

if (!https.exists) failures.push(`Missing HTTPS fixture: ${httpsPath}`)
if (!httpLocal.exists) failures.push(`Missing HTTP local fixture: ${httpPath}`)

if (https.id !== 'https-basic-real-fixture') failures.push(`Unexpected HTTPS fixture id: ${https.id}`)
if (httpLocal.id !== 'http-local-real-fixture') failures.push(`Unexpected HTTP local fixture id: ${httpLocal.id}`)

if (https.status !== 'attached') failures.push('HTTPS fixture must be attached')
if (httpLocal.status !== 'attached') failures.push('HTTP local fixture must be attached')

if (https.tlsFrames <= 0) failures.push('HTTPS fixture must contain TLS evidence')
if (https.readableHttpFrames !== 0) failures.push('HTTPS fixture must not contain readable HTTP evidence')
if (httpLocal.tlsFrames !== 0) failures.push('HTTP local fixture must not contain TLS evidence')
if (httpLocal.readableHttpFrames <= 0) failures.push('HTTP local fixture must contain readable HTTP evidence')
if (httpLocal.tcp8080Frames <= 0) failures.push('HTTP local fixture must contain TCP/8080 evidence')

if (!https.redacted) failures.push('HTTPS fixture must be redacted/reviewed')
if (!httpLocal.redacted) failures.push('HTTP local fixture must be redacted/reviewed')

if (!model.includes('Readable HTTP')) failures.push('Contrast model must expose Readable HTTP row')
if (!model.includes('TLS wrapper')) failures.push('Contrast model must expose TLS wrapper row')
if (!model.includes('Do not infer application content')) {
  failures.push('Contrast model must include operator rule about inference')
}

if (!panel.includes('HTTP vs HTTPS Contrast Workspace')) {
  failures.push('Contrast panel must expose the workspace title')
}
if (!panel.includes('role="table"')) {
  warnings.push('Contrast panel table role not found')
}

if (!workspace.includes('HttpsHttpContrastPanel')) {
  failures.push('Contrast panel must be mounted in WorkspaceTabs')
}

const report = {
  generatedAt: new Date().toISOString(),
  status: failures.length === 0 ? 'contrast-workspace-ok' : 'invalid',
  https,
  httpLocal,
  checks: {
    modelPath,
    panelPath,
    workspacePath,
    mounted: workspace.includes('HttpsHttpContrastPanel'),
    hasReadableHttpRow: model.includes('Readable HTTP'),
    hasTlsWrapperRow: model.includes('TLS wrapper'),
    hasOperatorRule: model.includes('Do not infer application content'),
  },
  warnings,
  failures,
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')

console.log('🧱 Packet Atlas contrast workspace audit')
console.log(`HTTPS: tls=${https.tlsFrames}, readableHttp=${https.readableHttpFrames}, redacted=${https.redacted}`)
console.log(`HTTP local: tls=${httpLocal.tlsFrames}, readableHttp=${httpLocal.readableHttpFrames}, redacted=${httpLocal.redacted}`)

for (const warning of warnings) console.log(`⚠️ ${warning}`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  console.error(`📄 report: ${reportPath}`)
  process.exit(1)
}

console.log('✅ contrast workspace audit ok')
console.log(`📄 report: ${reportPath}`)
