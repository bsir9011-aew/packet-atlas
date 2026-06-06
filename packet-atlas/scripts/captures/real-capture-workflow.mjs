import fs from 'node:fs'

const expectedFiles = [
  {
    id: 'plan',
    path: 'src/data/capture-plans/https-basic.controlled-capture-plan.json',
    command: 'npm run capture:plan -- --interface eth0 --host example.com',
  },
  {
    id: 'pcap',
    path: 'captures/https-basic.pcapng',
    command: 'Use the reviewed TShark command from reports/capture-command-plan.sh',
  },
  {
    id: 'profile',
    path: 'reports/pcap-profile.json',
    command: 'npm run capture:profile -- captures/https-basic.pcapng',
  },
  {
    id: 'raw-fixture',
    path: 'src/data/fixtures/https-basic.raw.json',
    command: 'npm run capture:export -- captures/https-basic.pcapng src/data/fixtures/https-basic.raw.json',
  },
  {
    id: 'normalized-fixture',
    path: 'src/data/fixtures/https-basic.real.fixture.json',
    command: 'npm run capture:normalize -- src/data/fixtures/https-basic.raw.json src/data/fixtures/https-basic.real.fixture.json',
  },
  {
    id: 'mapping',
    path: 'src/data/fixtures/https-basic.real.fixture.mapping.json',
    command: 'npm run capture:map -- src/data/fixtures/https-basic.real.fixture.json',
  },
  {
    id: 'candidate',
    path: 'src/data/fixtures/https-basic.real.fixture.candidate.json',
    command: 'npm run capture:candidate -- src/data/fixtures/https-basic.real.fixture.json src/data/fixtures/https-basic.real.fixture.mapping.json',
  },
]

const state = expectedFiles.map((item) => ({
  ...item,
  exists: fs.existsSync(item.path),
}))

const next = state.find((item) => !item.exists)

const lines = []
lines.push('# Packet Atlas real capture workflow')
lines.push('')
lines.push(`Generated: ${new Date().toISOString()}`)
lines.push('')
lines.push('## Current state')
lines.push('')
for (const item of state) {
  lines.push(`- ${item.exists ? '✅' : '⬜'} **${item.id}** — \`${item.path}\``)
}
lines.push('')
lines.push('## Next action')
lines.push('')
if (next) {
  lines.push(`Run or review:`)
  lines.push('')
  lines.push('```bash')
  lines.push(next.command)
  lines.push('```')
} else {
  lines.push('All intermediate files exist. Validate and promote the candidate:')
  lines.push('')
  lines.push('```bash')
  lines.push('npm run capture:candidate:validate -- src/data/fixtures/https-basic.real.fixture.candidate.json')
  lines.push('npm run capture:candidate:promote -- src/data/fixtures/https-basic.real.fixture.candidate.json')
  lines.push('npm run capture:readiness:strict -- src/data/fixtures/https-basic.real.fixture.json')
  lines.push('```')
}
lines.push('')
lines.push('## Safety rule')
lines.push('')
lines.push('Capture only traffic you are authorized to inspect. Keep capture windows short and controlled.')

fs.mkdirSync('reports', { recursive: true })
fs.writeFileSync('reports/real-capture-workflow.md', lines.join('\n') + '\n')

console.log('🧭 real capture workflow report written: reports/real-capture-workflow.md')
if (next) {
  console.log(`Next missing step: ${next.id}`)
  console.log(`Suggested command: ${next.command}`)
} else {
  console.log('All intermediate files exist. Validate/promote candidate next.')
}
