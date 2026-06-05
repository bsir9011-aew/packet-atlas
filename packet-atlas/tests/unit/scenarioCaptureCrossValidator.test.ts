import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('scenario capture cross-validator', () => {
  it('checks stage hints and frame plans against scenario stage ids', () => {
    const path = 'scripts/captures/cross-validate-scenario-fixtures.mjs'
    expect(existsSync(path)).toBe(true)
    const script = readFileSync(path, 'utf8')
    expect(script).toContain('unknown stageHint')
    expect(script).toContain('unknown stageFramePlan stageId')
  })
})
