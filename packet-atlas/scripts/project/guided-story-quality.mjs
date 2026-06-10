import fs from 'node:fs'

const input = 'reports/guided-journey-script.md'
const output = 'reports/guided-story-quality.md'

if (!fs.existsSync(input)) {
  console.error(`❌ Missing ${input}. Run npm run story:guided first.`)
  process.exit(1)
}

const text = fs.readFileSync(input, 'utf8')
const checks = [
  ['contains one journey framing', text.includes('One journey, many lenses')],
  ['contains proof questions', text.includes('Proof question')],
  ['contains notebook prompts', text.includes('Notebook')],
  ['contains final recap', text.includes('Final recap')],
  ['avoids dashboard framing', !/kpi|scoreboard|metric dashboard|performance chart|ranking/i.test(text)],
]

const ok = checks.every(([, passed]) => passed)
const lines = [
  '# Guided Story Quality Report',
  '',
  `Status: ${ok ? 'READY' : 'NEEDS WORK'}`,
  '',
  ...checks.map(([label, passed]) => `- ${passed ? '✅' : '❌'} ${label}`),
  '',
]

fs.writeFileSync(output, lines.join('\n'))
console.log(`🧪 Guided story quality written: ${output}`)
if (!ok) process.exit(1)
