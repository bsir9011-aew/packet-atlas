#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '🔁 Applying Packet Atlas v2.5 — NAT State Table View...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo '❌ Run this script from the inner Packet Atlas app folder.'; exit 1; fi
mkdir -p patches/backups/v2.5 src/features/packet-atlas/nat tests/unit
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v2.5/PacketAtlasPage.tsx 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/v2.5/packetAtlas.css 2>/dev/null || true

cat > src/features/packet-atlas/nat/natStateModel.ts <<'TS'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type NatStateRow = {
  stageId: string
  stageName: string
  protocol: 'TCP' | 'UDP' | 'unknown'
  insideLocal: string
  insideGlobal: string
  outsideGlobal: string
  state: 'created' | 'used' | 'reverse-translation' | 'none'
  explanation: string
}

function endpoint(ip?: string, port?: number) { return ip ? `${ip}${port ? `:${port}` : ''}` : '—' }
function protocolFor(stage: JourneyStage): NatStateRow['protocol'] {
  if (stage.stageKind.includes('dns')) return 'UDP'
  if (stage.addresses?.dstPort === 443 || stage.addresses?.dstPort === 22 || stage.stageKind.includes('tcp')) return 'TCP'
  return 'unknown'
}

export function buildNatStateRows(scenario: JourneyScenario): NatStateRow[] {
  return scenario.stages
    .filter((stage) => stage.addresses?.natSrcIp || stage.stageKind.includes('nat'))
    .map((stage) => ({
      stageId: stage.id,
      stageName: stage.shortName,
      protocol: protocolFor(stage),
      insideLocal: endpoint(stage.addresses?.srcIp, stage.addresses?.srcPort),
      insideGlobal: endpoint(stage.addresses?.natSrcIp, stage.addresses?.natSrcPort),
      outsideGlobal: endpoint(stage.addresses?.dstIp, stage.addresses?.dstPort),
      state: stage.direction === 'response' ? 'reverse-translation' : stage.addresses?.natSrcIp ? 'created' : 'used',
      explanation: stage.addresses?.natSrcIp
        ? 'The router maps a private source endpoint to a public source endpoint so replies can return.'
        : 'This stage references NAT behavior but has no explicit translated endpoint yet.',
    }))
}

export function getNatRowForStage(scenario: JourneyScenario, stageId: string): NatStateRow | null {
  return buildNatStateRows(scenario).find((row) => row.stageId === stageId) ?? null
}
TS

cat > src/features/packet-atlas/nat/NatStateTableView.tsx <<'TSX'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { buildNatStateRows, getNatRowForStage } from './natStateModel'

type Props = { scenario: JourneyScenario; stage: JourneyStage }

export function NatStateTableView({ scenario, stage }: Props) {
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const rows = buildNatStateRows(scenario)
  const active = getNatRowForStage(scenario, stage.id)
  return <section className="nat-state-panel">
    <div className="panel-heading"><span>NAT State Table</span><small>{rows.length ? `${rows.length} mapped stage${rows.length === 1 ? '' : 's'}` : 'no NAT rows'}</small></div>
    <div className="nat-state__intro"><div><p className="nat-state__eyebrow">Address translation view</p><h3>{active ? `Active mapping: ${active.insideLocal} → ${active.insideGlobal}` : 'No explicit NAT mapping in the active stage'}</h3><p>NAT is not magic. It is a stateful mapping between an inside local endpoint, a translated public endpoint and an outside destination.</p></div><div className="nat-state__badge">{scenario.assumptions.natEnabled ? 'NAT enabled' : 'NAT disabled'}</div></div>
    {rows.length ? <div className="nat-state__table"><div className="nat-state__row nat-state__row--head"><span>Stage</span><span>Protocol</span><span>Inside local</span><span>Inside global</span><span>Outside global</span><span>State</span></div>{rows.map(row=><button key={row.stageId} className={row.stageId===stage.id?'nat-state__row nat-state__row--active':'nat-state__row'} onClick={()=>setSelectedStageId(row.stageId)}><span>{row.stageName}</span><span>{row.protocol}</span><span>{row.insideLocal}</span><span>{row.insideGlobal}</span><span>{row.outsideGlobal}</span><span>{row.state}</span></button>)}</div> : <div className="nat-state__empty"><strong>No NAT mapping found in this scenario.</strong><p>This can happen in local-only or internal-only scenarios.</p></div>}
    {active ? <div className="nat-state__story"><strong>Packet story</strong><p>{active.explanation}</p></div> : null}
  </section>
}
TSX

python3 <<'PY2'
from pathlib import Path
import re
page=Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text=page.read_text()
if "./nat/NatStateTableView" not in text:
    lines=text.splitlines(); pos=max(i for i,l in enumerate(lines) if l.startswith('import '))+1
    lines.insert(pos, "import { NatStateTableView } from './nat/NatStateTableView'")
    text='\n'.join(lines)+'\n'
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v2.5',text)
comp='<NatStateTableView scenario={activeScenario} stage={activeStage} />'
if comp not in text:
    anchor='<FailureVariantBuilder scenario={activeScenario} />'
    text=text.replace(anchor, anchor+'\n\n      '+comp, 1) if anchor in text else text.replace('<VariantFlowDiff scenario={activeScenario} />','<VariantFlowDiff scenario={activeScenario} />\n\n      '+comp,1)
page.write_text(text)
cssp=Path('src/features/packet-atlas/packetAtlas.css')
css=cssp.read_text()
if '/* === Packet Atlas v2.5 NAT State START === */' not in css:
    css += r'''
/* === Packet Atlas v2.5 NAT State START === */
.nat-state-panel{border:1px solid #1e293b;background:rgba(15,23,42,.76);border-radius:22px;overflow:hidden;margin-bottom:18px}.nat-state__intro{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:16px;padding:16px;border-bottom:1px solid #1e293b;background:radial-gradient(circle at top left,rgba(14,165,233,.12),transparent 26rem),rgba(2,6,23,.35)}.nat-state__eyebrow{margin:0 0 6px;color:#38bdf8;font-size:.76rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.nat-state__intro h3{margin:0 0 8px}.nat-state__intro p{margin:0;color:#cbd5e1;line-height:1.45}.nat-state__badge{align-self:center;justify-self:end;border:1px solid rgba(34,197,94,.5);border-radius:999px;padding:10px 12px;color:#bbf7d0;background:rgba(20,83,45,.2);font-weight:900}.nat-state__table{display:grid;padding:12px;gap:6px}.nat-state__row{display:grid;grid-template-columns:1.2fr .7fr 1fr 1fr 1fr 1fr;gap:10px;align-items:center;border:1px solid #1e293b;background:rgba(2,6,23,.5);color:#e5e7eb;border-radius:12px;padding:10px;text-align:left}.nat-state__row--head{color:#94a3b8;background:transparent;font-weight:900;text-transform:uppercase;font-size:.74rem}.nat-state__row--active{border-color:#38bdf8;background:#082f49}.nat-state__story,.nat-state__empty{margin:0 16px 16px;border:1px solid #1e293b;border-radius:16px;padding:12px;background:rgba(2,6,23,.45)}.nat-state__story p,.nat-state__empty p{margin:6px 0 0;color:#cbd5e1}@media(max-width:1050px){.nat-state__row{grid-template-columns:1fr}.nat-state__row--head{display:none}.nat-state__intro{grid-template-columns:1fr}.nat-state__badge{justify-self:start}}
/* === Packet Atlas v2.5 NAT State END === */
'''
    cssp.write_text(css)
PY2

cat > tests/unit/natStateModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildNatStateRows } from '../../src/features/packet-atlas/nat/natStateModel'

describe('NAT state model', () => {
  it('finds translated endpoints in HTTPS baseline', () => {
    const rows = buildNatStateRows(httpsExampleScenario)
    expect(rows.some((row) => row.insideGlobal.includes('198.51.100.2'))).toBe(true)
  })
})
TS

printf '%s\n' '✅ v2.5 applied — NAT State Table View.'
printf '%s\n' '🧪 Now run: npm run build && npm test'
