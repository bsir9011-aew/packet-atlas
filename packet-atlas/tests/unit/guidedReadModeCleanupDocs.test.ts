import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('guided read mode cleanup docs', () => {
  it('documents the coach as the primary focus-mode reading path', () => {
    const file = 'docs/project/guided-read-mode-cleanup.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('Guided Step Coach becomes the primary reading block')
    expect(text).toContain('real clickable Next action')
    expect(text).toContain('Atlas Mode can still show the full workshop')
  })
})
