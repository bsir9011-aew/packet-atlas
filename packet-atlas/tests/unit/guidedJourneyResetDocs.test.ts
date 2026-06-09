import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided journey reset docs', () => {
  it('documents manual-first guided journey behavior', () => {
    const file = 'docs/project/guided-journey-reset.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('read current step -> press Next')
    expect(text).toContain('Auto-play is slower')
    expect(text).toContain('guided story')
  })
})
