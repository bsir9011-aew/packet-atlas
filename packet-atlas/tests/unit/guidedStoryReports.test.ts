import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

describe('guided story report scripts', () => {
  it('generates guided story and quality reports', () => {
    execFileSync('node', ['scripts/project/guided-journey-script.mjs'], {
      stdio: 'pipe',
    })
    execFileSync('node', ['scripts/project/guided-story-quality.mjs'], {
      stdio: 'pipe',
    })

    expect(existsSync('reports/guided-journey-script.md')).toBe(true)
    expect(existsSync('reports/guided-story-quality.md')).toBe(true)

    const script = readFileSync('reports/guided-journey-script.md', 'utf8')
    const quality = readFileSync('reports/guided-story-quality.md', 'utf8')

    expect(script).toContain('One journey, many lenses')
    expect(script).toContain('Notebook')
    expect(quality).toContain('Status: READY')
  })
})
