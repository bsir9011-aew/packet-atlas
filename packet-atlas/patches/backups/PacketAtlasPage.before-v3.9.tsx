import { JourneyControls } from './controls/JourneyControls'
import { AssumptionBar } from './layers/AssumptionBar'
import { LayerHighlightPanel } from './layers/LayerHighlightPanel'
import { RightPanelTabs } from './layout/RightPanelTabs'
import { GlobalJourneyMap } from './map/GlobalJourneyMap'
import { useAtlasStore } from './store/atlasStore'
import { RouteTimeline } from './timeline/RouteTimeline'
import { StageDeepDiveCards } from './deep-dive/StageDeepDiveCards'
import { ProtocolMiniDiagram } from './protocol-diagram/ProtocolMiniDiagram'
import './packetAtlas.css'
import { TlsVisibilityPanel } from './tls-visibility/TlsVisibilityPanel'
import { WifiAccessVariantPanel } from './wifi/WifiAccessVariantPanel'
import { Ipv6NeighborDiscoveryPanel } from './ipv6/Ipv6NeighborDiscoveryPanel'
import { PathScopeFilter } from './path-scope/PathScopeFilter'
import { SearchJumpPalette } from './search/SearchJumpPalette'
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
import { getScenarioById } from './scenarios/scenarioRegistry'
import { ScenarioSelector } from './scenario-selector/ScenarioSelector'
import { FailureVariantBuilder } from './failure-builder/FailureVariantBuilder'
import { NatStateTableView } from './nat/NatStateTableView'
import { StatefulFirewallView } from './firewall/StatefulFirewallView'
import { DnsResolutionModesPanel } from './dns/DnsResolutionModesPanel'
import { HttpVersionVariantPanel } from './http/HttpVersionVariantPanel'
import { CinematicTraceMode } from './cinematic/CinematicTraceMode'
import { PacketBytesHexPane } from './bytes/PacketBytesHexPane'
import { DeviceCutawayView } from './device-cutaway/DeviceCutawayView'

export function PacketAtlasPage() {
  const selectedScenarioId = useAtlasStore((state) => state.selectedScenarioId)
  const activeScenario = getScenarioById(selectedScenarioId)
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const activeStage =
    activeScenario.stages.find((stage) => stage.id === selectedStageId) ??
    activeScenario.stages[0]

  return (
    <div className="atlas-shell atlas-shell--v05 atlas-shell--v06">
      <header className="atlas-header">
        <div>
          <p className="eyebrow">Packet Atlas v3.8</p>
          <h1>{activeScenario.title}</h1>
          <p>{activeScenario.description}</p>
        </div>

        <div className="header-badge">
          <span>🧭</span>
          <strong>One journey</strong>
          <small>many lenses</small>
        </div>
      </header>

      <SearchJumpPalette />

      <PathScopeFilter />

      <Ipv6NeighborDiscoveryPanel />

      <WifiAccessVariantPanel />

      <TlsVisibilityPanel />

      <AssumptionBar scenario={activeScenario} />

      <CinematicTraceMode scenario={activeScenario} stage={activeStage} />

      <ScenarioSelector scenario={activeScenario} />

      <ScenarioVariantPanel scenario={activeScenario} />

      <FailureVariantBuilder scenario={activeScenario} />

      <NatStateTableView scenario={activeScenario} stage={activeStage} />

      <StatefulFirewallView scenario={activeScenario} stage={activeStage} />

      <ObserverModePanel scenario={activeScenario} stage={activeStage} />

      <VariantFlowDiff scenario={activeScenario} />

      <FailureTraceNavigator scenario={activeScenario} />
      <LayerHighlightPanel scenario={activeScenario} />
      <JourneyControls scenario={activeScenario} />

      <main className="atlas-layout atlas-layout--v05 atlas-layout--v06">
        <section className="map-column map-column--v05">
          <GlobalJourneyMap scenario={activeScenario} />
          <RouteTimeline scenario={activeScenario} />
          <DeviceVisibilityMatrix scenario={activeScenario} />
          <StageDeepDiveCards scenario={activeScenario} stage={activeStage} />
          <ProtocolMiniDiagram
            stage={activeStage}
            scenario={activeScenario}
          />
          <PacketFieldExplorer stage={activeStage} />
          <EncapsulationTransformView stage={activeStage} />
          <ProtocolSequenceBoard scenario={activeScenario} stage={activeStage} />
          <WiresharkFieldTree stage={activeStage} />
          <CaptureFixturePanel scenario={activeScenario} stage={activeStage} />
          <ScenarioLearningPanel scenario={activeScenario} activeStage={activeStage} />
        </section>

        <RightPanelTabs scenario={activeScenario} stage={activeStage} />
            <DnsResolutionModesPanel scenario={activeScenario} stage={activeStage} />
            <HttpVersionVariantPanel scenario={activeScenario} stage={activeStage} />
            <PacketBytesHexPane stage={activeStage} />
            <DeviceCutawayView stage={activeStage} />
      </main>
    </div>
  )
}
