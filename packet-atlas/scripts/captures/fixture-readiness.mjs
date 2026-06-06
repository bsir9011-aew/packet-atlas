import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const allowPending = args.includes('--allow-pending')
const positional = args.filter((arg) => !arg.startsWith('--'))
const input =
  positional[0] ??
  'src/data/fixtures/https-basic.real.fixture.placeholder.json'
const reportPath =
  positional[1] ?? 'reports/capture-fixture-readiness.json'

if (!fs.existsSync(input)) {
  console.error(`❌ fixture not found: ${input}`)
  process.exit(1)
}

const fixture = JSON.parse(fs.readFileSync(input, 'utf8'))
const frames = Array.isArray(fixture.frames) ? fixture.frames : []
const stageFramePlan = Array.isArray(fixture.stageFramePlan)
  ? fixture.stageFramePlan
  : []

const checks = []

function addCheck(id, status, message) {
  checks.push({ id, status, message })
}

addCheck(
  'fixture-id',
  fixture.id ? 'pass' : 'fail',
  fixture.id ? `Fixture id: ${fixture.id}` : 'Fixture id is missing.',
)

addCheck(
  'real-frames',
  frames.length > 0 ? 'pass' : 'pending',
  frames.length > 0
    ? `${frames.length} real/normalized frame(s) present.`
    : 'No frames are attached yet.',
)

const frameNumbers = frames
  .map((frame) => frame.frameNumber)
  .filter((value) => typeof value === 'number')
const uniqueFrameNumbers = new Set(frameNumbers)

addCheck(
  'unique-frame-numbers',
  frameNumbers.length === frames.length &&
    uniqueFrameNumbers.size === frameNumbers.length
    ? 'pass'
    : frames.length === 0
      ? 'pending'
      : 'fail',
  frames.length === 0
    ? 'Cannot verify frame numbers before frames exist.'
    : 'Every frame should have a unique numeric frameNumber.',
)

const missingStacks = frames.filter(
  (frame) => !Array.isArray(frame.protocolStack) || frame.protocolStack.length === 0,
)

addCheck(
  'protocol-stacks',
  missingStacks.length === 0 && frames.length > 0
    ? 'pass'
    : frames.length === 0
      ? 'pending'
      : 'fail',
  frames.length === 0
    ? 'Cannot verify protocol stacks before frames exist.'
    : `${missingStacks.length} frame(s) missing protocolStack.`,
)

const plannedStageIds = stageFramePlan.map((plan) => plan.stageId)
const attachedStageIds = new Set(
  frames.map((frame) => frame.stageHint).filter(Boolean),
)
const missingPlannedStages = plannedStageIds.filter(
  (stageId) => !attachedStageIds.has(stageId),
)

addCheck(
  'planned-stage-coverage',
  stageFramePlan.length === 0
    ? 'warn'
    : missingPlannedStages.length === 0
      ? 'pass'
      : frames.length === 0
        ? 'pending'
        : 'fail',
  stageFramePlan.length === 0
    ? 'No stage frame plan declared.'
    : missingPlannedStages.length === 0
      ? 'Every planned stage has an attached frame.'
      : `Missing planned stage mappings: ${missingPlannedStages.join(', ')}`,
)

const failures = checks.filter((check) => check.status === 'fail')
const pending = checks.filter((check) => check.status === 'pending')

const status =
  failures.length > 0
    ? 'not-ready'
    : pending.length > 0
      ? 'pending'
      : 'ready'

const report = {
  generatedAt: new Date().toISOString(),
  input,
  fixtureId: fixture.id ?? null,
  fixtureStatus: fixture.status ?? null,
  status,
  frameCount: frames.length,
  plannedStageCount: stageFramePlan.length,
  attachedStageCount: attachedStageIds.size,
  checks,
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')

console.log(`🚦 Capture fixture readiness: ${status.toUpperCase()}`)
for (const check of checks) {
  const icon =
    check.status === 'pass'
      ? '✅'
      : check.status === 'warn'
        ? '⚠️'
        : check.status === 'pending'
          ? '⏳'
          : '❌'
  console.log(`${icon} ${check.id}: ${check.message}`)
}
console.log(`📄 report: ${reportPath}`)

if (failures.length > 0) process.exit(1)
if (pending.length > 0 && !allowPending) process.exit(2)
