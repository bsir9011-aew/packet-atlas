import fs from 'node:fs'
import path from 'node:path'

const strict = process.argv.includes('--strict')
const reportPath = 'reports/v6-readiness.md'

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

const realFixturePath = 'src/data/fixtures/https-basic.real.fixture.json'
const candidatePath = 'src/data/fixtures/https-basic.real.fixture.candidate.json'
const readinessReport = readJson('reports/capture-fixture-readiness.json')
const validationReport = readJson('reports/real-candidate-validation.json')
const privacyReport = readJson('reports/capture-privacy-audit.json')
const pcapProfile = readJson('reports/pcap-profile.json')

const realFixture = readJson(realFixturePath)
const candidate = readJson(candidatePath)

const checks = []

function check(id, pass, message, action) {
  checks.push({
    id,
    pass,
    message,
    action,
  })
}

check(
  'real-fixture-exists',
  Boolean(realFixture),
  realFixture
    ? `Real fixture exists: ${realFixturePath}`
    : `Real fixture is missing: ${realFixturePath}`,
  'Promote a validated candidate using npm run capture:candidate:promote.',
)

check(
  'real-fixture-attached',
  realFixture?.status === 'attached',
  realFixture
    ? `Real fixture status: ${realFixture.status ?? 'unknown'}`
    : 'No real fixture status available.',
  'The trusted fixture must have status attached.',
)

check(
  'real-fixture-has-frames',
  Array.isArray(realFixture?.frames) && realFixture.frames.length > 0,
  realFixture?.frames
    ? `Real fixture frames: ${realFixture.frames.length}`
    : 'No real fixture frames available.',
  'Attach normalized frames from a real capture.',
)

check(
  'candidate-reviewed',
  validationReport?.status === 'valid-candidate',
  validationReport
    ? `Candidate validation status: ${validationReport.status}`
    : 'Candidate validation report is missing.',
  'Run npm run capture:candidate:validate before promotion.',
)

check(
  'strict-readiness',
  readinessReport?.status === 'ready',
  readinessReport
    ? `Fixture readiness status: ${readinessReport.status}`
    : 'Fixture readiness report is missing.',
  'Run npm run capture:readiness:strict after promotion.',
)

check(
  'privacy-reviewed',
  privacyReport?.status === 'ok',
  privacyReport
    ? `Privacy audit status: ${privacyReport.status}; findings: ${privacyReport.findingCount}`
    : 'Privacy audit report is missing.',
  'Run npm run capture:privacy:audit and review findings.',
)

check(
  'pcap-profile-compatible',
  Boolean(
    pcapProfile?.baselineFit?.hasClassicDns &&
      pcapProfile?.baselineFit?.hasTcp443 &&
      pcapProfile?.baselineFit?.hasTls &&
      !pcapProfile?.baselineFit?.likelyHttp3Mismatch,
  ),
  pcapProfile
    ? `PCAP profile baseline fit: DNS=${pcapProfile.baselineFit?.hasClassicDns}, TCP443=${pcapProfile.baselineFit?.hasTcp443}, TLS=${pcapProfile.baselineFit?.hasTls}, HTTP3 mismatch=${pcapProfile.baselineFit?.likelyHttp3Mismatch}`
    : 'PCAP profile report is missing.',
  'Run npm run capture:profile and confirm the capture matches the frozen baseline.',
)

check(
  'candidate-or-real-present',
  Boolean(candidate || realFixture),
  candidate || realFixture
    ? 'At least one candidate/real capture artifact exists.'
    : 'No candidate or real capture artifact exists yet.',
  'Build a candidate with npm run capture:candidate after mapping.',
)

const blockers = checks.filter((item) => !item.pass)

const lines = []
lines.push('# Packet Atlas v6 readiness gate')
lines.push('')
lines.push(`Generated: ${new Date().toISOString()}`)
lines.push('')
lines.push(`Mode: ${strict ? 'strict' : 'advisory'}`)
lines.push('')
lines.push('## Checks')
lines.push('')
lines.push('| Status | Check | Message | Next action |')
lines.push('|---|---|---|---|')
for (const item of checks) {
  lines.push(
    `| ${item.pass ? '✅' : '⏳'} | ${item.id} | ${item.message} | ${item.pass ? '—' : item.action} |`,
  )
}
lines.push('')
lines.push('## Result')
lines.push('')
if (blockers.length === 0) {
  lines.push('✅ Ready to cut the v6.0 real-capture milestone.')
} else {
  lines.push(`⏳ Not ready for v6.0 yet. Remaining blockers: ${blockers.length}.`)
}
lines.push('')
lines.push('## Rule')
lines.push('')
lines.push('Do not label v6.0 until a real fixture is attached, strict readiness passes and privacy review is complete.')

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, lines.join('\n') + '\n')

console.log(`🚀 v6 readiness report written: ${reportPath}`)
console.log(blockers.length === 0 ? '✅ ready for v6.0' : `⏳ ${blockers.length} blocker(s) remain`)

if (strict && blockers.length > 0) process.exit(1)
