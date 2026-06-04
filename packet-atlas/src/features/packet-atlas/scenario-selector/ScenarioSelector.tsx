import { scenarioRegistry } from '../scenarios/scenarioRegistry'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = { scenario: JourneyScenario }

export function ScenarioSelector({ scenario }: Props) {
  const selectedScenarioId = useAtlasStore((state) => state.selectedScenarioId)
  const setSelectedScenarioId = useAtlasStore((state) => state.setSelectedScenarioId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  return (
    <section className="scenario-selector-panel">
      <div className="scenario-selector__head">
        <div><p className="scenario-selector__eyebrow">Scenario authoring system</p><h2>{scenario.title}</h2><p>Scenarios are data-driven: topology, stages, payload projections, assumptions and copy live in scenario models, not hardcoded UI.</p></div>
        <div className="scenario-selector__count">{scenarioRegistry.length} scenario{scenarioRegistry.length === 1 ? '' : 's'}</div>
      </div>
      <div className="scenario-selector__list">
        {scenarioRegistry.map((item) => (
          <button key={item.id} className={item.id === selectedScenarioId ? 'scenario-card scenario-card--active' : 'scenario-card'} onClick={() => { setSelectedScenarioId(item.id); setSelectedStageId(item.scenario.stages[0]?.id ?? '') }}>
            <span className={`scenario-card__status scenario-card__status--${item.status}`}>{item.status}</span><strong>{item.shortTitle}</strong><small>{item.protocolFamily}</small><p>{item.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
