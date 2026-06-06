import fs from 'node:fs'
import path from 'node:path'

const evidenceDir = 'reports/evidence'
const indexPath = path.join(evidenceDir, 'INDEX.md')

const evidenceFiles = [
  ['Capture environment', 'reports/capture-environment-report.json'],
  ['Capture plan', 'src/data/capture-plans/https-basic.controlled-capture-plan.json'],
  ['Command plan', 'reports/capture-command-plan.sh'],
  ['PCAP profile', 'reports/pcap-profile.json'],
  ['Fixture readiness', 'reports/capture-fixture-readiness.json'],
  ['Privacy audit', 'reports/capture-privacy-audit.json'],
  ['Fixture coverage', 'reports/fixture-stage-coverage.md'],
  ['Real capture workflow', 'reports/real-capture-workflow.md'],
  ['Release readiness', 'reports/release-readiness.md'],
]

fs.mkdirSync(evidenceDir, { recursive: true })

const lines = []
lines.push('# Packet Atlas capture evidence pack')
lines.push('')
lines.push(`Generated: ${new Date().toISOString()}`)
lines.push('')
lines.push('This index does not prove that the first real capture is complete. It collects the operator evidence needed to review the capture pipeline.')
lines.push('')
lines.push('## Evidence files')
lines.push('')
lines.push('| Status | Evidence | Path |')
lines.push('|---|---|---|')

for (const [label, file] of evidenceFiles) {
  const exists = fs.existsSync(file)
  lines.push(`| ${exists ? '✅' : '⬜'} | ${label} | \`${file}\` |`)
}

lines.push('')
lines.push('## Suggested review order')
lines.push('')
lines.push('1. Capture environment')
lines.push('2. Controlled capture plan')
lines.push('3. PCAP profile')
lines.push('4. Normalized fixture and mapping')
lines.push('5. Candidate validation')
lines.push('6. Privacy audit')
lines.push('7. Fixture readiness')
lines.push('8. Release readiness')
lines.push('')
lines.push('## Rule')
lines.push('')
lines.push('Do not promote a real capture fixture until candidate validation and manual review both pass.')

fs.writeFileSync(indexPath, lines.join('\n') + '\n')

console.log(`📦 evidence pack index written: ${indexPath}`)
