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

  const currentIndex = Math.max(
    0,
    scenario.stages.findIndex((stage) => stage.id === selectedStageId),
  )
  const currentStage = scenario.stages[currentIndex] ?? scenario.stages[0]
  const progress =
    scenario.stages.length <= 1
      ? 100
      : Math.round((currentIndex / (scenario.stages.length - 1)) * 100)

  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < scenario.stages.length - 1

  function goToIndex(index: number) {
    const nextStage = scenario.stages[index]
    if (nextStage) setSelectedStageId(nextStage.id)
  }

  return (
    <section className="journey-controls" aria-label="Journey controls">
      <div className="journey-controls__main">
        <button
          className="journey-nav-button"
          type="button"
          disabled={!canGoPrevious}
          onClick={() => goToIndex(currentIndex - 1)}
        >
          ← Previous
        </button>

        <div className="journey-current-card">
          <div className="journey-current-card__topline">
            <span>
              Stage {currentIndex + 1} / {scenario.stages.length}
            </span>
            <span>{directionIcon[currentStage.direction]} {currentStage.direction}</span>
          </div>
          <strong>{currentStage.shortName}</strong>
          <p>{currentStage.copy.samePayloadHereLooksLike}</p>
        </div>

        <button
          className="journey-nav-button journey-nav-button--primary"
          type="button"
          disabled={!canGoNext}
          onClick={() => goToIndex(currentIndex + 1)}
        >
          Next →
        </button>
      </div>

      <div className="journey-progress" aria-label={`Journey progress ${progress}%`}>
        <div className="journey-progress__track">
          <div className="journey-progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <span>{progress}%</span>
      </div>

      <div className="journey-dots" aria-label="Jump to stage">
        {scenario.stages.map((stage, index) => (
          <button
            key={stage.id}
            type="button"
            className={
              index === currentIndex
                ? 'journey-dot journey-dot--active'
                : 'journey-dot'
            }
            title={`${index + 1}. ${stage.shortName}`}
            aria-label={`Go to stage ${index + 1}: ${stage.shortName}`}
            onClick={() => goToIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  )
}
