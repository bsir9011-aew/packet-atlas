import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('project documentation', () => {
  it('documents the real capture foundation and portfolio brief', () => {
    const files = [
      'README.md',
      'docs/project/architecture-overview.md',
      'docs/captures/real-capture-foundation.md',
      'docs/portfolio/packet-atlas-project-brief.md',
    ]

    for (const file of files) {
      expect(existsSync(file)).toBe(true)
    }

    expect(readFileSync('README.md', 'utf8')).toContain('One journey, many lenses')
    expect(readFileSync('docs/captures/real-capture-foundation.md', 'utf8')).toContain('HTTPS = envelope visible')
    expect(readFileSync('docs/portfolio/packet-atlas-project-brief.md', 'utf8')).toContain('portfolio')
  })

  it('provides a project summary generator', () => {
    const script = 'scripts/project/build-project-summary.mjs'
    expect(existsSync(script)).toBe(true)

    const text = readFileSync(script, 'utf8')
    expect(text).toContain('https-basic.real.fixture.json')
    expect(text).toContain('http-local.real.fixture.json')
    expect(text).toContain('project summary written')
  })
})
