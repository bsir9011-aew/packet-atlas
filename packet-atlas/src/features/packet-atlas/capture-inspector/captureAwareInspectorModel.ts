import syntheticFixture from '../../../data/fixtures/https-example.synthetic.fixture.json'
import realPlaceholder from '../../../data/fixtures/https-basic.real.fixture.placeholder.json'
import type { JourneyStage } from '../schema/journeyScenarioSchema'

type FixtureFrame = {
  frameNumber: number
  timeRelative?: string | null
  protocolStack?: string[]
  summary?: Record<string, unknown>
  stageHint?: string
}

type FixtureLike = {
  id: string
  source?: string
  status?: string
  kind?: string
  note?: string
  frames?: FixtureFrame[]
}

const fixtures = [
  syntheticFixture as FixtureLike,
  realPlaceholder as FixtureLike,
]

export type CaptureInspectorProjection = {
  mode: 'synthetic' | 'real-placeholder' | 'missing'
  fixtureId?: string
  source?: string
  note?: string
  frame?: FixtureFrame
  stageId: string
  summary: string
}

export function getCaptureProjectionForStage(
  stage: JourneyStage,
): CaptureInspectorProjection {
  const syntheticFrame = fixtures
    .flatMap((fixture) =>
      (fixture.frames ?? []).map((frame) => ({ fixture, frame })),
    )
    .find(({ frame }) => frame.stageHint === stage.id)

  if (syntheticFrame) {
    return {
      mode: 'synthetic',
      fixtureId: syntheticFrame.fixture.id,
      source: syntheticFrame.fixture.source,
      note: syntheticFrame.fixture.note,
      frame: syntheticFrame.frame,
      stageId: stage.id,
      summary: `Synthetic fixture frame ${syntheticFrame.frame.frameNumber} is attached to ${stage.shortName}.`,
    }
  }

  const realPlan = (realPlaceholder as any).stageFramePlan?.find(
    (plan: { stageId: string }) => plan.stageId === stage.id,
  )

  if (realPlan) {
    return {
      mode: 'real-placeholder',
      fixtureId: (realPlaceholder as FixtureLike).id,
      source: 'pending real capture',
      note: (realPlaceholder as FixtureLike).note,
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
