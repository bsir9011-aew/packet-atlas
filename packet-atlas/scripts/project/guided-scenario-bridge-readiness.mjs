import fs from 'node:fs'

const input = 'reports/guided-scenario-bridge.md'
const output = 'reports/guided-scenario-bridge-readiness.md'

if (!fs.existsSync(input)) {
  console.error(`❌ Missing ${input}. Run npm run story:bridge first.`)
  process.exit(1)
}

const text = fs.readFileSync(input, 'utf8')
const checks = [
  ['contains HTTPS happy path anchors', text.includes('HTTPS happy path')],
  ['contains DNS failure anchors', text.includes('DNS failure')],
  ['contains TCP blocked anchors', text.includes('TCP blocked')],
  ['contains TLS failure anchors', text.includes('TLS failure')],
  ['contains HTTP/application error anchors', text.includes('HTTP/application error')],
  ['anchors to DNS', text.includes('dns')],
  ['anchors to TCP', text.includes('tcp')],
  ['anchors to TLS', text.includes('tls')],
  ['anchors to HTTP/app', text.includes('http') || text.includes('app')],
]

const ok = checks.every(([, passed]) => passed)

const lines = [
  '# Guided Scenario Bridge Readiness',
  '',
  `Status: ${ok ? 'READY' : 'NEEDS WORK'}`,
  '',
  ...checks.map(([label, passed]) => `- ${passed ? '✅' : '❌'} ${label}`),
  '',
]

fs.writeFileSync(output, lines.join('\n'))
console.log(`🧪 Guided scenario bridge readiness written: ${output}`)

if (!ok) process.exit(1)
