import { describe, expect, it } from 'vitest'
import manifest from '../../src/features/packet-atlas/scenarios/httpsExample.manifest.v2.json'
import { ScenarioManifestV2Schema } from '../../src/features/packet-atlas/schema/scenarioManifestV2'

describe('scenario manifest v2', () => {
  it('validates the baseline HTTPS manifest', () => {
    const result = ScenarioManifestV2Schema.safeParse(manifest)
    expect(result.success).toBe(true)
  })
})
