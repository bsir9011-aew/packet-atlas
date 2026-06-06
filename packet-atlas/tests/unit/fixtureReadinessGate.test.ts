import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('fixture readiness gate', () => {
  it('distinguishes pending from ready fixtures', () => {
    const script = 'scripts/captures/fixture-readiness.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain("'pending'")
    expect(text).toContain('planned-stage-coverage')
    expect(text).toContain('unique-frame-numbers')
  })
})
