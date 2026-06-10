import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

describe('guided scenario runtime reports', () => {
  it('generates runtime and full story reports', () => {
    execFileSync('node', ['scripts/project/guided-scenario-runtime.mjs'], {
      stdio: 'pipe',
    })
    execFileSync('node', ['scripts/project/guided-story-all.mjs'], {
      stdio: 'pipe',
    })

    expect(existsSync('reports/guided-scenario-runtime.md')).toBe(true)
    expect(existsSync('reports/guided-journey-script.md')).toBe(true)
    expect(existsSync('reports/guided-story-quality.md')).toBe(true)
    expect(existsSync('reports/guided-scenario-packs.md')).toBe(true)
    expect(existsSync('reports/guided-scenario-quality.md')).toBe(true)

    const runtime = readFileSync('reports/guided-scenario-runtime.md', 'utf8')
    expect(runtime).toContain('Default scenario: HTTPS happy path')
    expect(runtime).toContain('Choose a scenario')
  })
})
