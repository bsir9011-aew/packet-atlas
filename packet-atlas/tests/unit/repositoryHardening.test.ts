import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('v5.7 repository hardening', () => {
  it('keeps CI workflow at the repository root and uses packet-atlas working directory', () => {
    expect(existsSync('../.github/workflows/quality.yml')).toBe(true)
    const workflow = readFileSync('../.github/workflows/quality.yml', 'utf8')
    expect(workflow).toContain('working-directory: packet-atlas')
    expect(workflow).toContain('cache-dependency-path: packet-atlas/package-lock.json')
    expect(workflow).toContain('npm run verify:full')
  })

  it('ignores local patch installers and generated backups', () => {
    const gitignore = readFileSync('.gitignore', 'utf8')
    expect(gitignore).toContain('apply-v*.sh')
    expect(gitignore).toContain('patches/backups/')
    expect(gitignore).toContain('*.mapping.json')
  })

  it('removes the rejected learning-mode component', () => {
    expect(existsSync('src/features/packet-atlas/learning/ScenarioLearningPanel.tsx')).toBe(false)
  })
})
