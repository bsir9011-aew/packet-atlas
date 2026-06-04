import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import {
  actorMatchesLens,
  actorMatchesStage,
  getStageVisibilitySummary,
  visibilityActors,
} from './deviceVisibilityModel'

type Props = {
  scenario: JourneyScenario
}

export function DeviceVisibilityMatrix({ scenario }: Props) {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const activeStage =
    scenario.stages.find((stage) => stage.id === selectedStageId) ?? scenario.stages[0]

  return (
    <section className="device-visibility-matrix">
      <div className="panel-heading">
        <span>Device Visibility Matrix</span>
        <small>{activeStage.shortName}</small>
      </div>

      <div className="visibility-matrix__hero">
        <div>
          <p className="visibility-matrix__eyebrow">Who can see what?</p>
          <h3>{getStageVisibilitySummary(activeStage)}</h3>
          <p>
            This panel separates observer perspective from packet existence. A
            field can exist in the journey without being meaningful to every
            device on the path.
          </p>
        </div>
        <div className="visibility-matrix__badge">
          Active lens <b>{selectedLayerLens}</b>
        </div>
      </div>

      <div className="visibility-actor-grid">
        {visibilityActors.map((actor) => {
          const matchesStage = actorMatchesStage(actor, activeStage)
          const matchesLens = actorMatchesLens(actor, selectedLayerLens)

          return (
            <article
              key={actor.id}
              className={[
                'visibility-actor-card',
                matchesStage ? 'visibility-actor-card--stage' : '',
                matchesLens ? 'visibility-actor-card--lens' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="visibility-actor-card__top">
                <span>{actor.icon}</span>
                <div>
                  <strong>{actor.title}</strong>
                  <small>
                    {matchesStage
                      ? 'relevant to this stage'
                      : matchesLens
                        ? 'matches active lens'
                        : 'not the main observer here'}
                  </small>
                </div>
              </div>

              <div className="visibility-actor-card__layers">
                {actor.seesLayers.map((layer) => (
                  <span key={layer}>{layer}</span>
                ))}
              </div>

              <div className="visibility-columns">
                <div>
                  <b>Can see</b>
                  <ul>
                    {actor.canSee.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <b>Cannot assume</b>
                  <ul>
                    {actor.cannotSee.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="visibility-logs">
                <b>Typical evidence</b>
                <span>{actor.typicalLogs.join(' · ')}</span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
