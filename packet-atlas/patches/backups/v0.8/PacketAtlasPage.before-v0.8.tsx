import { JourneyControls } from './controls/JourneyControls'
import { AssumptionBar } from './layers/AssumptionBar'
import { LayerHighlightPanel } from './layers/LayerHighlightPanel'
import { RightPanelTabs } from './layout/RightPanelTabs'
import { GlobalJourneyMap } from './map/GlobalJourneyMap'
import { httpsExampleScenario } from './scenarios/httpsExample'
import { useAtlasStore } from './store/atlasStore'
import { RouteTimeline } from './timeline/RouteTimeline'
import { StageDeepDiveCards } from './deep-dive/StageDeepDiveCards'
import './packetAtlas.css'

export function PacketAtlasPage() {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const activeStage =
    httpsExampleScenario.stages.find((stage) => stage.id === selectedStageId) ??
    httpsExampleScenario.stages[0]

  return (
    <div className="atlas-shell atlas-shell--v05 atlas-shell--v06">
      <header className="atlas-header">
        <div>
          <p className="eyebrow">Packet Atlas v0.7</p>
          <h1>{httpsExampleScenario.title}</h1>
          <p>{httpsExampleScenario.description}</p>
        </div>

        <div className="header-badge">
          <span>🧭</span>
          <strong>One journey</strong>
          <small>many lenses</small>
        </div>
      </header>

      <AssumptionBar scenario={httpsExampleScenario} />
      <LayerHighlightPanel scenario={httpsExampleScenario} />
      <JourneyControls scenario={httpsExampleScenario} />

      <main className="atlas-layout atlas-layout--v05 atlas-layout--v06">
        <section className="map-column map-column--v05">
          <GlobalJourneyMap scenario={httpsExampleScenario} />
          <RouteTimeline scenario={httpsExampleScenario} />
          <StageDeepDiveCards scenario={httpsExampleScenario} stage={activeStage} />
        </section>

        <RightPanelTabs scenario={httpsExampleScenario} stage={activeStage} />
      </main>
    </div>
  )
}
