import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided step coach docs', () => {
  it('documents one-step reading guidance', () => {
    const file = 'docs/project/guided-step-coach.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('Before -> Now -> Next')
    expect(text).toContain('not a quiz')
    expect(text).toContain('understand this step first')
  })
})
