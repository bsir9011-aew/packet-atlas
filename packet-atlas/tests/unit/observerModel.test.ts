import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getObserverStageIds, stageMatchesObserver } from '../../src/features/packet-atlas/observer/observerModel'
describe('observer model', () => {
  it('shows user stages for the user observer', () => { const ids=getObserverStageIds(httpsExampleScenario,'user'); expect(ids).toContain('url-intent'); expect(ids).toContain('browser-render') })
  it('does not treat switches as HTTP observers', () => { const httpStage=httpsExampleScenario.stages.find(s=>s.id==='http-request')!; expect(stageMatchesObserver(httpStage,'switch')).toBe(false) })
})
