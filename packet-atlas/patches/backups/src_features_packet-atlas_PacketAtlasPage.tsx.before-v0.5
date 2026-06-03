import { httpsExampleScenario } from './scenarios/httpsExample'
import { useAtlasStore } from './store/atlasStore'
import { GlobalJourneyMap } from './map/GlobalJourneyMap'
import { RouteTimeline } from './timeline/RouteTimeline'
import { PacketInspector } from './inspector/PacketInspector'
import { AssumptionBar } from './layers/AssumptionBar'
import { EncapsulationStack } from './layers/EncapsulationStack'
import { DevicePerspectivePanel } from './layers/DevicePerspectivePanel'
import { JourneyControls } from './navigation/JourneyControls'
import './packetAtlas.css'

export function PacketAtlasPage() {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const activeStage =
    httpsExampleScenario.stages.find((stage) => stage.id === selectedStageId) ??
    httpsExampleScenario.stages[0]

  return (
    <div className="atlas-shell">
      <header className="atlas-header">
        <div>
          <p className="eyebrow">Packet Atlas v0.4</p>
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
      <JourneyControls scenario={httpsExampleScenario} />

      <main className="atlas-layout">
        <section className="map-column">
          <GlobalJourneyMap scenario={httpsExampleScenario} />
          <RouteTimeline scenario={httpsExampleScenario} />
        </section>

        <aside className="inspector-column">
          <PacketInspector stage={activeStage} />
          <DevicePerspectivePanel scenario={httpsExampleScenario} stage={activeStage} />
          <EncapsulationStack stage={activeStage} />
        </aside>
      </main>
    </div>
  )
}
