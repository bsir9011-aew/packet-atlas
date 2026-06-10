import { describe, expect, it } from 'vitest'
import {
  buildGuidedScenarioPacks,
  renderGuidedScenarioPacksMarkdown,
} from '../../src/features/packet-atlas/guide/guidedScenarioPackModel'

describe('guided scenario packs', () => {
  it('defines happy path and key failure paths', () => {
    const packs = buildGuidedScenarioPacks()

    expect(packs.some((pack) => pack.id === 'https-happy-path')).toBe(true)
    expect(packs.some((pack) => pack.id === 'dns-failure')).toBe(true)
    expect(packs.some((pack) => pack.id === 'tcp-blocked')).toBe(true)
    expect(packs.some((pack) => pack.id === 'tls-failure')).toBe(true)
    expect(packs.some((pack) => pack.id === 'http-application-error')).toBe(true)
  })

  it('gives every step evidence and a do-not-jump guard', () => {
    for (const pack of buildGuidedScenarioPacks()) {
      expect(pack.userSymptom.length).toBeGreaterThan(20)
      expect(pack.firstQuestion).toContain('?')
      expect(pack.finalNotebookLine.length).toBeGreaterThan(24)
      for (const step of pack.steps) {
        expect(step.evidence.length).toBeGreaterThan(0)
        expect(step.doNotJumpTo.length).toBeGreaterThan(12)
        expect(step.notebook.length).toBeGreaterThan(12)
      }
    }
  })

  it('renders scenario packs to markdown', () => {
    const markdown = renderGuidedScenarioPacksMarkdown(buildGuidedScenarioPacks())

    expect(markdown).toContain('Packet Atlas Guided Scenario Packs')
    expect(markdown).toContain('DNS failure')
    expect(markdown).toContain('Evidence')
    expect(markdown).toContain('Final notebook line')
  })
})
