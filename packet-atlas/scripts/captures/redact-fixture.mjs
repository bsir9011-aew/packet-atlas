import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const input = args[0] ?? 'src/data/fixtures/https-basic.real.fixture.candidate.json'
const output = args[1] ?? input.replace(/\.json$/, '.redacted.json')

const hostArgIndex = args.indexOf('--host')
const sensitiveHost = hostArgIndex >= 0 ? args[hostArgIndex + 1] : undefined

if (!fs.existsSync(input)) {
  console.error(`❌ fixture not found: ${input}`)
  console.error('Usage: npm run capture:redact -- <fixture.json> [output.json] [--host internal.example]')
  process.exit(1)
}

const counters = {
  mac: 0,
  privateIpv4: 0,
  email: 0,
  host: 0,
}

function redactString(value) {
  let result = value

  result = result.replace(/\b([0-9a-f]{2}:){5}[0-9a-f]{2}\b/gi, () => {
    counters.mac += 1
    return 'XX:XX:XX:XX:XX:XX'
  })

  result = result.replace(/\b10\.(\d{1,3}\.){2}\d{1,3}\b/g, () => {
    counters.privateIpv4 += 1
    return '10.0.0.10'
  })

  result = result.replace(/\b192\.168\.(\d{1,3})\.(\d{1,3})\b/g, () => {
    counters.privateIpv4 += 1
    return '192.168.0.10'
  })

  result = result.replace(/\b172\.(1[6-9]|2\d|3[01])\.(\d{1,3})\.(\d{1,3})\b/g, () => {
    counters.privateIpv4 += 1
    return '172.16.0.10'
  })

  result = result.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => {
    counters.email += 1
    return 'redacted@example.invalid'
  })

  if (sensitiveHost) {
    result = result.split(sensitiveHost).join('redacted.local')
    if (result !== value) counters.host += 1
  }

  return result
}

function walk(value) {
  if (typeof value === 'string') return redactString(value)
  if (Array.isArray(value)) return value.map(walk)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, walk(item)]),
    )
  }
  return value
}

const fixture = JSON.parse(fs.readFileSync(input, 'utf8'))
const redacted = {
  ...walk(fixture),
  redaction: {
    appliedAt: new Date().toISOString(),
    input,
    counters,
    note: 'Review redacted fixture before committing real capture artifacts.',
  },
}

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(redacted, null, 2) + '\n')

console.log(`🧼 redacted fixture written: ${output}`)
console.log(`MAC: ${counters.mac} • private IPv4: ${counters.privateIpv4} • email: ${counters.email} • host: ${counters.host}`)
