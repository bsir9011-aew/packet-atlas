import fs from 'node:fs'
import path from 'node:path'

const planPath = 'src/data/capture-plans/http-local.controlled-capture-plan.json'
const reportPath = 'reports/http-local-capture-plan.md'

if (!fs.existsSync(planPath)) {
  console.error(`❌ plan not found: ${planPath}`)
  process.exit(1)
}

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'))
const lines = [
  '# HTTP local capture plan',
  '',
  `Plan: ${plan.id}`,
  `Status: ${plan.status}`,
  '',
  '## Purpose',
  '',
  plan.purpose,
  '',
  '## Safety',
  '',
  `- Scope: ${plan.safety.scope}`,
  `- Interface: ${plan.safety.recommendedInterface}`,
  `- Raw artifact policy: ${plan.safety.rawArtifactsPolicy}`,
  '',
  '## Commands',
  '',
  'Terminal 1 — local server:',
  '',
  '```bash',
  plan.commands.server,
  '```',
  '',
  'Terminal 2 — capture:',
  '',
  '```bash',
  plan.commands.capture,
  '```',
  '',
  'Terminal 3 — request:',
  '',
  '```bash',
  plan.commands.request,
  '```',
  '',
  '## Expected evidence',
  '',
  ...plan.expectedEvidence.map((item) => `- ${item}`),
  '',
  'Raw PCAP and raw JSON exports remain local-only until reviewed and promoted.',
]

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, lines.join('\n') + '\n')
console.log(`🌐 HTTP local capture plan report written: ${reportPath}`)
console.log('✅ http-local capture plan ok')
