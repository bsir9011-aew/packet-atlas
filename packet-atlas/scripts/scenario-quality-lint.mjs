import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const scenarioPath = path.join(root, 'src/features/packet-atlas/scenarios/httpsExample.ts')
const failures = []
const warnings = []

function fail(message) { failures.push(message) }
function warn(message) { warnings.push(message) }
function has(text, needle) { return text.includes(needle) }

if (!fs.existsSync(scenarioPath)) {
  fail(`Missing baseline scenario file: ${scenarioPath}`)
} else {
  const text = fs.readFileSync(scenarioPath, 'utf8')
  const stagesStart = text.indexOf('stages:')
  const stageText = stagesStart >= 0 ? text.slice(stagesStart) : text

  const requiredStageIds = [
    'url-intent',
    'browser-checks',
    'dns-query',
    'arp-gateway',
    'lan-frame',
    'router-nat-dns',
    'dns-response',
    'tcp-handshake',
    'tls-handshake',
    'http-request',
    'reverse-proxy',
    'app-db',
    'http-response',
    'browser-render',
  ]

  for (const id of requiredStageIds) {
    if (!has(text, `id: '${id}'`) && !has(text, `id: "${id}"`) && !has(text, `"id": "${id}"`)) {
      fail(`Baseline HTTPS scenario should contain stage id: ${id}`)
    }
  }

  const orderChecks = [
    ['dns-query', 'tcp-handshake', 'DNS should happen before TCP connection setup in the baseline HTTPS path.'],
    ['tcp-handshake', 'tls-handshake', 'TCP handshake should happen before TLS handshake.'],
    ['tls-handshake', 'http-request', 'TLS should happen before HTTP request in HTTPS baseline.'],
    ['arp-gateway', 'lan-frame', 'ARP/default-gateway resolution should happen before the first LAN frame.'],
    ['http-request', 'reverse-proxy', 'HTTP request should reach edge/proxy before app handling.'],
    ['app-db', 'http-response', 'Application handling should happen before HTTP response.'],
  ]

  for (const [before, after, message] of orderChecks) {
    const a = stageText.indexOf(`id: '${before}'`)
    const b = stageText.indexOf(`id: '${after}'`)
    if (a === -1 || b === -1) warn(`Could not verify order: ${before} -> ${after}`)
    else if (a > b) fail(message)
  }

  for (const needle of ['payloadRef','layerFocus','relations','whatUserSees','whatReallyHappens','easyToConfuse','whyItMatters','analogy','mapPosition']) {
    if (!has(text, needle)) fail(`Scenario should include educational/model field: ${needle}`)
  }

  if ((has(text, "ipVersion: 'ipv4'") || has(text, 'ipVersion: "ipv4"')) && !has(text, 'arp-gateway')) {
    fail('IPv4 baseline should include ARP/default-gateway neighbor resolution.')
  }

  if ((has(text, "ipVersion: 'ipv6'") || has(text, 'ipVersion: "ipv6"')) && has(text, 'arp-gateway')) {
    fail('IPv6 scenario should not use ARP as its neighbor discovery model.')
  }
}

const variantPath = path.join(root, 'src/features/packet-atlas/variants/scenarioVariants.ts')
if (fs.existsSync(variantPath)) {
  const variantText = fs.readFileSync(variantPath, 'utf8')
  for (const required of ['breakStageId', 'affectedStageIds', 'diagnosticAngle']) {
    if (!variantText.includes(required)) warn(`Variant model does not obviously include ${required}`)
  }
} else {
  warn('Variant file not found; skipping variant quality checks.')
}

console.log('🧭 Packet Atlas scenario quality lint')
for (const warning of warnings) console.log(`⚠️ ${warning}`)
if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  process.exit(1)
}
console.log('✅ scenario quality ok')
