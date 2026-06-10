import { execFileSync } from 'node:child_process'

const commands = [
  ['node', ['scripts/project/guided-journey-script.mjs']],
  ['node', ['scripts/project/guided-story-quality.mjs']],
  ['node', ['scripts/project/guided-scenario-packs.mjs']],
  ['node', ['scripts/project/guided-scenario-quality.mjs']],
  ['node', ['scripts/project/guided-scenario-runtime.mjs']],
  ['node', ['scripts/project/guided-scenario-bridge.mjs']],
  ['node', ['scripts/project/guided-scenario-bridge-readiness.mjs']],
]

for (const [cmd, args] of commands) {
  execFileSync(cmd, args, { stdio: 'inherit' })
}

console.log('✅ Guided story reports completed.')
