import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('presentation focus mode documentation', () => {
  it('documents focus mode as a calmer atlas view, not a course mode', () => {
    const file = 'docs/project/presentation-focus-mode.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')

    expect(text).toContain('Focus Mode')
    expect(text).toContain('same atlas')
    expect(text).toContain('not a quiz')
    expect(text).toContain('Guide me through the journey')
  })
})
