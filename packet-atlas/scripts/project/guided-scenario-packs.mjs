import fs from 'node:fs'

const output = 'reports/guided-scenario-packs.md'
const sections = [
  ['HTTPS happy path', 'User enters a URL and the page loads.', 'Intent -> DNS -> TCP -> TLS -> HTTP -> server -> render.'],
  ['DNS failure', 'Browser cannot resolve the name.', 'DNS query exists, no usable destination exists, TCP/TLS/HTTP never start.'],
  ['TCP blocked', 'Name resolves, but connection hangs or is refused.', 'Destination known, transport cannot open.'],
  ['TLS failure', 'Secure connection or certificate problem.', 'TCP exists, but secure envelope fails before HTTP is useful.'],
  ['HTTP/application error', 'Page returns an application error.', 'Earlier layers worked; now app evidence matters.'],
]

const lines = [
  '# Packet Atlas Guided Scenario Packs',
  '',
  'Scenario packs are guided reading blueprints, not dashboard panels.',
  '',
  ...sections.flatMap(([label, symptom, notebook]) => [
    `## ${label}`,
    '',
    `**User symptom:** ${symptom}`,
    '',
    `**Notebook:** ${notebook}`,
    '',
  ]),
]

fs.writeFileSync(output, lines.join('\n'))
console.log(`🧭 Guided scenario packs written: ${output}`)
