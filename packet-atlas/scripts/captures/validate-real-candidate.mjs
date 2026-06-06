import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const promote = args.includes('--promote')
const input = args.find((arg) => !arg.startsWith('--')) ??
  'src/data/fixtures/https-basic.real.fixture.candidate.json'
const output = 'src/data/fixtures/https-basic.real.fixture.json'
const reportPath = 'reports/real-candidate-validation.json'

if (!fs.existsSync(input)) {
  console.error(`❌ candidate fixture not found: ${input}`)
  process.exit(1)
}

const candidate = JSON.parse(fs.readFileSync(input, 'utf8'))
const frames = Array.isArray(candidate.frames) ? candidate.frames : []
const stageFramePlan = Array.isArray(candidate.stageFramePlan)
  ? candidate.stageFramePlan
  : []
const plannedStageIds = stageFramePlan.map((plan) => plan.stageId)
const frameStageIds = new Set(frames.map((frame) => frame.stageHint).filter(Boolean))

const failures = []
const warnings = []

if (candidate.status !== 'candidate-real-capture') {
  failures.push(`Expected status candidate-real-capture, got ${candidate.status}`)
}

if (frames.length === 0) {
  failures.push('Candidate has no frames.')
}

for (const frame of frames) {
  if (typeof frame.frameNumber !== 'number') {
    failures.push(`Frame missing numeric frameNumber: ${JSON.stringify(frame).slice(0, 160)}`)
  }

  if (!Array.isArray(frame.protocolStack) || frame.protocolStack.length === 0) {
    failures.push(`Frame ${frame.frameNumber ?? '?'} has no protocolStack.`)
  }

  if (!frame.stageHint) {
    warnings.push(`Frame ${frame.frameNumber ?? '?'} has no stageHint.`)
  }
}

const missingPlannedStages = plannedStageIds.filter(
  (stageId) => !frameStageIds.has(stageId),
)

if (missingPlannedStages.length > 0) {
  failures.push(`Missing required planned stage mappings: ${missingPlannedStages.join(', ')}`)
}

const duplicateFrames = frames
  .map((frame) => frame.frameNumber)
  .filter((frameNumber, index, list) => list.indexOf(frameNumber) !== index)

if (duplicateFrames.length > 0) {
  failures.push(`Duplicate frame numbers: ${[...new Set(duplicateFrames)].join(', ')}`)
}

const report = {
  generatedAt: new Date().toISOString(),
  input,
  promote,
  frameCount: frames.length,
  plannedStageCount: plannedStageIds.length,
  mappedPlannedStageCount: plannedStageIds.length - missingPlannedStages.length,
  failures,
  warnings,
  status: failures.length === 0 ? 'valid-candidate' : 'invalid-candidate',
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')

if (failures.length > 0) {
  console.error('❌ real capture candidate is not valid')
  for (const failure of failures) console.error(`❌ ${failure}`)
  for (const warning of warnings) console.log(`⚠️ ${warning}`)
  console.log(`📄 report: ${reportPath}`)
  process.exit(1)
}

console.log('✅ real capture candidate is valid')
for (const warning of warnings) console.log(`⚠️ ${warning}`)
console.log(`📄 report: ${reportPath}`)

if (promote) {
  const promoted = {
    ...candidate,
    id: 'https-basic-real-fixture',
    kind: 'real-capture-fixture',
    status: 'attached',
    promotedAt: new Date().toISOString(),
    sourceCandidate: input,
    note: 'Promoted from a reviewed and validated real capture candidate.',
    reviewRequired: false,
  }

  fs.writeFileSync(output, JSON.stringify(promoted, null, 2) + '\n')
  console.log(`🚀 promoted candidate to: ${output}`)
} else {
  console.log('ℹ️ Re-run with --promote after manual review to write the trusted real fixture.')
}
