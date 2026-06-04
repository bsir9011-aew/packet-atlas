#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this patch from /workspaces/packet-atlas/packet-atlas"
  exit 1
fi

echo "🧭 Applying Packet Atlas v3.4 — Path Scope Filter..."
mkdir -p patches/backups src/features/packet-atlas/path-scope tests/unit
[ -f src/features/packet-atlas/PacketAtlasPage.tsx ] && cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/PacketAtlasPage.before-v3.4.tsx
[ -f src/features/packet-atlas/packetAtlas.css ] && cp src/features/packet-atlas/packetAtlas.css patches/backups/packetAtlas.before-v3.4.css

cat > src/features/packet-atlas/path-scope/pathScopeModel.ts <<'TS'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type PathScopeId =
  | 'all'
  | 'request'
  | 'response'
  | 'internal'
  | 'client-side'
  | 'local-lan'
  | 'internet-edge'
  | 'server-side'

export type PathScope = {
  id: PathScopeId
  label: string
  description: string
}

export const pathScopes: PathScope[] = [
  { id: 'all', label: 'All', description: 'Full request/response journey.' },
  { id: 'request', label: 'Request only', description: 'Outbound path from user intent to server edge.' },
  { id: 'response', label: 'Response only', description: 'Return path from server response to browser render.' },
  { id: 'internal', label: 'Internal', description: 'Server-side hops behind the public edge.' },
  { id: 'client-side', label: 'Client side', description: 'User, browser and client operating system stages.' },
  { id: 'local-lan', label: 'Local LAN', description: 'ARP, Ethernet, switch and local gateway context.' },
  { id: 'internet-edge', label: 'Internet edge', description: 'Router/NAT, DNS resolver and public proxy boundary.' },
  { id: 'server-side', label: 'Server side', description: 'Proxy, application and database work.' },
]

export function stageMatchesPathScope(stage: JourneyStage, scopeId: PathScopeId) {
  if (scopeId === 'all') return true
  if (scopeId === 'request') return stage.direction === 'request'
  if (scopeId === 'response') return stage.direction === 'response'
  if (scopeId === 'internal') return stage.direction === 'internal'
  if (scopeId === 'client-side') return ['user', 'browser', 'os', 'nic'].includes(stage.device.role)
  if (scopeId === 'local-lan') return ['arp-request', 'arp-response', 'ethernet-frame'].includes(stage.stageKind) || ['switch'].includes(stage.device.role)
  if (scopeId === 'internet-edge') return ['router', 'firewall', 'dns', 'proxy'].includes(stage.device.role)
  if (scopeId === 'server-side') return ['proxy', 'app', 'db'].includes(stage.device.role)
  return true
}

export function getStagesForPathScope(scenario: JourneyScenario, scopeId: PathScopeId) {
  return scenario.stages.filter((stage) => stageMatchesPathScope(stage, scopeId))
}
TS

cat > src/features/packet-atlas/path-scope/PathScopeFilter.tsx <<'TSX'
import { useMemo, useState } from 'react'
import { httpsExampleScenario } from '../scenarios/httpsExample'
import { useAtlasStore } from '../store/atlasStore'
import { getStagesForPathScope, pathScopes, type PathScopeId } from './pathScopeModel'

export function PathScopeFilter() {
  const [scopeId, setScopeId] = useState<PathScopeId>('all')
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  const activeScope = pathScopes.find((scope) => scope.id === scopeId) ?? pathScopes[0]
  const stages = useMemo(() => getStagesForPathScope(httpsExampleScenario, scopeId), [scopeId])
  const activeStageIsInside = stages.some((stage) => stage.id === selectedStageId)

  return (
    <section className="path-scope-panel" aria-label="Path scope filter">
      <div className="path-scope-panel__heading">
        <div>
          <strong>🧭 Path Scope Filter</strong>
          <p>{activeScope.description}</p>
        </div>
        <span>{stages.length} stages</span>
      </div>

      <div className="path-scope-options">
        {pathScopes.map((scope) => (
          <button
            key={scope.id}
            className={scope.id === scopeId ? 'path-scope-chip path-scope-chip--active' : 'path-scope-chip'}
            onClick={() => setScopeId(scope.id)}
          >
            {scope.label}
          </button>
        ))}
      </div>

      {!activeStageIsInside ? (
        <div className="path-scope-note">
          Current stage is outside this path scope. Jump to one of the visible stages below.
        </div>
      ) : null}

      <div className="path-scope-stage-row">
        {stages.map((stage) => (
          <button
            key={stage.id}
            className={stage.id === selectedStageId ? 'path-stage-pill path-stage-pill--active' : 'path-stage-pill'}
            onClick={() => setSelectedStageId(stage.id)}
          >
            {stage.shortName}
          </button>
        ))}
      </div>
    </section>
  )
}
TSX

python3 <<'PY'
from pathlib import Path
import re
page = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text = page.read_text()
text = re.sub(r'Packet Atlas v\d+\.\d+', 'Packet Atlas v3.4', text)
if "./path-scope/PathScopeFilter" not in text:
    text = text.replace("import './packetAtlas.css'", "import './packetAtlas.css'\nimport { PathScopeFilter } from './path-scope/PathScopeFilter'", 1)
if '<PathScopeFilter />' not in text:
    if '<SearchJumpPalette />' in text:
        text = text.replace('<SearchJumpPalette />', '<SearchJumpPalette />\n\n      <PathScopeFilter />', 1)
    elif '</header>' in text:
        text = text.replace('</header>', '</header>\n\n      <PathScopeFilter />', 1)
page.write_text(text)

css_path = Path('src/features/packet-atlas/packetAtlas.css')
css = css_path.read_text()
if '/* === Packet Atlas v3.4 Path Scope START === */' not in css:
    css += r'''

/* === Packet Atlas v3.4 Path Scope START === */
.path-scope-panel {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.74);
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 14px;
}

.path-scope-panel__heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
  margin-bottom: 12px;
}

.path-scope-panel__heading p {
  color: #94a3b8;
  margin: 6px 0 0;
}

.path-scope-panel__heading span {
  color: #bae6fd;
  border: 1px solid #334155;
  border-radius: 999px;
  padding: 6px 9px;
  white-space: nowrap;
}

.path-scope-options,
.path-scope-stage-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.path-scope-chip,
.path-stage-pill {
  border: 1px solid #334155;
  color: #cbd5e1;
  background: #020617;
  border-radius: 999px;
  padding: 7px 10px;
  cursor: pointer;
}

.path-scope-chip:hover,
.path-scope-chip--active,
.path-stage-pill:hover,
.path-stage-pill--active {
  border-color: #38bdf8;
  background: #082f49;
  color: #f8fafc;
}

.path-scope-note {
  margin: 10px 0;
  border: 1px solid rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.08);
  color: #fde68a;
  border-radius: 14px;
  padding: 10px 12px;
}

.path-scope-stage-row {
  margin-top: 10px;
}
/* === Packet Atlas v3.4 Path Scope END === */
'''
    css_path.write_text(css)
PY

cat > tests/unit/pathScopeModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getStagesForPathScope } from '../../src/features/packet-atlas/path-scope/pathScopeModel'

describe('path scope model', () => {
  it('filters request and response stages', () => {
    expect(getStagesForPathScope(httpsExampleScenario, 'request').every((stage) => stage.direction === 'request')).toBe(true)
    expect(getStagesForPathScope(httpsExampleScenario, 'response').every((stage) => stage.direction === 'response')).toBe(true)
  })

  it('finds local LAN stages', () => {
    const lanStages = getStagesForPathScope(httpsExampleScenario, 'local-lan').map((stage) => stage.id)
    expect(lanStages.some((id) => id.includes('arp') || id.includes('lan'))).toBe(true)
  })
})
TS

echo "✅ v3.4 applied — Path Scope Filter."
echo "🧪 Now run: npm run build && npm test"
