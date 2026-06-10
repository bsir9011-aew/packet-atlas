import fs from 'node:fs'

const output = 'reports/guided-scenario-runtime.md'

const cards = [
  ['HTTPS happy path', 'happy-path', 'Follow the complete journey once before inspecting failure paths.'],
  ['DNS failure', 'failure-path', 'Start from the symptom, then prove whether name resolution stopped the journey.'],
  ['TCP blocked', 'failure-path', 'Prove whether DNS worked and transport failed.'],
  ['TLS failure', 'failure-path', 'Prove whether TCP worked and the secure envelope failed.'],
  ['HTTP/application error', 'failure-path', 'Prove whether earlier layers carried the request and application evidence matters.'],
]

const lines = [
  '# Packet Atlas Guided Scenario Runtime',
  '',
  'This report describes how guided scenarios should be read at runtime.',
  '',
  'Default scenario: HTTPS happy path',
  '',
  '## Scenario cards',
  '',
  ...cards.flatMap(([label, mode, action]) => [
    `### ${label}`,
    '',
    `- Mode: ${mode}`,
    `- Reader action: ${action}`,
    '',
  ]),
  '## Runtime rule',
  '',
  'Choose a scenario, read one step, check evidence, write one notebook line and move next.',
  '',
]

fs.writeFileSync(output, lines.join('\n'))
console.log(`🧭 Guided scenario runtime written: ${output}`)
