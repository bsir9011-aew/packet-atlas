import fs from 'node:fs'
import path from 'node:path'

const httpsPath = 'src/data/fixtures/https-basic.real.fixture.json'
const httpPath = 'src/data/fixtures/http-local.real.fixture.json'
const output = 'reports/project-summary.md'

function readFixture(file) {
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

function summarize(file, fixture) {
  const frames = fixture?.frames ?? []

  return {
    file,
    id: fixture?.id ?? 'missing',
    status: fixture?.status ?? 'missing',
    frames: frames.length,
    dns: frames.filter((frame) => stackIncludes(frame, 'dns')).length,
    tls: frames.filter((frame) => stackIncludes(frame, 'tls')).length,
    readableHttp: frames.filter(readableHttp).length,
    redacted: Boolean(fixture?.redaction),
  }
}

const https = summarize(httpsPath, readFixture(httpsPath))
const http = summarize(httpPath, readFixture(httpPath))

const lines = [
  '# Packet Atlas project summary',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Real capture fixtures',
  '',
  '| Fixture | Status | Frames | DNS | TLS | Readable HTTP | Redacted |',
  '|---|---:|---:|---:|---:|---:|---:|',
  `| ${https.id} | ${https.status} | ${https.frames} | ${https.dns} | ${https.tls} | ${https.readableHttp} | ${https.redacted ? 'yes' : 'no'} |`,
  `| ${http.id} | ${http.status} | ${http.frames} | ${http.dns} | ${http.tls} | ${http.readableHttp} | ${http.redacted ? 'yes' : 'no'} |`,
  '',
  '## Core contrast',
  '',
  '```text',
  'HTTPS: readable HTTP = 0 because HTTP is protected inside TLS.',
  'HTTP local: readable HTTP > 0 because there is no TLS wrapper.',
  '```',
]

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, lines.join('\n') + '\n')

console.log(`📘 project summary written: ${output}`)
