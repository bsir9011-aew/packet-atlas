import fs from 'node:fs'

const fixturePath = 'src/data/fixtures/dns-failure.synthetic.fixture.json'
const outputPath = 'reports/dns-branch-readiness.md'

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
const frames = fixture.frames ?? []
const expectedAbsence = fixture.expectedAbsence ?? []

const hasDnsQuery = frames.some(
  (frame) =>
    frame.protocolStack?.includes('dns') &&
    frame.fields?.['dns.flags.response'] === '0',
)

const hasDnsFailureAnswer = frames.some(
  (frame) =>
    frame.protocolStack?.includes('dns') &&
    (frame.fields?.['dns.rcode'] === '3' ||
      JSON.stringify(frame).toLowerCase().includes('nxdomain')),
)

const hasExpectedAbsence =
  expectedAbsence.includes('tcp/443') &&
  expectedAbsence.includes('tls') &&
  expectedAbsence.includes('http')

const checks = [
  ['Synthetic fixture exists', true],
  ['DNS query frame exists', hasDnsQuery],
  ['DNS failure answer exists', hasDnsFailureAnswer],
  ['Expected absence includes TCP/443, TLS and HTTP', hasExpectedAbsence],
  ['Capture plan script exists', fs.existsSync('scripts/captures/dns-failure-capture-plan.mjs')],
  ['Capture plan documentation exists', fs.existsSync('docs/project/dns-failure-capture-plan.md')],
]

const passed = checks.filter(([, ok]) => ok).length
const ready = passed === checks.length

const lines = [
  '# DNS Branch Readiness',
  '',
  `Status: ${ready ? 'READY' : 'NOT READY'}`,
  '',
  '## Checks',
  '',
  ...checks.map(([label, ok]) => `- ${ok ? '✅' : '❌'} ${label}`),
  '',
  '## Evidence rule',
  '',
  '```text',
  'DNS query exists',
  'DNS failure answer exists',
  'TCP/443 absent',
  'TLS absent',
  'HTTP absent',
  '```',
  '',
  '## Next milestone',
  '',
  ready
    ? 'The DNS failure branch is ready for a controlled real capture candidate.'
    : 'Fix missing readiness checks before attempting a real capture candidate.',
  '',
]

fs.writeFileSync(outputPath, lines.join('\n') + '\n')
console.log(`🧭 DNS branch readiness written: ${outputPath}`)
