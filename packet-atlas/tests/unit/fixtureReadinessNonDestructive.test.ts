import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('fixture readiness is non-destructive', () => {
  it('requires explicit --report and refuses fixture-directory report output', () => {
    const script = 'scripts/captures/fixture-readiness.mjs'
    expect(existsSync(script)).toBe(true)

    const text = readFileSync(script, 'utf8')
    expect(text).toContain("readArg('--report'")
    expect(text).toContain('Refusing to write readiness report inside fixture directory')
    expect(text).toContain('positional[0]')
  })
})
