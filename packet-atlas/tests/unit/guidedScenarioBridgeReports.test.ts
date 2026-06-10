import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

describe('guided scenario bridge reports', () => {
  it('generates bridge and readiness reports', () => {
    execFileSync('node', ['scripts/project/guided-scenario-bridge.mjs'], {
      stdio: 'pipe',
    })
    execFileSync('node', ['scripts/project/guided-scenario-bridge-readiness.mjs'], {
      stdio: 'pipe',
    })

    expect(existsSync('reports/guided-scenario-bridge.md')).toBe(true)
    expect(existsSync('reports/guided-scenario-bridge-readiness.md')).toBe(true)

    const bridge = readFileSync('reports/guided-scenario-bridge.md', 'utf8')
    const readiness = readFileSync('reports/guided-scenario-bridge-readiness.md', 'utf8')

    expect(bridge).toContain('Guided Scenario Bridge')
    expect(bridge).toContain('HTTP/application error')
    expect(readiness).toContain('Status: READY')
  })

  it('runs the full story report pipeline', () => {
    execFileSync('node', ['scripts/project/guided-story-all.mjs'], {
      stdio: 'pipe',
    })

    expect(existsSync('reports/guided-scenario-bridge-readiness.md')).toBe(true)
  })
})
