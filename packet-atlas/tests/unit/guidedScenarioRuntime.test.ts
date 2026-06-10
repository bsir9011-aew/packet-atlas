import { describe, expect, it } from 'vitest'
import { buildGuidedScenarioPacks } from '../../src/features/packet-atlas/guide/guidedScenarioPackModel'
import {
  buildGuidedScenarioRuntime,
  buildGuidedScenarioRuntimeSteps,
  findGuidedScenarioPack,
  renderGuidedScenarioRuntimeMarkdown,
} from '../../src/features/packet-atlas/guide/guidedScenarioRuntimeModel'

describe('guided scenario runtime', () => {
  it('builds runtime cards from scenario packs', () => {
    const packs = buildGuidedScenarioPacks()
    const runtime = buildGuidedScenarioRuntime(packs)

    expect(runtime.defaultScenarioId).toBe('https-happy-path')
    expect(runtime.cards.length).toBe(packs.length)
    expect(runtime.cards.some((card) => card.scenarioId === 'dns-failure')).toBe(true)
    expect(runtime.cards.every((card) => card.firstQuestion.includes('?'))).toBe(true)
  })

  it('builds runtime reading steps for a failure scenario', () => {
    const packs = buildGuidedScenarioPacks()
    const dns = findGuidedScenarioPack(packs, 'dns-failure')

    expect(dns).toBeDefined()

    const steps = buildGuidedScenarioRuntimeSteps(dns!)
    expect(steps.length).toBeGreaterThan(1)
    expect(steps[0]?.askThis).toContain('?')
    expect(steps[0]?.evidenceChecklist.length).toBeGreaterThan(0)
    expect(steps[0]?.notebookLine.length).toBeGreaterThan(12)
    expect(steps.at(-1)?.nextAction).toContain('final notebook line')
  })

  it('renders runtime markdown', () => {
    const markdown = renderGuidedScenarioRuntimeMarkdown(buildGuidedScenarioPacks())

    expect(markdown).toContain('Packet Atlas Guided Scenario Runtime')
    expect(markdown).toContain('DNS failure')
    expect(markdown).toContain('Runtime rule')
  })
})
