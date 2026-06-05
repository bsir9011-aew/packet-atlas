import { spawnSync } from 'node:child_process'
const steps = [
  ['Build', 'npm', ['run', 'build']],
  ['Unit tests', 'npm', ['test']],
  ['Scenario quality', 'npm', ['run', 'scenario:lint']],
  ['Capture fixtures', 'npm', ['run', 'capture:validate']],
  ['Scenario/capture cross-validation', 'npm', ['run', 'capture:cross-validate']],
  ['Component inventory', 'npm', ['run', 'component:inventory']],
  ['Hygiene audit', 'npm', ['run', 'hygiene:audit']],
]
const includeE2E = process.argv.includes('--e2e') || process.env.PACKET_ATLAS_E2E === '1'
if (includeE2E) steps.push(['Playwright E2E', 'npm', ['run', 'e2e']])
const results = []
console.log('🧭 PACKET ATLAS VERIFICATION\n')
for (const [label, command, args] of steps) {
  console.log(`▶ ${label}`)
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' })
  const ok = result.status === 0
  results.push({ label, ok, status: result.status ?? 1 })
  if (!ok) { console.error(`❌ ${label} failed`); break }
  console.log(`✅ ${label}\n`)
}
console.log('────────────────────────────')
console.log('Verification summary')
for (const item of results) console.log(`${item.ok ? '✅' : '❌'} ${item.label}`)
const failed = results.find((item) => !item.ok)
if (failed) { console.error('\nRESULT: UNHEALTHY'); process.exit(failed.status || 1) }
console.log(includeE2E ? '\nRESULT: HEALTHY WITH E2E' : '\nRESULT: HEALTHY')
