import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
describe('GitHub Actions CI workflow', () => {
  it('runs the Packet Atlas quality checks', () => {
    expect(existsSync('.github/workflows/quality.yml')).toBe(true)
    const workflow = readFileSync('.github/workflows/quality.yml', 'utf8')
    expect(workflow).toContain('npm run build')
    expect(workflow).toContain('npm test')
    expect(workflow).toContain('npm run e2e')
  })
})
