import {
  getNextStageId,
  getPreviousStageId,
  getStageIndex,
  getTraceProgress,
} from '../cinematic/cinematicTraceModel'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
  playing: boolean
}

function findStage(scenario: JourneyScenario, stageId: string) {
  return scenario.stages.find((candidate) => candidate.id === stageId)
}

function getMotionLabel(stage: JourneyStage) {
  if (stage.direction === 'request') return 'Request moves forward'
  if (stage.direction === 'response') return 'Response travels back'
  return 'Boundary transition'
}

function getMotionVerb(stage: JourneyStage) {
  if (stage.direction === 'request') return 'leaves this boundary toward the next system'
  if (stage.direction === 'response') return 'returns through this boundary toward the browser'
  return 'changes form at this boundary'
}

export function PlayMotionLayer({ scenario, stage, playing }: Props) {
  const index = getStageIndex(scenario, stage.id)
  const progress = getTraceProgress(scenario, stage.id)
  const previousStage = findStage(scenario, getPreviousStageId(scenario, stage.id)) ?? stage
  const nextStage = findStage(scenario, getNextStageId(scenario, stage.id)) ?? stage
  const layerFocus = stage.layerFocus.length > 0 ? stage.layerFocus : [stage.stageKind]
  const isFirst = previousStage.id === stage.id
  const isLast = nextStage.id === stage.id

  return (
    <section
      key={stage.id}
      className="play-motion-layer"
      data-direction={stage.direction}
      data-playing={playing}
      aria-label="Animated packet handoff"
    >
      <div className="play-motion-layer__header">
        <div>
          <span>Animated handoff</span>
          <strong>{getMotionLabel(stage)}</strong>
        </div>
        <small>
          Step {index + 1}/{scenario.stages.length} · {progress}%
        </small>
      </div>

      <div className="play-motion-stage">
        <article className="play-motion-node" data-muted={isFirst}>
          <span>Before</span>
          <strong>{isFirst ? 'Start here' : previousStage.shortName}</strong>
        </article>

        <div className="play-motion-runway" aria-hidden="true">
          <span className="play-motion-line play-motion-line--left" />
          <span className="play-motion-packet">
            <i />
          </span>
          <span className="play-motion-pulse play-motion-pulse--one" />
          <span className="play-motion-pulse play-motion-pulse--two" />
          <span className="play-motion-pulse play-motion-pulse--three" />
          <span className="play-motion-line play-motion-line--right" />
        </div>

        <article className="play-motion-node play-motion-node--current">
          <span>Now</span>
          <strong>{stage.shortName}</strong>
        </article>

        <div className="play-motion-runway" aria-hidden="true">
          <span className="play-motion-line play-motion-line--left" />
          <span className="play-motion-packet play-motion-packet--delayed">
            <i />
          </span>
          <span className="play-motion-pulse play-motion-pulse--one" />
          <span className="play-motion-pulse play-motion-pulse--two" />
          <span className="play-motion-pulse play-motion-pulse--three" />
          <span className="play-motion-line play-motion-line--right" />
        </div>

        <article className="play-motion-node" data-muted={isLast}>
          <span>Next</span>
          <strong>{isLast ? 'Journey end' : nextStage.shortName}</strong>
        </article>
      </div>

      <div className="play-motion-transform">
        <div className="play-motion-transform__beam" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="play-motion-transform__copy">
          <span>What you are watching</span>
          <p>
            The current stage is not just text. The same journey {getMotionVerb(stage)}:
            it has a previous boundary, a current transformation and a next handoff.
          </p>
        </div>

        <div className="play-motion-layers" aria-label="Layer focus for this animation">
          {layerFocus.map((layer) => (
            <span key={layer}>{layer}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
