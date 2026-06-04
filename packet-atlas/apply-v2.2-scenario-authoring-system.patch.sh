#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '🧱 Applying Packet Atlas v2.2 — Scenario Authoring System...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo '❌ Run this script from the inner Packet Atlas app folder.'; exit 1; fi
mkdir -p patches/backups/v2.2 src/features/packet-atlas/scenarios src/features/packet-atlas/scenario-selector tests/unit
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v2.2/PacketAtlasPage.tsx 2>/dev/null || true
cp src/features/packet-atlas/store/atlasStore.ts patches/backups/v2.2/atlasStore.ts 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/v2.2/packetAtlas.css 2>/dev/null || true

cat > src/features/packet-atlas/scenarios/scenarioRegistry.ts <<'TS'
import { JourneyScenarioSchema, type JourneyScenario } from '../schema/journeyScenarioSchema'
import { httpsExampleScenario } from './httpsExample'

export type ScenarioStatus = 'ready' | 'draft' | 'invalid'

export type ScenarioManifestItem = {
  id: string
  title: string
  shortTitle: string
  status: ScenarioStatus
  protocolFamily: string
  description: string
  scenario: JourneyScenario
}

function validateScenario(scenario: JourneyScenario): JourneyScenario {
  return JourneyScenarioSchema.parse(scenario)
}

export const scenarioRegistry: ScenarioManifestItem[] = [
  {
    id: httpsExampleScenario.id,
    title: httpsExampleScenario.title,
    shortTitle: 'HTTPS basic',
    status: 'ready',
    protocolFamily: 'HTTPS / TCP / TLS / DNS',
    description: 'The baseline request/response journey for https://example.com.',
    scenario: validateScenario(httpsExampleScenario),
  },
]

export function getScenarioById(id: string): JourneyScenario {
  return scenarioRegistry.find((item) => item.id === id)?.scenario ?? scenarioRegistry[0].scenario
}

export function getScenarioManifest(id: string): ScenarioManifestItem {
  return scenarioRegistry.find((item) => item.id === id) ?? scenarioRegistry[0]
}

export function validateScenarioRegistry(): { total: number; ready: number; draft: number; invalid: number } {
  return {
    total: scenarioRegistry.length,
    ready: scenarioRegistry.filter((item) => item.status === 'ready').length,
    draft: scenarioRegistry.filter((item) => item.status === 'draft').length,
    invalid: scenarioRegistry.filter((item) => item.status === 'invalid').length,
  }
}
TS

cat > src/features/packet-atlas/scenario-selector/ScenarioSelector.tsx <<'TSX'
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
TSX

python3 <<'PY2'
from pathlib import Path
import re
store=Path('src/features/packet-atlas/store/atlasStore.ts')
text=store.read_text()
if 'selectedScenarioId' not in text:
    text=text.replace('type AtlasState = {', "type AtlasState = {\n  selectedScenarioId: string")
    text=text.replace('setSelectedStageId: (stageId: string) => void', 'setSelectedStageId: (stageId: string) => void\n  setSelectedScenarioId: (scenarioId: string) => void')
    text=text.replace("selectedStageId: 'url-intent',", "selectedStageId: 'url-intent',\n  selectedScenarioId: 'https-example-basic',")
    text=text.replace('setSelectedStageId: (stageId) => set({ selectedStageId: stageId }),', 'setSelectedStageId: (stageId) => set({ selectedStageId: stageId }),\n  setSelectedScenarioId: (scenarioId) => set({ selectedScenarioId: scenarioId }),')
    store.write_text(text)

page=Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text=page.read_text()
text=re.sub(r"import \{ httpsExampleScenario \} from './scenarios/httpsExample'\n", '', text)
if "./scenarios/scenarioRegistry" not in text:
    lines=text.splitlines(); pos=max(i for i,l in enumerate(lines) if l.startswith('import '))+1
    lines.insert(pos, "import { getScenarioById } from './scenarios/scenarioRegistry'")
    lines.insert(pos+1, "import { ScenarioSelector } from './scenario-selector/ScenarioSelector'")
    text='\n'.join(lines)+'\n'
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v2.2',text)
if 'const activeScenario = getScenarioById(selectedScenarioId)' not in text:
    text=text.replace('export function PacketAtlasPage() {', "export function PacketAtlasPage() {\n  const selectedScenarioId = useAtlasStore((state) => state.selectedScenarioId)\n  const activeScenario = getScenarioById(selectedScenarioId)")
text=text.replace('httpsExampleScenario', 'activeScenario')
comp='<ScenarioSelector scenario={activeScenario} />'
if comp not in text:
    text=text.replace('<AssumptionBar scenario={activeScenario} />', '<AssumptionBar scenario={activeScenario} />\n\n      '+comp, 1)
page.write_text(text)
cssp=Path('src/features/packet-atlas/packetAtlas.css')
css=cssp.read_text()
if '/* === Packet Atlas v2.2 Scenario Authoring START === */' not in css:
    css += r'''
/* === Packet Atlas v2.2 Scenario Authoring START === */
.scenario-selector-panel{border:1px solid #1e293b;background:rgba(15,23,42,.76);border-radius:22px;padding:16px;margin-bottom:18px;box-shadow:0 18px 80px rgba(0,0,0,.22)}.scenario-selector__head{display:grid;grid-template-columns:minmax(0,1fr) 130px;gap:16px;align-items:start;margin-bottom:12px}.scenario-selector__eyebrow{margin:0 0 5px;color:#38bdf8;font-weight:900;letter-spacing:.12em;text-transform:uppercase;font-size:.76rem}.scenario-selector__head h2{margin:0 0 8px}.scenario-selector__head p{margin:0;color:#cbd5e1;line-height:1.45}.scenario-selector__count{border:1px solid #334155;border-radius:18px;padding:12px;text-align:center;color:#bae6fd;font-weight:900;background:rgba(2,6,23,.45)}.scenario-selector__list{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}.scenario-card{border:1px solid #334155;background:rgba(2,6,23,.5);color:#e5e7eb;border-radius:16px;padding:12px;text-align:left;cursor:pointer;display:grid;gap:6px}.scenario-card:hover,.scenario-card--active{border-color:#38bdf8;background:#082f49}.scenario-card p{margin:0;color:#cbd5e1;line-height:1.35}.scenario-card small{color:#93c5fd}.scenario-card__status{justify-self:start;border:1px solid #334155;border-radius:999px;padding:4px 8px;font-size:.72rem;font-weight:900;text-transform:uppercase}.scenario-card__status--ready{color:#bbf7d0;border-color:rgba(34,197,94,.5)}.scenario-card__status--draft{color:#fde68a;border-color:rgba(251,191,36,.5)}.scenario-card__status--invalid{color:#fecaca;border-color:rgba(248,113,113,.5)}@media(max-width:760px){.scenario-selector__head{grid-template-columns:1fr}}
/* === Packet Atlas v2.2 Scenario Authoring END === */
'''
    cssp.write_text(css)
PY2

cat > tests/unit/scenarioRegistry.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { getScenarioById, scenarioRegistry, validateScenarioRegistry } from '../../src/features/packet-atlas/scenarios/scenarioRegistry'

describe('scenario registry', () => {
  it('contains the HTTPS baseline scenario', () => {
    expect(scenarioRegistry.some((item) => item.id === 'https-example-basic')).toBe(true)
    expect(getScenarioById('https-example-basic').stages.length).toBeGreaterThan(5)
  })
  it('summarizes registry health', () => {
    const summary = validateScenarioRegistry()
    expect(summary.total).toBeGreaterThanOrEqual(1)
    expect(summary.ready).toBeGreaterThanOrEqual(1)
  })
})
TS

printf '%s\n' '✅ v2.2 applied — Scenario Authoring System.'
printf '%s\n' '🧪 Now run: npm run build && npm test'
