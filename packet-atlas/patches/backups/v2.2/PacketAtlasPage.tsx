import { JourneyControls } from './controls/JourneyControls'
import { AssumptionBar } from './layers/AssumptionBar'
import { LayerHighlightPanel } from './layers/LayerHighlightPanel'
import { RightPanelTabs } from './layout/RightPanelTabs'
import { GlobalJourneyMap } from './map/GlobalJourneyMap'
import { httpsExampleScenario } from './scenarios/httpsExample'
import { useAtlasStore } from './store/atlasStore'
import { RouteTimeline } from './timeline/RouteTimeline'
import { StageDeepDiveCards } from './deep-dive/StageDeepDiveCards'
import { ProtocolMiniDiagram } from './protocol-diagram/ProtocolMiniDiagram'
import './packetAtlas.css'
import { PacketFieldExplorer } from './fields/PacketFieldExplorer'
import { ScenarioLearningPanel } from './learning/ScenarioLearningPanel'
import { ScenarioVariantPanel } from './variants/ScenarioVariantPanel'
import { DeviceVisibilityMatrix } from './visibility/DeviceVisibilityMatrix'
import { VariantFlowDiff } from './diff/VariantFlowDiff'
import { FailureTraceNavigator } from './failure/FailureTraceNavigator'
import { ObserverModePanel } from './observer/ObserverModePanel'
import { EncapsulationTransformView } from './encapsulation/EncapsulationTransformView'
import { ProtocolSequenceBoard } from './sequences/ProtocolSequenceBoard'
import { WiresharkFieldTree } from './field-tree/WiresharkFieldTree'
import { CaptureFixturePanel } from './captures/CaptureFixturePanel'

export function PacketAtlasPage() {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const activeStage =
    httpsExampleScenario.stages.find((stage) => stage.id === selectedStageId) ??
    httpsExampleScenario.stages[0]

  return (
    <div className="atlas-shell atlas-shell--v05 atlas-shell--v06">
      <header className="atlas-header">
        <div>
          <p className="eyebrow">Packet Atlas v2.1</p>
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

      <ScenarioVariantPanel scenario={httpsExampleScenario} />

      <ObserverModePanel scenario={httpsExampleScenario} stage={activeStage} />

      <VariantFlowDiff scenario={httpsExampleScenario} />

      <FailureTraceNavigator scenario={httpsExampleScenario} />
      <LayerHighlightPanel scenario={httpsExampleScenario} />
      <JourneyControls scenario={httpsExampleScenario} />

      <main className="atlas-layout atlas-layout--v05 atlas-layout--v06">
        <section className="map-column map-column--v05">
          <GlobalJourneyMap scenario={httpsExampleScenario} />
          <RouteTimeline scenario={httpsExampleScenario} />
          <DeviceVisibilityMatrix scenario={httpsExampleScenario} />
          <StageDeepDiveCards scenario={httpsExampleScenario} stage={activeStage} />
          <ProtocolMiniDiagram
            stage={activeStage}
            scenario={httpsExampleScenario}
          />
          <PacketFieldExplorer stage={activeStage} />
          <EncapsulationTransformView stage={activeStage} />
          <ProtocolSequenceBoard scenario={httpsExampleScenario} stage={activeStage} />
          <WiresharkFieldTree stage={activeStage} />
          <CaptureFixturePanel scenario={httpsExampleScenario} stage={activeStage} />
          <ScenarioLearningPanel scenario={httpsExampleScenario} activeStage={activeStage} />
        </section>

        <RightPanelTabs scenario={httpsExampleScenario} stage={activeStage} />
      </main>
    </div>
  )
}
