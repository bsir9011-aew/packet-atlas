import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided story layer docs', () => {
  it('documents story guidance without dashboard metrics', () => {
    const file = 'docs/project/guided-story-layer-pack.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('Story script')
    expect(text).toContain('Evidence question')
    expect(text).toContain('Vocabulary helper')
    expect(text).toContain('not a metric dashboard')
  })
})
