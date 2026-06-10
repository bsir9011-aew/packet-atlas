import fs from 'node:fs'

const input = 'reports/guided-scenario-packs.md'
const output = 'reports/guided-scenario-quality.md'

if (!fs.existsSync(input)) {
  console.error(`❌ Missing ${input}. Run npm run story:scenarios first.`)
  process.exit(1)
}

const text = fs.readFileSync(input, 'utf8')
const checks = [
  ['contains happy path', text.includes('HTTPS happy path')],
  ['contains DNS failure', text.includes('DNS failure')],
  ['contains TCP blocked', text.includes('TCP blocked')],
  ['contains TLS failure', text.includes('TLS failure')],
  ['contains HTTP/application error', text.includes('HTTP/application error')],
  ['contains user symptoms', text.includes('User symptom')],
  ['avoids dashboard framing', !/kpi|scoreboard|metric dashboard|performance chart|ranking/i.test(text)],
]

const ok = checks.every(([, passed]) => passed)
const lines = [
  '# Guided Scenario Quality Report',
  '',
  `Status: ${ok ? 'READY' : 'NEEDS WORK'}`,
  '',
  ...checks.map(([label, passed]) => `- ${passed ? '✅' : '❌'} ${label}`),
  '',
]

fs.writeFileSync(output, lines.join('\n'))
console.log(`🧪 Guided scenario quality written: ${output}`)
if (!ok) process.exit(1)
