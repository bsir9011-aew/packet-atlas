#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '🧱 Applying Packet Atlas v2.6 — Stateful Firewall View...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo '❌ Run this script from the inner Packet Atlas app folder.'; exit 1; fi
mkdir -p patches/backups/v2.6 src/features/packet-atlas/firewall tests/unit
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v2.6/PacketAtlasPage.tsx 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/v2.6/packetAtlas.css 2>/dev/null || true

cat > src/features/packet-atlas/firewall/firewallStateModel.ts <<'TS'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { getScenarioVariant } from '../variants/scenarioVariants'

export type FirewallDecision = 'allow-new' | 'allow-established' | 'drop' | 'not-applicable'
export type FirewallFlowRow = { stageId: string; stageName: string; tuple: string; direction: string; state: 'NEW' | 'SYN_SENT' | 'ESTABLISHED' | 'DROPPED' | 'N/A'; decision: FirewallDecision; explanation: string }
function tuple(stage: JourneyStage) { const a=stage.addresses; return a?.srcIp && a?.dstIp ? `${a.srcIp}:${a.srcPort ?? '*'} → ${a.dstIp}:${a.dstPort ?? '*'}` : 'no 5-tuple yet' }
export function buildFirewallRows(scenario: JourneyScenario, variantId: string): FirewallFlowRow[] {
  const variant = getScenarioVariant(variantId)
  const tcpBlocked = variant.id === 'tcp-blocked'
  return scenario.stages
    .filter((stage) => stage.layerFocus.includes('transport') || stage.layerFocus.includes('network'))
    .map((stage) => {
      const isBreak = tcpBlocked && stage.id === 'tcp-handshake'
      const isResponse = stage.direction === 'response'
      return {
        stageId: stage.id,
        stageName: stage.shortName,
        tuple: tuple(stage),
        direction: stage.direction,
        state: isBreak ? 'DROPPED' : stage.stageKind.includes('tcp') ? 'SYN_SENT' : isResponse ? 'ESTABLISHED' : stage.addresses?.srcPort ? 'NEW' : 'N/A',
        decision: isBreak ? 'drop' : isResponse ? 'allow-established' : stage.addresses?.srcPort ? 'allow-new' : 'not-applicable',
        explanation: isBreak ? 'Selected variant blocks the TCP setup, so no established flow is created.' : isResponse ? 'Return traffic is allowed because it belongs to an existing tracked conversation.' : 'Firewall can evaluate tuple, direction and policy at this point.',
      }
    })
}
export function summarizeFirewallRows(rows: FirewallFlowRow[]) { return { allowed: rows.filter(r=>r.decision.startsWith('allow')).length, dropped: rows.filter(r=>r.decision==='drop').length, tracked: rows.filter(r=>r.state !== 'N/A').length } }
TS

cat > src/features/packet-atlas/firewall/StatefulFirewallView.tsx <<'TSX'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { buildFirewallRows, summarizeFirewallRows } from './firewallStateModel'

type Props = { scenario: JourneyScenario; stage: JourneyStage }
export function StatefulFirewallView({ scenario, stage }: Props) {
  const selectedVariantId = useAtlasStore((state) => state.selectedVariantId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const rows = buildFirewallRows(scenario, selectedVariantId)
  const summary = summarizeFirewallRows(rows)
  const active = rows.find((row) => row.stageId === stage.id)
  return <section className="firewall-state-panel">
    <div className="panel-heading"><span>Stateful Firewall View</span><small>{selectedVariantId}</small></div>
    <div className="firewall-state__hero"><div><p className="firewall-state__eyebrow">5-tuple and state</p><h3>{active ? `${active.state}: ${active.tuple}` : 'Active stage is above or outside firewall tuple view'}</h3><p>A stateful firewall tracks conversations. Return traffic can be allowed because it matches state created earlier, not because inbound traffic is always open.</p></div><div className="firewall-state__stats"><span>{summary.tracked} tracked</span><span>{summary.allowed} allowed</span><span>{summary.dropped} dropped</span></div></div>
    <div className="firewall-state__table"><div className="firewall-state__row firewall-state__row--head"><span>Stage</span><span>Tuple</span><span>State</span><span>Decision</span></div>{rows.map(row=><button key={row.stageId} className={row.stageId===stage.id?'firewall-state__row firewall-state__row--active':`firewall-state__row firewall-state__row--${row.decision}`} onClick={()=>setSelectedStageId(row.stageId)}><span>{row.stageName}</span><span>{row.tuple}</span><span>{row.state}</span><span>{row.decision}</span></button>)}</div>
    {active ? <div className="firewall-state__story"><strong>Decision story</strong><p>{active.explanation}</p></div> : null}
  </section>
}
TSX

python3 <<'PY2'
from pathlib import Path
import re
page=Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text=page.read_text()
if "./firewall/StatefulFirewallView" not in text:
    lines=text.splitlines(); pos=max(i for i,l in enumerate(lines) if l.startswith('import '))+1
    lines.insert(pos, "import { StatefulFirewallView } from './firewall/StatefulFirewallView'")
    text='\n'.join(lines)+'\n'
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v2.6',text)
comp='<StatefulFirewallView scenario={activeScenario} stage={activeStage} />'
if comp not in text:
    anchor='<NatStateTableView scenario={activeScenario} stage={activeStage} />'
    text=text.replace(anchor, anchor+'\n\n      '+comp, 1) if anchor in text else text.replace('<FailureVariantBuilder scenario={activeScenario} />','<FailureVariantBuilder scenario={activeScenario} />\n\n      '+comp,1)
page.write_text(text)
cssp=Path('src/features/packet-atlas/packetAtlas.css')
css=cssp.read_text()
if '/* === Packet Atlas v2.6 Stateful Firewall START === */' not in css:
    css += r'''
/* === Packet Atlas v2.6 Stateful Firewall START === */
.firewall-state-panel{border:1px solid #1e293b;background:rgba(15,23,42,.76);border-radius:22px;overflow:hidden;margin-bottom:18px}.firewall-state__hero{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:16px;padding:16px;border-bottom:1px solid #1e293b;background:radial-gradient(circle at top left,rgba(248,113,113,.11),transparent 26rem),rgba(2,6,23,.35)}.firewall-state__eyebrow{margin:0 0 6px;color:#38bdf8;font-size:.76rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.firewall-state__hero h3{margin:0 0 8px}.firewall-state__hero p{margin:0;color:#cbd5e1;line-height:1.45}.firewall-state__stats{display:grid;gap:8px;align-self:start}.firewall-state__stats span{border:1px solid #334155;border-radius:12px;padding:8px 10px;background:rgba(2,6,23,.45);font-weight:900;color:#bae6fd}.firewall-state__table{display:grid;padding:12px;gap:6px}.firewall-state__row{display:grid;grid-template-columns:1fr 1.7fr .75fr 1fr;gap:10px;align-items:center;border:1px solid #1e293b;background:rgba(2,6,23,.5);color:#e5e7eb;border-radius:12px;padding:10px;text-align:left}.firewall-state__row--head{color:#94a3b8;background:transparent;font-weight:900;text-transform:uppercase;font-size:.74rem}.firewall-state__row--allow-new,.firewall-state__row--allow-established{border-color:rgba(34,197,94,.22)}.firewall-state__row--drop{border-color:#ef4444;background:rgba(127,29,29,.28)}.firewall-state__row--active{border-color:#38bdf8;background:#082f49}.firewall-state__story{margin:0 16px 16px;border:1px solid #1e293b;border-radius:16px;padding:12px;background:rgba(2,6,23,.45)}.firewall-state__story p{margin:6px 0 0;color:#cbd5e1}@media(max-width:1050px){.firewall-state__row{grid-template-columns:1fr}.firewall-state__row--head{display:none}.firewall-state__hero{grid-template-columns:1fr}}
/* === Packet Atlas v2.6 Stateful Firewall END === */
'''
    cssp.write_text(css)
PY2

cat > tests/unit/firewallStateModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildFirewallRows, summarizeFirewallRows } from '../../src/features/packet-atlas/firewall/firewallStateModel'

describe('stateful firewall model', () => {
  it('builds firewall rows from network or transport stages', () => {
    const rows = buildFirewallRows(httpsExampleScenario, 'happy-path')
    expect(rows.length).toBeGreaterThan(0)
    expect(summarizeFirewallRows(rows).tracked).toBeGreaterThan(0)
  })
  it('marks TCP blocked variant as dropped when available', () => {
    const rows = buildFirewallRows(httpsExampleScenario, 'tcp-blocked')
    expect(rows.some((row) => row.decision === 'drop')).toBe(true)
  })
})
TS

printf '%s\n' '✅ v2.6 applied — Stateful Firewall View.'
printf '%s\n' '🧪 Now run: npm run build && npm test'
