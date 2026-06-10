import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided scenario reader docs', () => {
  it('documents one-step manual scenario reading', () => {
    const file = 'docs/project/guided-scenario-reader-ui-pack.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('One-step scenario reader')
    expect(text).toContain('Evidence checklist')
    expect(text).toContain('Do-not-jump guard')
    expect(text).toContain('manual-first')
  })
})
