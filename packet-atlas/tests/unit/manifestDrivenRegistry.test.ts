import { describe, expect, it } from 'vitest'
import { scenarioManifestRegistry } from '../../src/features/packet-atlas/scenarios/scenarioManifestRegistry'
import { scenarioRegistry } from '../../src/features/packet-atlas/scenarios/scenarioRegistry'

describe('manifest-driven scenario registry', () => {
  it('keeps one manifest for every registered scenario', () => {
    expect(scenarioManifestRegistry).toHaveLength(scenarioRegistry.length)
    expect(scenarioRegistry.map((item) => item.id)).toEqual(
      scenarioManifestRegistry.map((manifest) => manifest.id),
    )
  })

  it('includes both HTTPS and SSH manifests', () => {
    expect(scenarioManifestRegistry.some((item) => item.id === 'https-example-basic')).toBe(true)
    expect(scenarioManifestRegistry.some((item) => item.id === 'ssh-connection-basic')).toBe(true)
  })
})
