# Packet Atlas hygiene audit

Generated: 2026-06-05T07:51:42.332Z

## Summary

- TSX component files: 46
- TS model/helper files: 39
- CSS files: 1
- CSS total size: 101830 bytes
- Duplicate basenames: 1
- Learning-related leftovers: 1

## Component inventory

| Status | Component | File | Reference count |
|---|---:|---|---:|
| keep | AtlasLiveRegion | `src/features/packet-atlas/accessibility/AtlasLiveRegion.tsx` | 4 |
| keep | PacketBytesHexPane | `src/features/packet-atlas/bytes/PacketBytesHexPane.tsx` | 4 |
| keep | CaptureAwareInspector | `src/features/packet-atlas/capture-inspector/CaptureAwareInspector.tsx` | 4 |
| keep | CaptureFixturePanel | `src/features/packet-atlas/captures/CaptureFixturePanel.tsx` | 5 |
| keep | CdnEdgeVariantPanel | `src/features/packet-atlas/cdn-edge/CdnEdgeVariantPanel.tsx` | 4 |
| keep | CinematicTraceMode | `src/features/packet-atlas/cinematic/CinematicTraceMode.tsx` | 4 |
| keep | ComponentLab | `src/features/packet-atlas/component-lab/ComponentLab.tsx` | 4 |
| keep | JourneyControls | `src/features/packet-atlas/controls/JourneyControls.tsx` | 5 |
| keep | StageDeepDiveCards | `src/features/packet-atlas/deep-dive/StageDeepDiveCards.tsx` | 4 |
| keep | DeviceCutawayView | `src/features/packet-atlas/device-cutaway/DeviceCutawayView.tsx` | 4 |
| keep | VariantFlowDiff | `src/features/packet-atlas/diff/VariantFlowDiff.tsx` | 5 |
| keep | DnsResolutionModesPanel | `src/features/packet-atlas/dns/DnsResolutionModesPanel.tsx` | 4 |
| keep | EncapsulationTransformView | `src/features/packet-atlas/encapsulation/EncapsulationTransformView.tsx` | 4 |
| keep | FailureVariantBuilder | `src/features/packet-atlas/failure-builder/FailureVariantBuilder.tsx` | 4 |
| keep | FailureTraceNavigator | `src/features/packet-atlas/failure/FailureTraceNavigator.tsx` | 4 |
| keep | WiresharkFieldTree | `src/features/packet-atlas/field-tree/WiresharkFieldTree.tsx` | 5 |
| keep | PacketFieldExplorer | `src/features/packet-atlas/fields/PacketFieldExplorer.tsx` | 4 |
| keep | StatefulFirewallView | `src/features/packet-atlas/firewall/StatefulFirewallView.tsx` | 4 |
| keep | HttpVersionVariantPanel | `src/features/packet-atlas/http/HttpVersionVariantPanel.tsx` | 4 |
| keep | PacketInspector | `src/features/packet-atlas/inspector/PacketInspector.tsx` | 5 |
| keep | Ipv6NeighborDiscoveryPanel | `src/features/packet-atlas/ipv6/Ipv6NeighborDiscoveryPanel.tsx` | 4 |
| keep | AssumptionBar | `src/features/packet-atlas/layers/AssumptionBar.tsx` | 4 |
| review | DevicePerspectivePanel | `src/features/packet-atlas/layers/DevicePerspectivePanel.tsx` | 1 |
| keep | EncapsulationStack | `src/features/packet-atlas/layers/EncapsulationStack.tsx` | 4 |
| keep | LayerHighlightPanel | `src/features/packet-atlas/layers/LayerHighlightPanel.tsx` | 4 |
| keep | RightPanelTabs | `src/features/packet-atlas/layout/RightPanelTabs.tsx` | 4 |
| review | ScenarioLearningPanel | `src/features/packet-atlas/learning/ScenarioLearningPanel.tsx` | 1 |
| keep | GlobalJourneyMap | `src/features/packet-atlas/map/GlobalJourneyMap.tsx` | 5 |
| keep | NatStateTableView | `src/features/packet-atlas/nat/NatStateTableView.tsx` | 4 |
| keep | JourneyControls | `src/features/packet-atlas/navigation/JourneyControls.tsx` | 5 |
| keep | ObserverModePanel | `src/features/packet-atlas/observer/ObserverModePanel.tsx` | 4 |
| keep | PacketAtlasPage | `src/features/packet-atlas/PacketAtlasPage.tsx` | 1 |
| keep | PathScopeFilter | `src/features/packet-atlas/path-scope/PathScopeFilter.tsx` | 4 |
| review | AtlasLoadingFallback | `src/features/packet-atlas/performance/AtlasLoadingFallback.tsx` | 1 |
| keep | SignalStripCanvas | `src/features/packet-atlas/physical/SignalStripCanvas.tsx` | 5 |
| keep | ProtocolMiniDiagram | `src/features/packet-atlas/protocol-diagram/ProtocolMiniDiagram.tsx` | 4 |
| keep | ProxyTerminationPanel | `src/features/packet-atlas/proxy-termination/ProxyTerminationPanel.tsx` | 4 |
| keep | ScenarioSelector | `src/features/packet-atlas/scenario-selector/ScenarioSelector.tsx` | 4 |
| keep | SearchJumpPalette | `src/features/packet-atlas/search/SearchJumpPalette.tsx` | 4 |
| keep | ProtocolSequenceBoard | `src/features/packet-atlas/sequences/ProtocolSequenceBoard.tsx` | 4 |
| keep | RouteTimeline | `src/features/packet-atlas/timeline/RouteTimeline.tsx` | 5 |
| keep | TlsVisibilityPanel | `src/features/packet-atlas/tls-visibility/TlsVisibilityPanel.tsx` | 4 |
| keep | ScenarioVariantPanel | `src/features/packet-atlas/variants/ScenarioVariantPanel.tsx` | 5 |
| keep | DeviceVisibilityMatrix | `src/features/packet-atlas/visibility/DeviceVisibilityMatrix.tsx` | 4 |
| keep | WifiAccessVariantPanel | `src/features/packet-atlas/wifi/WifiAccessVariantPanel.tsx` | 4 |
| keep | WorkspaceTabs | `src/features/packet-atlas/workspace/WorkspaceTabs.tsx` | 4 |

## Duplicate basenames

- **JourneyControls.tsx**
  - `src/features/packet-atlas/controls/JourneyControls.tsx`
  - `src/features/packet-atlas/navigation/JourneyControls.tsx`

## Learning leftovers

- `src/features/packet-atlas/learning/ScenarioLearningPanel.tsx`

## Recommendation

Do not delete automatically unless a file is clearly unused and covered by tests. Use this report as a map for manual cleanup.
