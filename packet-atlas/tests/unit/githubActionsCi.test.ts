import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('GitHub Actions CI workflow', () => {
  it('uses the repository-root workflow with the packet-atlas working directory', () => {
    const workflowPath = '../.github/workflows/quality.yml'

    expect(existsSync(workflowPath)).toBe(true)

    const workflow = readFileSync(workflowPath, 'utf8')

    expect(workflow).toContain('working-directory: packet-atlas')
    expect(workflow).toContain(
      'cache-dependency-path: packet-atlas/package-lock.json',
    )
    expect(workflow).toContain('npm run verify:full')
    expect(workflow).toContain('playwright-report')
  })
})
