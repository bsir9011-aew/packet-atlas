import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided scenario selector docs', () => {
  it('documents symptom-first scenario selector UI without dashboard drift', () => {
    const file = 'docs/project/guided-scenario-selector-ui-pack.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('Scenario selector')
    expect(text).toContain('Symptom-first cards')
    expect(text).toContain('not a dashboard')
    expect(text).toContain('Which story path')
  })
})
