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
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  return (
    <aside className="route-timeline route-timeline--v06">
      <div className="panel-heading">
        <span>Route Timeline</span>
        <small>
          {scenario.stages.length} stages · {selectedLayerLens} lens
        </small>
      </div>

      <div className="timeline-list">
        {scenario.stages.map((stage, index) => {
          const isActive = stage.id === selectedStageId
          const lensMatch = stage.layerFocus.includes(selectedLayerLens)

          return (
            <button
              key={stage.id}
              className={[
                'timeline-item',
                isActive ? 'timeline-item--active' : '',
                lensMatch ? 'timeline-item--lens-match' : 'timeline-item--lens-dim',
              ]
                .filter(Boolean)
                .join(' ')}
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
                <em>{lensMatch ? 'visible in active lens' : 'outside active lens'}</em>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
