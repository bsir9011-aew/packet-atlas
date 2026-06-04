import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getTransformMode, getTransformSteps } from '../../src/features/packet-atlas/encapsulation/encapsulationTransformModel'
describe('encapsulation transform model', () => {
  it('wraps request stages downward', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='http-request')!; expect(getTransformMode(stage)).toBe('wrap'); expect(getTransformSteps(stage)[0].id).toBe('human') })
  it('unwraps response stages upward', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='http-response')!; expect(getTransformMode(stage)).toBe('unwrap'); expect(getTransformSteps(stage)[0].id).toBe('physical') })
})
