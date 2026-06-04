#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this patch from /workspaces/packet-atlas/packet-atlas"
  exit 1
fi

echo "🧭 Applying Packet Atlas v4.1 — Workspace Consolidation & UX Stabilization..."
mkdir -p patches/backups src/features/packet-atlas/workspace tests/unit
[ -f src/features/packet-atlas/PacketAtlasPage.tsx ] && cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/PacketAtlasPage.before-v4.1.tsx
[ -f src/features/packet-atlas/packetAtlas.css ] && cp src/features/packet-atlas/packetAtlas.css patches/backups/packetAtlas.before-v4.1.css

cat > src/features/packet-atlas/workspace/workspaceModel.ts <<'TS'
export type AtlasWorkspaceId =
  | 'journey'
  | 'diagnostics'
  | 'protocols'
  | 'internals'
  | 'capture'

export type AtlasWorkspaceDefinition = {
  id: AtlasWorkspaceId
  label: string
  icon: string
  summary: string
  purpose: string
}

export const atlasWorkspaces: AtlasWorkspaceDefinition[] = [
  {
    id: 'journey',
    label: 'Journey',
    icon: '🧭',
    summary: 'Map, timeline, active stage and core inspector.',
    purpose:
      'Keep the main data journey in the center: where the packet is, what stage is active and which layer is being highlighted.',
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    icon: '🛠️',
    summary: 'Failures, diff, NAT and firewall state.',
    purpose:
      'Compare happy path with failure variants and inspect where the flow changes, breaks or becomes unreachable.',
  },
  {
    id: 'protocols',
    label: 'Protocols',
    icon: '🔁',
    summary: 'DNS, HTTP, TLS, proxy, CDN, Wi‑Fi and IPv6 variants.',
    purpose:
      'Explore alternative protocol and infrastructure models without forcing every panel into the default view.',
  },
  {
    id: 'internals',
    label: 'Internals',
    icon: '🔬',
    summary: 'Observers, fields, bytes and device cutaways.',
    purpose:
      'Go deeper into what each device, field and protocol wrapper can or cannot reveal.',
  },
  {
    id: 'capture',
    label: 'Capture',
    icon: '🦈',
    summary: 'Fixture and capture pipeline bridge.',
    purpose:
      'Connect the educational scenario with capture fixtures without turning the browser into a PCAP parser.',
  },
]

export function getWorkspaceById(id: AtlasWorkspaceId) {
  return atlasWorkspaces.find((workspace) => workspace.id === id) ?? atlasWorkspaces[0]
}
TS

cat > src/features/packet-atlas/workspace/WorkspaceTabs.tsx <<'TSX'
import { useState } from 'react'
import { CaptureFixturePanel } from '../captures/CaptureFixturePanel'
import { CdnEdgeVariantPanel } from '../cdn-edge/CdnEdgeVariantPanel'
import { CinematicTraceMode } from '../cinematic/CinematicTraceMode'
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
        <div className="workspace-shell__badge">v4.1 organized</div>
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
          </div>
        )}

        {activeWorkspace === 'capture' && (
          <div className="workspace-body__stack">
            <PanelCluster
              title="Capture bridge"
              note="Synthetic scenario first, real capture fixtures later. The browser does not parse PCAP directly."
            >
              <CaptureFixturePanel scenario={scenario} stage={stage} />
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
TSX

cat > src/features/packet-atlas/PacketAtlasPage.tsx <<'TSX'
import { AssumptionBar } from './layers/AssumptionBar'
import { ScenarioSelector } from './scenario-selector/ScenarioSelector'
import { getScenarioById } from './scenarios/scenarioRegistry'
import { SearchJumpPalette } from './search/SearchJumpPalette'
import { useAtlasStore } from './store/atlasStore'
import { WorkspaceTabs } from './workspace/WorkspaceTabs'
import './packetAtlas.css'

export function PacketAtlasPage() {
  const selectedScenarioId = useAtlasStore((state) => state.selectedScenarioId)
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const activeScenario = getScenarioById(selectedScenarioId)
  const activeStage =
    activeScenario.stages.find((stage) => stage.id === selectedStageId) ??
    activeScenario.stages[0]

  return (
    <div className="atlas-shell atlas-shell--v41">
      <header className="atlas-header atlas-header--v41">
        <div>
          <p className="eyebrow">Packet Atlas v4.1</p>
          <h1>{activeScenario.title}</h1>
          <p>{activeScenario.description}</p>
        </div>

        <div className="header-badge">
          <span>🧭</span>
          <strong>One journey</strong>
          <small>organized workspaces</small>
        </div>
      </header>

      <div className="atlas-top-deck">
        <SearchJumpPalette />
        <AssumptionBar scenario={activeScenario} />
        <ScenarioSelector scenario={activeScenario} />
      </div>

      <WorkspaceTabs scenario={activeScenario} stage={activeStage} />
    </div>
  )
}
TSX

python3 <<'PY'
from pathlib import Path
css_path = Path('src/features/packet-atlas/packetAtlas.css')
css = css_path.read_text()
marker = '/* === Packet Atlas v4.1 Workspace Consolidation START === */'
if marker not in css:
    css += r'''

/* === Packet Atlas v4.1 Workspace Consolidation START === */
.atlas-shell--v41 {
  width: min(1780px, calc(100vw - 36px));
}

.atlas-header--v41 {
  margin-bottom: 18px;
}

.atlas-top-deck {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.atlas-top-deck .scenario-selector-panel,
.atlas-top-deck .assumption-bar,
.atlas-top-deck .search-palette-shell {
  margin-bottom: 0;
}

.atlas-top-deck .scenario-selector__list {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.workspace-shell {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.72);
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 18px 80px rgba(0, 0, 0, 0.26);
}

.workspace-shell__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;
  margin-bottom: 14px;
}

.workspace-shell__eyebrow {
  margin: 0 0 5px;
  color: #38bdf8;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.76rem;
}

.workspace-shell__header h2 {
  margin: 0 0 6px;
  font-size: clamp(1.35rem, 2vw, 2.1rem);
}

.workspace-shell__header p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.5;
}

.workspace-shell__badge {
  border: 1px solid #334155;
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(2, 6, 23, 0.58);
  color: #bae6fd;
  font-weight: 900;
  white-space: nowrap;
}

.workspace-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.workspace-tab {
  border: 1px solid #334155;
  background: rgba(2, 6, 23, 0.56);
  color: #e5e7eb;
  border-radius: 18px;
  padding: 12px;
  text-align: left;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    "icon label"
    "icon summary";
  gap: 3px 9px;
  cursor: pointer;
  min-height: 82px;
}

.workspace-tab:hover,
.workspace-tab--active {
  border-color: #38bdf8;
  background: #082f49;
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.08);
}

.workspace-tab > span {
  grid-area: icon;
  font-size: 1.3rem;
  align-self: start;
}

.workspace-tab strong {
  grid-area: label;
}

.workspace-tab small {
  grid-area: summary;
  color: #94a3b8;
  line-height: 1.25;
}

.workspace-body {
  display: grid;
  gap: 14px;
}

.workspace-body__stack {
  display: grid;
  gap: 14px;
}

.atlas-layout--workspace {
  grid-template-columns: minmax(0, 1fr) 480px;
  align-items: start;
}

.inspector-column--workspace {
  position: sticky;
  top: 14px;
  max-height: calc(100vh - 28px);
  overflow: auto;
}

.workspace-cluster {
  border: 1px solid #1e293b;
  background: rgba(2, 6, 23, 0.38);
  border-radius: 22px;
  overflow: hidden;
}

.workspace-cluster__heading {
  border-bottom: 1px solid #1e293b;
  padding: 14px 16px;
  background: rgba(2, 6, 23, 0.5);
}

.workspace-cluster__heading h3 {
  margin: 0 0 5px;
}

.workspace-cluster__heading p {
  margin: 0;
  color: #94a3b8;
  line-height: 1.45;
}

.workspace-cluster__body {
  display: grid;
  gap: 14px;
  padding: 14px;
}

.workspace-cluster__body > section,
.workspace-cluster__body > aside,
.workspace-cluster__body > div {
  margin-bottom: 0;
}

.workspace-cluster .panel-heading {
  border-radius: 0;
}

@media (max-width: 1280px) {
  .workspace-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .atlas-layout--workspace {
    grid-template-columns: 1fr;
  }

  .inspector-column--workspace {
    position: static;
    max-height: none;
  }
}

@media (max-width: 760px) {
  .workspace-shell__header {
    grid-template-columns: 1fr;
  }

  .workspace-tabs {
    grid-template-columns: 1fr;
  }

  .workspace-tab {
    min-height: auto;
  }
}
/* === Packet Atlas v4.1 Workspace Consolidation END === */
'''
    css_path.write_text(css)
PY

cat > tests/unit/workspaceModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { atlasWorkspaces, getWorkspaceById } from '../../src/features/packet-atlas/workspace/workspaceModel'

describe('workspace model', () => {
  it('keeps Packet Atlas organized into focused workspaces', () => {
    expect(atlasWorkspaces.map((workspace) => workspace.id)).toEqual([
      'journey',
      'diagnostics',
      'protocols',
      'internals',
      'capture',
    ])
  })

  it('falls back to the journey workspace for unknown ids', () => {
    expect(getWorkspaceById('missing' as never).id).toBe('journey')
  })
})
TS

node - <<'NODE'
const fs = require('fs')
const path = 'CHANGELOG.md'
const entry = `\n## v4.1 — Workspace Consolidation & UX Stabilization\n\n- Reorganized the application into focused workspaces: Journey, Diagnostics, Protocols, Internals and Capture.\n- Moved secondary protocol/diagnostic panels out of the default scroll path.\n- Restored the map/timeline/inspector as the center of the experience.\n- Added a small workspace model test to keep the organization intentional.\n`
if (fs.existsSync(path)) {
  const text = fs.readFileSync(path, 'utf8')
  if (!text.includes('v4.1 — Workspace Consolidation')) fs.writeFileSync(path, text + entry)
} else {
  fs.writeFileSync(path, `# Changelog\n${entry}`)
}
NODE

echo "✅ v4.1 applied — Workspace Consolidation & UX Stabilization."
echo "🧪 Now run: npm run build && npm test"
