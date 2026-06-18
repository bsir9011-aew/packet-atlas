import {
  getNextStageId,
  getPreviousStageId,
  getStageIndex,
  getTraceProgress,
} from '../cinematic/cinematicTraceModel'
import {
  getScenarioTranslation,
  translateAtlasUi,
  translateLayerLabel,
  translateMotionExplanation,
  translateMotionLabel,
  translateScenarioText,
} from '../i18n/atlasI18n'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
  playing: boolean
}

function findStage(scenario: JourneyScenario, stageId: string) {
  return scenario.stages.find((candidate) => candidate.id === stageId)
}

export function PlayMotionLayer({ scenario, stage, playing }: Props) {
  const language = useAtlasStore((state) => state.language)
  const textDisplayMode = useAtlasStore((state) => state.textDisplayMode)
  const index = getStageIndex(scenario, stage.id)
  const progress = getTraceProgress(scenario, stage.id)
  const previousStage = findStage(scenario, getPreviousStageId(scenario, stage.id)) ?? stage
  const nextStage = findStage(scenario, getNextStageId(scenario, stage.id)) ?? stage
  const layerFocus = stage.layerFocus.length > 0 ? stage.layerFocus : [stage.stageKind]
  const isFirst = previousStage.id === stage.id
  const isLast = nextStage.id === stage.id
  const currentStageName = getScenarioTranslation(language, stage.shortName, textDisplayMode)

  return (
    <section
      key={stage.id}
      className="play-motion-layer"
      data-direction={stage.direction}
      data-playing={playing}
      aria-label={translateAtlasUi(language, 'motion.ariaLabel')}
    >
      <div className="play-motion-layer__header">
        <div>
          <span>{translateAtlasUi(language, 'motion.animatedHandoff')}</span>
          <strong>{translateMotionLabel(language, stage.direction)}</strong>
        </div>
        <small>
          {translateAtlasUi(language, 'play.step')} {index + 1}/
          {scenario.stages.length} · {progress}%
        </small>
      </div>

      <div className="play-motion-stage">
        <article className="play-motion-node" data-muted={isFirst}>
          <span>{translateAtlasUi(language, 'play.before')}</span>
          <strong>
            {isFirst
              ? translateAtlasUi(language, 'motion.beforeStart')
              : translateScenarioText(language, previousStage.shortName)}
          </strong>
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
          <span>{translateAtlasUi(language, 'play.now')}</span>
          <strong>{currentStageName.primary}</strong>
          {currentStageName.secondary ? (
            <small className="play-motion-node__secondary">
              EN: {currentStageName.secondary}
            </small>
          ) : null}
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
          <span>{translateAtlasUi(language, 'play.next')}</span>
          <strong>
            {isLast
              ? translateAtlasUi(language, 'motion.journeyEnd')
              : translateScenarioText(language, nextStage.shortName)}
          </strong>
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
          <span>{translateAtlasUi(language, 'motion.whatWatching')}</span>
          <p>{translateMotionExplanation(language, stage.direction)}</p>
        </div>

        <div
          className="play-motion-layers"
          aria-label={translateAtlasUi(language, 'motion.layerFocus')}
        >
          {layerFocus.map((layer) => (
            <span key={layer}>{translateLayerLabel(language, layer)}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
