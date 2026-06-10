import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

describe('guided scenario reports', () => {
  it('generates scenario and quality reports', () => {
    execFileSync('node', ['scripts/project/guided-scenario-packs.mjs'], { stdio: 'pipe' })
    execFileSync('node', ['scripts/project/guided-scenario-quality.mjs'], { stdio: 'pipe' })

    expect(existsSync('reports/guided-scenario-packs.md')).toBe(true)
    expect(existsSync('reports/guided-scenario-quality.md')).toBe(true)

    const packs = readFileSync('reports/guided-scenario-packs.md', 'utf8')
    const quality = readFileSync('reports/guided-scenario-quality.md', 'utf8')

    expect(packs).toContain('DNS failure')
    expect(packs).toContain('TLS failure')
    expect(quality).toContain('Status: READY')
  })
})
