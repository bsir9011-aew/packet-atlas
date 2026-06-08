import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('visual CI helper scripts', () => {
  it('provides clean and guard scripts for visual baseline workflow', () => {
    expect(existsSync('scripts/visual/clean-visual-artifacts.mjs')).toBe(true)
    expect(existsSync('scripts/visual/visual-baseline-guard.mjs')).toBe(true)

    const guard = readFileSync('scripts/visual/visual-baseline-guard.mjs', 'utf8')
    expect(guard).toContain('git status')
    expect(guard).toContain('tests/visual')
    expect(guard).toContain('Do not commit playwright-report')
  })
})
