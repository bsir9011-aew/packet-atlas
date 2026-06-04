import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildFieldFacts, summarizeFieldCoverage } from '../../src/features/packet-atlas/fields/fieldFacts'

describe('field facts', () => {
  it('builds at least one field fact for every stage', () => {
    for (const stage of httpsExampleScenario.stages) {
      expect(buildFieldFacts(stage).length).toBeGreaterThan(0)
    }
  })

  it('explains NAT when NAT fields exist', () => {
    const natStage = httpsExampleScenario.stages.find((stage) => stage.id === 'router-nat-dns')
    expect(natStage).toBeTruthy()

    const facts = buildFieldFacts(natStage!)
    expect(facts.some((fact) => fact.name.toLowerCase().includes('nat'))).toBe(true)
    expect(facts.some((fact) => String(fact.value).includes('198.51.100.2'))).toBe(true)
  })

  it('has broad coverage across multiple lenses', () => {
    const coverage = summarizeFieldCoverage(httpsExampleScenario.stages)
    expect(coverage.get('application')).toBeGreaterThan(0)
    expect(coverage.get('transport')).toBeGreaterThan(0)
    expect(coverage.get('network')).toBeGreaterThan(0)
    expect(coverage.get('link')).toBeGreaterThan(0)
  })
})
