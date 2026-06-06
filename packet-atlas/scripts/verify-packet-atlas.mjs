import { spawnSync } from 'node:child_process'

const mode = process.argv.includes('--full')
  ? 'full'
  : process.argv.includes('--e2e')
    ? 'e2e'
    : 'standard'

const steps = [
  ['ESLint', 'npm', ['run', 'lint']],
  ['Build', 'npm', ['run', 'build']],
  ['Bundle budget', 'npm', ['run', 'bundle:budget']],
  ['Unit tests', 'npm', ['test']],
  ['Project structure', 'npm', ['run', 'validate:project']],
  ['Atlas health', 'npm', ['run', 'atlas:health']],
  ['Scenario manifest v2', 'npm', ['run', 'scenario:manifest:validate']],
  ['Scenario quality', 'npm', ['run', 'scenario:lint']],
  ['Capture fixtures', 'npm', ['run', 'capture:validate']],
  ['Capture readiness', 'npm', ['run', 'capture:readiness']],
  ['Capture privacy audit', 'npm', ['run', 'capture:privacy:audit']],
  ['Scenario/capture cross-validation', 'npm', ['run', 'capture:cross-validate']],
  ['Component inventory', 'npm', ['run', 'component:inventory']],
  ['Hygiene audit', 'npm', ['run', 'hygiene:audit']],
]

if (mode === 'e2e' || mode === 'full') {
  steps.push(['Playwright E2E', 'npm', ['run', 'e2e']])
}

if (mode === 'full') {
  steps.push(['Visual regression', 'npm', ['run', 'visual:test']])
}

const results = []

console.log(`🧭 PACKET ATLAS VERIFICATION — ${mode.toUpperCase()}`)
console.log('')

for (const [label, command, args] of steps) {
  console.log(`▶ ${label}`)
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  const ok = result.status === 0
  results.push({ label, ok, status: result.status ?? 1 })

  if (!ok) {
    console.log('')
    console.error(`❌ ${label} failed`)
    break
  }

  console.log(`✅ ${label}`)
  console.log('')
}

console.log('────────────────────────────')
console.log('Verification summary')
for (const item of results) {
  console.log(`${item.ok ? '✅' : '❌'} ${item.label}`)
}

const failed = results.find((item) => !item.ok)
if (failed) {
  console.log('')
  console.error('RESULT: UNHEALTHY')
  process.exit(failed.status || 1)
}

console.log('')
console.log(
  mode === 'full'
    ? 'RESULT: HEALTHY — FULL'
    : mode === 'e2e'
      ? 'RESULT: HEALTHY — E2E'
      : 'RESULT: HEALTHY',
)
