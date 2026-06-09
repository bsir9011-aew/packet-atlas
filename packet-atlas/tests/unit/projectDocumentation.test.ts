import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

function readJson(file: string) {
  return JSON.parse(readFileSync(file, 'utf8')) as {
    version: string
    scripts: Record<string, string>
  }
}

describe('project documentation', () => {
  it('documents the atlas scope, portfolio brief and release checkpoint commands', () => {
    const files = [
      'README.md',
      'docs/project/architecture-overview.md',
      'docs/captures/real-capture-foundation.md',
      'docs/portfolio/packet-atlas-project-brief.md',
      'docs/release-readiness.md',
    ]

    for (const file of files) {
      expect(existsSync(file)).toBe(true)
    }

    const readme = readFileSync('README.md', 'utf8')
    const portfolio = readFileSync('docs/portfolio/packet-atlas-project-brief.md', 'utf8')
    const releaseDoc = readFileSync('docs/release-readiness.md', 'utf8')

    expect(readme).toContain('One journey, many lenses')
    expect(readme).toContain('status:checkpoint')
    expect(portfolio).toContain('Animated Journey Mode')
    expect(readFileSync('docs/captures/real-capture-foundation.md', 'utf8')).toContain('HTTPS = envelope visible')
    expect(releaseDoc).toContain('reports/release-readiness.md')
  })

  it('provides a current project summary generator', () => {
    const pkg = readJson('package.json')
    const script = 'scripts/project/build-project-summary.mjs'

    expect(existsSync(script)).toBe(true)
    expect(pkg.scripts['project:summary']).toBeDefined()
    expect(pkg.scripts['status:checkpoint']).toBeDefined()

    execFileSync('node', [script], { stdio: 'pipe' })

    const report = readFileSync('reports/project-summary.md', 'utf8')

    expect(report).toContain(`Packet Atlas ${pkg.version} — Project Status`)
    expect(report).toContain('HTTP vs HTTPS contrast workspace')
    expect(report).toContain('Animated Journey Mode')
    expect(report).toContain('Technical talk track')
  })
})
