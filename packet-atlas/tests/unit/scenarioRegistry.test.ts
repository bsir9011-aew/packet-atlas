import { describe, expect, it } from 'vitest'
import { getScenarioById, scenarioRegistry, validateScenarioRegistry } from '../../src/features/packet-atlas/scenarios/scenarioRegistry'

describe('scenario registry', () => {
  it('contains the HTTPS baseline scenario', () => {
    expect(scenarioRegistry.some((item) => item.id === 'https-example-basic')).toBe(true)
    expect(getScenarioById('https-example-basic').stages.length).toBeGreaterThan(5)
  })
  it('summarizes registry health', () => {
    const summary = validateScenarioRegistry()
    expect(summary.total).toBeGreaterThanOrEqual(1)
    expect(summary.ready).toBeGreaterThanOrEqual(1)
  })
})
