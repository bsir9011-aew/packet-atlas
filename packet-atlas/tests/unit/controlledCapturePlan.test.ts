import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('controlled capture plan', () => {
  it('generates a plan rather than starting capture', () => {
    const script = 'scripts/captures/create-controlled-capture-plan.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('recommendedCaptureFilter')
    expect(text).toContain('Review interface, authorization and assumptions')
  })
})
