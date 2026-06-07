import realPlaceholder from '../../../data/fixtures/https-basic.real.fixture.placeholder.json'
import {
  getFixtureForStage,
  summarizeRealCaptureFixture,
  type CaptureFrameFixture,
} from '../captures/captureFixtureModel'
import type { JourneyStage } from '../schema/journeyScenarioSchema'

type RealCaptureStagePlan = {
  stageId: string
  expectedFrameKind: string
  requiredLayers?: string[]
}

type RealCaptureFixtureLike = {
  id: string
  source?: string
  status?: string
  kind?: string
  note?: string
  stageFramePlan?: RealCaptureStagePlan[]
}

const realCapturePlaceholder = realPlaceholder as RealCaptureFixtureLike

export type CaptureInspectorProjection = {
  mode: 'verified-real' | 'synthetic' | 'real-placeholder' | 'missing'
  fixtureId?: string
  source?: string
  note?: string
  frame?: CaptureFrameFixture
  stageId: string
  summary: string
}

export function getCaptureProjectionForStage(
  stage: JourneyStage,
): CaptureInspectorProjection {
  const fixture = getFixtureForStage(stage.id)
  const realSummary = summarizeRealCaptureFixture()

  if (fixture) {
    const mode = fixture.isReal ? 'verified-real' : 'synthetic'

    return {
      mode,
      fixtureId: fixture.fixtureId,
      source: fixture.source,
      note: fixture.isReal
        ? `Real capture attached: ${realSummary.frameCount} redacted frames, ${realSummary.stageCount} mapped stage groups.`
        : 'Synthetic fixture fallback.',
      frame: fixture,
      stageId: stage.id,
      summary: fixture.isReal
        ? `Verified real capture frame ${fixture.frameNumber} is attached to ${stage.shortName}.`
        : `Synthetic fixture frame ${fixture.frameNumber} is attached to ${stage.shortName}.`,
    }
  }

  const realPlan = realCapturePlaceholder.stageFramePlan?.find(
    (plan) => plan.stageId === stage.id,
  )

  if (realPlan) {
    return {
      mode: 'real-placeholder',
      fixtureId: realCapturePlaceholder.id,
      source: 'pending real capture',
      note: realCapturePlaceholder.note,
      stageId: stage.id,
      summary: `Real capture is planned for ${stage.shortName}: ${realPlan.expectedFrameKind}.`,
    }
  }

  return {
    mode: 'missing',
    stageId: stage.id,
    summary: `No capture projection is attached to ${stage.shortName} yet.`,
  }
}
