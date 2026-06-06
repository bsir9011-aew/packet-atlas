import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const baselinePath = args[0] ?? 'src/data/fixtures/https-example.synthetic.fixture.json'
const candidatePath = args[1] ?? 'src/data/fixtures/https-basic.real.fixture.candidate.json'
const outputPath = args[2] ?? 'reports/fixture-stage-coverage.md'

function readFixture(file) {
  if (!fs.existsSync(file)) {
    return { exists: false, path: file, id: null, stageHints: new Set(), frameCount: 0 }
  }

  const fixture = JSON.parse(fs.readFileSync(file, 'utf8'))
  const hints = new Set(
    (fixture.frames ?? [])
      .map((frame) => frame.stageHint)
      .filter(Boolean),
  )

  return {
    exists: true,
    path: file,
    id: fixture.id ?? path.basename(file),
    status: fixture.status ?? fixture.kind ?? 'unknown',
    stageHints: hints,
    frameCount: Array.isArray(fixture.frames) ? fixture.frames.length : 0,
  }
}

const baseline = readFixture(baselinePath)
const candidate = readFixture(candidatePath)
const union = new Set([...baseline.stageHints, ...candidate.stageHints])
const missingFromCandidate = [...baseline.stageHints].filter(
  (stageId) => !candidate.stageHints.has(stageId),
)
const extraInCandidate = [...candidate.stageHints].filter(
  (stageId) => !baseline.stageHints.has(stageId),
)

const lines = []
lines.push('# Fixture stage coverage comparator')
lines.push('')
lines.push(`Generated: ${new Date().toISOString()}`)
lines.push('')
lines.push('## Inputs')
lines.push('')
lines.push(`- Baseline: \`${baseline.path}\` — ${baseline.exists ? baseline.id : 'missing'}`)
lines.push(`- Candidate: \`${candidate.path}\` — ${candidate.exists ? candidate.id : 'missing'}`)
lines.push('')
lines.push('## Summary')
lines.push('')
lines.push(`- Baseline frames: ${baseline.frameCount}`)
lines.push(`- Candidate frames: ${candidate.frameCount}`)
lines.push(`- Baseline mapped stages: ${baseline.stageHints.size}`)
lines.push(`- Candidate mapped stages: ${candidate.stageHints.size}`)
lines.push(`- Missing from candidate: ${missingFromCandidate.length}`)
lines.push(`- Extra in candidate: ${extraInCandidate.length}`)
lines.push('')
lines.push('## Stage coverage')
lines.push('')
lines.push('| Stage | Baseline | Candidate |')
lines.push('|---|---:|---:|')
for (const stageId of [...union].sort()) {
  lines.push(
    `| ${stageId} | ${baseline.stageHints.has(stageId) ? '✅' : '—'} | ${candidate.stageHints.has(stageId) ? '✅' : '—'} |`,
  )
}
lines.push('')
lines.push('## Interpretation')
lines.push('')
if (!candidate.exists) {
  lines.push('Candidate fixture does not exist yet. This is expected before the first real capture.')
} else if (missingFromCandidate.length === 0) {
  lines.push('Candidate covers every stage currently covered by the baseline fixture.')
} else {
  lines.push('Candidate is missing some baseline-covered stages. Review mapping before promotion.')
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, lines.join('\n') + '\n')

console.log(`🧮 fixture coverage report written: ${outputPath}`)
console.log(`Missing from candidate: ${missingFromCandidate.length}`)
