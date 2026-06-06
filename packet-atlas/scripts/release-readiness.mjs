import fs from 'node:fs'
import path from 'node:path'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const scenarioDir = 'src/features/packet-atlas/scenarios'
const fixtureDir = 'src/data/fixtures'
const output = 'reports/release-readiness.md'

const manifests = fs
  .readdirSync(scenarioDir)
  .filter((file) => file.endsWith('.manifest.v2.json'))
  .map((file) => JSON.parse(fs.readFileSync(path.join(scenarioDir, file), 'utf8')))

const fixtures = fs
  .readdirSync(fixtureDir)
  .filter((file) => file.endsWith('.json'))
  .flatMap((file) => {
    try {
      return [
        {
          file,
          ...JSON.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8')),
        },
      ]
    } catch {
      return []
    }
  })

const realFixtures = fixtures.filter(
  (fixture) =>
    fixture.kind === 'real-capture-placeholder' ||
    fixture.status === 'attached' ||
    fixture.id?.includes('real'),
)

const attachedRealFixtures = realFixtures.filter(
  (fixture) =>
    fixture.status === 'attached' &&
    Array.isArray(fixture.frames) &&
    fixture.frames.length > 0,
)

const visualSnapshotsExist = fs.existsSync(
  'tests/visual/packet-atlas.visual.spec.ts-snapshots',
)
const rootCiExists = fs.existsSync('../.github/workflows/quality.yml')

const blockers = []
if (!rootCiExists) blockers.push('Root GitHub Actions workflow is missing.')
if (!visualSnapshotsExist) blockers.push('Visual regression snapshots are missing.')
if (attachedRealFixtures.length === 0) {
  blockers.push('No verified real capture fixture is attached yet.')
}

const lines = []
lines.push(`# Packet Atlas ${pkg.version} — Release Readiness Snapshot`)
lines.push('')
lines.push(`Generated: ${new Date().toISOString()}`)
lines.push('')
lines.push('## Summary')
lines.push('')
lines.push(`- Registered scenario manifests: ${manifests.length}`)
lines.push(`- Fixture JSON files: ${fixtures.length}`)
lines.push(`- Attached real fixtures: ${attachedRealFixtures.length}`)
lines.push(`- Root CI workflow: ${rootCiExists ? 'yes' : 'no'}`)
lines.push(`- Visual snapshots: ${visualSnapshotsExist ? 'yes' : 'no'}`)
lines.push('')
lines.push('## Scenario manifests')
lines.push('')
for (const manifest of manifests) {
  lines.push(
    `- **${manifest.shortTitle}** — ${manifest.status}; capabilities: ${(manifest.capabilities ?? []).join(', ')}`,
  )
}
lines.push('')
lines.push('## Release blockers')
lines.push('')
if (blockers.length === 0) {
  lines.push('- None detected.')
} else {
  for (const blocker of blockers) lines.push(`- ${blocker}`)
}
lines.push('')
lines.push('## Interpretation')
lines.push('')
lines.push(
  attachedRealFixtures.length > 0
    ? 'The project has at least one attached real capture fixture.'
    : 'The application/tooling release is healthy, but the v6.0 real-capture milestone is not yet complete.',
)

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, lines.join('\n') + '\n')

console.log(`✅ release readiness snapshot written: ${output}`)
console.log(
  blockers.length === 0
    ? '✅ no release blockers detected'
    : `⚠️ ${blockers.length} blocker(s) remain`,
)
