import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('coach-only guided reading docs', () => {
  it('documents Focus Mode as a coach-only reading experience', () => {
    const file = 'docs/project/coach-only-guided-reading.md'

    expect(existsSync(file)).toBe(true)

    const text = readFileSync(file, 'utf8')
    expect(text).toContain('Coach-only Focus Mode')
    expect(text).toContain('There are no progress widgets')
    expect(text).toContain('read this step')
    expect(text).toContain('Not like this')
  })
})
