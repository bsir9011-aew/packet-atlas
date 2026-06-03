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

export function RouteTimeline({ scenario }: Props) {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  return (
    <aside className="route-timeline">
      <div className="panel-heading">
        <span>Route Timeline</span>
        <small>{scenario.stages.length} stages</small>
      </div>

      <div className="timeline-list">
        {scenario.stages.map((stage, index) => (
          <button
            key={stage.id}
            className={
              stage.id === selectedStageId
                ? 'timeline-item timeline-item--active'
                : 'timeline-item'
            }
            onClick={() => setSelectedStageId(stage.id)}
          >
            <span className="timeline-item__index">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="timeline-item__main">
              <strong>
                {directionIcon[stage.direction]} {stage.shortName}
              </strong>
              <small>{stage.copy.whichLayerLooksAtIt}</small>
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
