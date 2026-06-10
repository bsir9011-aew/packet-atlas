import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided scenario authoring docs', () => {
  it('documents symptom-first failure scenario authoring', () => {
    const file = 'docs/project/guided-scenario-authoring-pack.md'
    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('symptom -> first question')
    expect(text).toContain('story:scenarios')
    expect(text).toContain('story:scenario:quality')
  })
})
