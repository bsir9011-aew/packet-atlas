import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  scenario: JourneyScenario
}

const directionIcon = {
  request: '➡️',
  response: '⬅️',
  internal: '🔁',
}

export function JourneyControls({ scenario }: Props) {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  const activeIndex = Math.max(
    scenario.stages.findIndex((stage) => stage.id === selectedStageId),
    0,
  )
  const activeStage = scenario.stages[activeIndex]
  const previousStage = scenario.stages[activeIndex - 1]
  const nextStage = scenario.stages[activeIndex + 1]
  const progress = ((activeIndex + 1) / scenario.stages.length) * 100

  return (
    <section className="journey-controls" aria-label="Journey controls">
      <div className="journey-controls__main">
        <button
          className="journey-button"
          type="button"
          disabled={!previousStage}
          onClick={() => previousStage && setSelectedStageId(previousStage.id)}
        >
          ← Previous
        </button>

        <div className="journey-status">
          <div className="journey-status__top">
            <span>
              Stage {activeIndex + 1} / {scenario.stages.length}
            </span>
            <strong>
              {directionIcon[activeStage.direction]} {activeStage.shortName}
            </strong>
          </div>
          <div className="journey-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button
          className="journey-button journey-button--primary"
          type="button"
          disabled={!nextStage}
          onClick={() => nextStage && setSelectedStageId(nextStage.id)}
        >
          Next →
        </button>
      </div>

      <div className="journey-rail" aria-label="Quick stage selector">
        {scenario.stages.map((stage, index) => (
          <button
            key={stage.id}
            type="button"
            className={
              stage.id === selectedStageId
                ? 'journey-dot journey-dot--active'
                : 'journey-dot'
            }
            title={`${index + 1}. ${stage.shortName}`}
            aria-label={`Go to stage ${index + 1}: ${stage.shortName}`}
            onClick={() => setSelectedStageId(stage.id)}
          >
            <span>{index + 1}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
