import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('project metadata', () => {
  it('has roadmap and changelog documents', () => {
    expect(fs.existsSync('README.md')).toBe(true)
    expect(fs.existsSync('CHANGELOG.md')).toBe(true)
    expect(fs.existsSync('ROADMAP.md')).toBe(true)
  })

  it('keeps Packet Atlas scoped as an atlas', () => {
    const readme = fs.readFileSync('README.md', 'utf8')
    expect(readme).toContain('one journey')
    expect(readme).toContain('not a course platform')
  })
})
