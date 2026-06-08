import { useState } from 'react'
import { CaptureFixturePanel } from '../captures/CaptureFixturePanel'
import { CaptureAwareInspector } from '../capture-inspector/CaptureAwareInspector'
import { RealCaptureEvidencePanel } from '../real-capture/RealCaptureEvidencePanel'
import { RealCaptureTimelinePanel } from '../real-capture/RealCaptureTimelinePanel'
import { TlsBoundaryPanel } from '../real-capture/TlsBoundaryPanel'
import { HttpsHttpContrastPanel } from '../contrast-workspace/HttpsHttpContrastPanel'
import { CdnEdgeVariantPanel } from '../cdn-edge/CdnEdgeVariantPanel'
import { CinematicTraceMode } from '../cinematic/CinematicTraceMode'
import { ComponentLab } from '../component-lab/ComponentLab'
import { DeviceCutawayView } from '../device-cutaway/DeviceCutawayView'
import { VariantFlowDiff } from '../diff/VariantFlowDiff'
import { DnsResolutionModesPanel } from '../dns/DnsResolutionModesPanel'
import { EncapsulationTransformView } from '../encapsulation/EncapsulationTransformView'
import { FailureVariantBuilder } from '../failure-builder/FailureVariantBuilder'
import { FailureTraceNavigator } from '../failure/FailureTraceNavigator'
import { StatefulFirewallView } from '../firewall/StatefulFirewallView'
import { PacketFieldExplorer } from '../fields/PacketFieldExplorer'
import { WiresharkFieldTree } from '../field-tree/WiresharkFieldTree'
import { HttpVersionVariantPanel } from '../http/HttpVersionVariantPanel'
import { Ipv6NeighborDiscoveryPanel } from '../ipv6/Ipv6NeighborDiscoveryPanel'
import { LayerHighlightPanel } from '../layers/LayerHighlightPanel'
import { RightPanelTabs } from '../layout/RightPanelTabs'
import { GlobalJourneyMap } from '../map/GlobalJourneyMap'
import { NatStateTableView } from '../nat/NatStateTableView'
import { ObserverModePanel } from '../observer/ObserverModePanel'
import { PathScopeFilter } from '../path-scope/PathScopeFilter'
import { SignalStripCanvas } from '../physical/SignalStripCanvas'
import { ProtocolMiniDiagram } from '../protocol-diagram/ProtocolMiniDiagram'
import { ProxyTerminationPanel } from '../proxy-termination/ProxyTerminationPanel'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { ProtocolSequenceBoard } from '../sequences/ProtocolSequenceBoard'
import { ScenarioVariantPanel } from '../variants/ScenarioVariantPanel'
import { DeviceVisibilityMatrix } from '../visibility/DeviceVisibilityMatrix'
import { WifiAccessVariantPanel } from '../wifi/WifiAccessVariantPanel'
import { StageDeepDiveCards } from '../deep-dive/StageDeepDiveCards'
import { TlsVisibilityPanel } from '../tls-visibility/TlsVisibilityPanel'
import { PacketBytesHexPane } from '../bytes/PacketBytesHexPane'
import { RouteTimeline } from '../timeline/RouteTimeline'
import { JourneyControls } from '../controls/JourneyControls'
import { atlasWorkspaces, type AtlasWorkspaceId } from './workspaceModel'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
}

function PanelCluster({
  title,
  note,
  children,
}: {
  title: string
  note: string
  children: React.ReactNode
}) {
  return (
    <section className="workspace-cluster">
      <div className="workspace-cluster__heading">
        <div>
          <h3>{title}</h3>
          <p>{note}</p>
        </div>
      </div>
      <div className="workspace-cluster__body">{children}</div>
    </section>
  )
}

export function WorkspaceTabs({ scenario, stage }: Props) {
  const [activeWorkspace, setActiveWorkspace] =
    useState<AtlasWorkspaceId>('journey')
  const current =
    atlasWorkspaces.find((workspace) => workspace.id === activeWorkspace) ??
    atlasWorkspaces[0]

  return (
    <section className="workspace-shell" aria-label="Packet Atlas workspaces">
      <div className="workspace-shell__header">
        <div>
          <p className="workspace-shell__eyebrow">Workspace</p>
          <h2>
            <span>{current.icon}</span> {current.label}
          </h2>
          <p>{current.purpose}</p>
        </div>
        <div className="workspace-shell__badge">v7.0 contrast workspace</div>
      </div>

      <div className="workspace-tabs" role="tablist" aria-label="Workspace tabs">
        {atlasWorkspaces.map((workspace) => (
          <button
            key={workspace.id}
            type="button"
            role="tab"
            aria-selected={workspace.id === activeWorkspace}
            className={
              workspace.id === activeWorkspace
                ? 'workspace-tab workspace-tab--active'
                : 'workspace-tab'
            }
            onClick={() => setActiveWorkspace(workspace.id)}
          >
            <span>{workspace.icon}</span>
            <strong>{workspace.label}</strong>
            <small>{workspace.summary}</small>
          </button>
        ))}
      </div>

      <div className="workspace-body">
        {activeWorkspace === 'journey' && (
          <div className="workspace-body__stack">
            <PathScopeFilter />
            <LayerHighlightPanel scenario={scenario} />
            <JourneyControls scenario={scenario} />

            <main className="atlas-layout atlas-layout--workspace">
              <section className="map-column">
                <GlobalJourneyMap scenario={scenario} />
                <RouteTimeline scenario={scenario} />
                <StageDeepDiveCards scenario={scenario} stage={stage} />
              </section>

              <aside className="inspector-column inspector-column--workspace">
                <RightPanelTabs scenario={scenario} stage={stage} />
              </aside>
            </main>
          </div>
        )}

        {activeWorkspace === 'diagnostics' && (
          <div className="workspace-body__stack">
            <PanelCluster
              title="Failure model"
              note="Use this workspace to compare a healthy flow with selected failure variants."
            >
              <ScenarioVariantPanel scenario={scenario} />
              <FailureTraceNavigator scenario={scenario} />
              <VariantFlowDiff scenario={scenario} />
              <FailureVariantBuilder scenario={scenario} />
            </PanelCluster>

            <PanelCluster
              title="Stateful network controls"
              note="NAT and firewall state are kept here instead of crowding the main journey view."
            >
              <NatStateTableView scenario={scenario} stage={stage} />
              <StatefulFirewallView scenario={scenario} stage={stage} />
            </PanelCluster>
          </div>
        )}

        {activeWorkspace === 'protocols' && (
          <div className="workspace-body__stack">
            <PanelCluster
              title="Protocol and environment variants"
              note="These panels change the interpretation of the same request/response path."
            >
              <DnsResolutionModesPanel scenario={scenario} stage={stage} />
              <HttpVersionVariantPanel scenario={scenario} stage={stage} />
              <Ipv6NeighborDiscoveryPanel />
              <WifiAccessVariantPanel />
              <TlsVisibilityPanel />
              <ProxyTerminationPanel />
              <CdnEdgeVariantPanel />
            </PanelCluster>

            <PanelCluster
              title="Protocol mechanics"
              note="Keep sequence and encapsulation mechanics together, below the variant controls."
            >
              <EncapsulationTransformView stage={stage} />
              <ProtocolSequenceBoard scenario={scenario} stage={stage} />
              <ProtocolMiniDiagram scenario={scenario} stage={stage} />
              <SignalStripCanvas stage={stage} />
            </PanelCluster>
          </div>
        )}

        {activeWorkspace === 'internals' && (
          <div className="workspace-body__stack">
            <PanelCluster
              title="Device and observer truth"
              note="Separate what exists in the journey from what a given observer can actually see."
            >
              <ObserverModePanel scenario={scenario} stage={stage} />
              <DeviceVisibilityMatrix scenario={scenario} />
              <DeviceCutawayView stage={stage} />
            </PanelCluster>

            <PanelCluster
              title="Fields, tree and bytes"
              note="Deep packet details live here so the main atlas stays readable."
            >
              <PacketFieldExplorer stage={stage} />
              <WiresharkFieldTree stage={stage} />
              <PacketBytesHexPane stage={stage} />
            </PanelCluster>

            <PanelCluster
              title="Component catalog"
              note="A lightweight inventory of core and experimental atlas components."
            >
              <ComponentLab />
            </PanelCluster>
          </div>
        )}

        {activeWorkspace === 'capture' && (
          <div className="workspace-body__stack">
            <PanelCluster
              title="Capture bridge"
              note="Synthetic scenario plus a verified redacted real capture fixture. The browser reads normalized JSON, not PCAP directly."
            >
              <HttpsHttpContrastPanel />
              <RealCaptureEvidencePanel />
              <RealCaptureTimelinePanel />
              <TlsBoundaryPanel />
              <CaptureFixturePanel scenario={scenario} stage={stage} />
              <CaptureAwareInspector stage={stage} />
            </PanelCluster>

            <PanelCluster
              title="Trace playback"
              note="Cinematic trace is useful, but it is a secondary playback tool, not the default workspace."
            >
              <CinematicTraceMode scenario={scenario} stage={stage} />
            </PanelCluster>
          </div>
        )}
      </div>
    </section>
  )
}
