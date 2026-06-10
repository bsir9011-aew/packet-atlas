import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided scenario runtime docs', () => {
  it('documents runtime cards and future UI bridge', () => {
    const file = 'docs/project/guided-scenario-runtime-pack.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('Runtime cards')
    expect(text).toContain('story:runtime')
    expect(text).toContain('story:all')
    expect(text.toLowerCase()).toContain('future ui bridge')
  })
})
