import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

describe('release readiness snapshot', () => {
  it('reflects the current release state with attached real fixtures', () => {
    const script = 'scripts/release-readiness.mjs'

    expect(existsSync(script)).toBe(true)

    execFileSync('node', [script], { stdio: 'pipe' })

    const report = readFileSync('reports/release-readiness.md', 'utf8')

    expect(report).toContain('Attached real fixtures: 2')
    expect(report).toContain('Visual snapshots: yes')
    expect(report).toContain('None detected.')
    expect(report).toContain('The project has at least one attached real capture fixture.')
  })
})
