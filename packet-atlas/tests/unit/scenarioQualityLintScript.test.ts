import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('scenario quality linter script', () => {
  it('exists and checks protocol ordering', () => {
    expect(existsSync('scripts/scenario-quality-lint.mjs')).toBe(true)
    const script = readFileSync('scripts/scenario-quality-lint.mjs', 'utf8')
    expect(script).toContain('DNS should happen before TCP')
    expect(script).toContain('TLS should happen before HTTP request')
    expect(script).toContain('scenario quality ok')
  })
})
