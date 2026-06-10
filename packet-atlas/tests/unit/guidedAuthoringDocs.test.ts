import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided authoring docs', () => {
  it('documents story-first authoring rules', () => {
    const file = 'docs/project/guided-authoring-pack.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('story first, panels second')
    expect(text).toContain('story:guided')
    expect(text).toContain('story:quality')
  })
})
