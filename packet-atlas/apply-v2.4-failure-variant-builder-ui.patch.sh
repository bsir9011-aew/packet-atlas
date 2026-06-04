#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '⚠️ Applying Packet Atlas v2.4 — Failure Variant Builder UI...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo '❌ Run this script from the inner Packet Atlas app folder.'; exit 1; fi
mkdir -p patches/backups/v2.4 src/features/packet-atlas/failure-builder tests/unit
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v2.4/PacketAtlasPage.tsx 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/v2.4/packetAtlas.css 2>/dev/null || true

cat > src/features/packet-atlas/failure-builder/failureBuilderModel.ts <<'TS'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
export type DraftFailureKind = 'timeout' | 'blocked' | 'bad-response' | 'identity-failure' | 'local-resolution-failure'
export type DraftFailure = { title: string; kind: DraftFailureKind; breakStageId: string; affectedStageIds: string[]; symptom: string; rootCause: string; observable: string }
export type DraftFailureRow = { stageId: string; shortName: string; status: 'stable' | 'affected' | 'break' | 'cut-off' }
export function buildDraftFailureTrace(scenario: JourneyScenario, draft: DraftFailure): DraftFailureRow[] {
  const breakIndex = scenario.stages.findIndex((stage) => stage.id === draft.breakStageId)
  const affected = new Set(draft.affectedStageIds)
  return scenario.stages.map((stage, index) => {
    if (stage.id === draft.breakStageId) return { stageId: stage.id, shortName: stage.shortName, status: 'break' }
    if (breakIndex >= 0 && index > breakIndex) return { stageId: stage.id, shortName: stage.shortName, status: 'cut-off' }
    if (affected.has(stage.id)) return { stageId: stage.id, shortName: stage.shortName, status: 'affected' }
    return { stageId: stage.id, shortName: stage.shortName, status: 'stable' }
  })
}
export function exportDraftFailure(draft: DraftFailure): string { return JSON.stringify(draft, null, 2) }
TS

cat > src/features/packet-atlas/failure-builder/FailureVariantBuilder.tsx <<'TSX'
import { useMemo, useState } from 'react'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { buildDraftFailureTrace, exportDraftFailure, type DraftFailure, type DraftFailureKind } from './failureBuilderModel'

type Props = { scenario: JourneyScenario }
const kinds: DraftFailureKind[] = ['timeout', 'blocked', 'bad-response', 'identity-failure', 'local-resolution-failure']

export function FailureVariantBuilder({ scenario }: Props) {
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const [expanded, setExpanded] = useState(false)
  const [breakStageId, setBreakStageId] = useState(scenario.stages[3]?.id ?? scenario.stages[0]?.id ?? '')
  const [kind, setKind] = useState<DraftFailureKind>('blocked')
  const [affectedStageIds, setAffectedStageIds] = useState<string[]>(breakStageId ? [breakStageId] : [])
  const draft: DraftFailure = { title:`Draft failure at ${breakStageId}`, kind, breakStageId, affectedStageIds, symptom:'User-visible failure depends on the break point.', rootCause:'Temporary local draft — not saved to scenario registry.', observable:'Use this to preview where the flow would break.' }
  const rows = useMemo(() => buildDraftFailureTrace(scenario, draft), [scenario, draft.breakStageId, draft.kind, draft.affectedStageIds.join('|')])
  const counts = { affected: rows.filter(r=>r.status==='affected').length, cutOff: rows.filter(r=>r.status==='cut-off').length }
  return <section className="failure-builder-panel">
    <div className="panel-heading"><span>Failure Variant Builder</span><small>temporary draft</small></div>
    <div className="failure-builder__body"><div className="failure-builder__controls"><label>Break stage<select value={breakStageId} onChange={(event)=>{setBreakStageId(event.target.value); setAffectedStageIds([event.target.value]); setSelectedStageId(event.target.value)}}>{scenario.stages.map(stage=><option key={stage.id} value={stage.id}>{stage.shortName}</option>)}</select></label><label>Failure kind<select value={kind} onChange={(event)=>setKind(event.target.value as DraftFailureKind)}>{kinds.map(k=><option key={k} value={k}>{k}</option>)}</select></label><button onClick={()=>setExpanded(!expanded)}>{expanded ? 'Hide draft JSON' : 'Show draft JSON'}</button></div><div className="failure-builder__summary"><span>{counts.affected} affected</span><span>{counts.cutOff} cut off</span><span>{breakStageId} breaks</span></div><div className="failure-builder__rail">{rows.map(row=><button key={row.stageId} className={`failure-builder__node failure-builder__node--${row.status}`} onClick={()=>setSelectedStageId(row.stageId)}><strong>{row.shortName}</strong><small>{row.status}</small></button>)}</div><div className="failure-builder__affected"><strong>Affected before break:</strong><div>{scenario.stages.map(stage=><button key={stage.id} className={affectedStageIds.includes(stage.id)?'failure-builder__pill failure-builder__pill--active':'failure-builder__pill'} onClick={()=>setAffectedStageIds((current)=>current.includes(stage.id)?current.filter(id=>id!==stage.id):[...current,stage.id])}>{stage.shortName}</button>)}</div></div>{expanded ? <pre className="failure-builder__json">{exportDraftFailure(draft)}</pre> : null}</div>
  </section>
}
TSX

python3 <<'PY2'
from pathlib import Path
import re
page=Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text=page.read_text()
if "./failure-builder/FailureVariantBuilder" not in text:
    lines=text.splitlines(); pos=max(i for i,l in enumerate(lines) if l.startswith('import '))+1
    lines.insert(pos, "import { FailureVariantBuilder } from './failure-builder/FailureVariantBuilder'")
    text='\n'.join(lines)+'\n'
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v2.4',text)
comp='<FailureVariantBuilder scenario={activeScenario} />'
if comp not in text:
    anchor='<ScenarioVariantPanel scenario={activeScenario} />'
    text=text.replace(anchor, anchor+'\n\n      '+comp, 1) if anchor in text else text.replace('<ScenarioSelector scenario={activeScenario} />','<ScenarioSelector scenario={activeScenario} />\n\n      '+comp,1)
page.write_text(text)
cssp=Path('src/features/packet-atlas/packetAtlas.css')
css=cssp.read_text()
if '/* === Packet Atlas v2.4 Failure Builder START === */' not in css:
    css += r'''
/* === Packet Atlas v2.4 Failure Builder START === */
.failure-builder-panel{border:1px solid #1e293b;background:rgba(15,23,42,.76);border-radius:22px;overflow:hidden;margin-bottom:18px}.failure-builder__body{padding:14px 16px;display:grid;gap:12px}.failure-builder__controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.failure-builder__controls label{display:grid;gap:6px;color:#94a3b8;font-size:.8rem;font-weight:900}.failure-builder__controls select,.failure-builder__controls button{border:1px solid #334155;background:#020617;color:#e5e7eb;border-radius:12px;padding:10px}.failure-builder__summary{display:flex;flex-wrap:wrap;gap:8px}.failure-builder__summary span{border:1px solid #334155;border-radius:999px;padding:7px 10px;color:#bae6fd;background:rgba(2,6,23,.45);font-weight:900}.failure-builder__rail{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}.failure-builder__node{border:1px solid #334155;background:rgba(2,6,23,.5);color:#e5e7eb;border-radius:14px;padding:9px;text-align:left;display:grid;gap:4px;cursor:pointer}.failure-builder__node--affected{border-color:#f59e0b}.failure-builder__node--break{border-color:#ef4444;background:rgba(127,29,29,.28)}.failure-builder__node--cut-off{opacity:.48}.failure-builder__node small{color:#94a3b8}.failure-builder__affected{border:1px solid #1e293b;border-radius:16px;padding:12px;background:rgba(2,6,23,.42)}.failure-builder__affected div{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px}.failure-builder__pill{border:1px solid #334155;background:rgba(15,23,42,.7);color:#cbd5e1;border-radius:999px;padding:7px 9px;cursor:pointer}.failure-builder__pill--active{border-color:#f59e0b;color:#fde68a}.failure-builder__json{margin:0;border:1px solid #1e293b;border-radius:16px;background:#020617;color:#a7f3d0;padding:14px;overflow:auto}@media(max-width:850px){.failure-builder__controls{grid-template-columns:1fr}}
/* === Packet Atlas v2.4 Failure Builder END === */
'''
    cssp.write_text(css)
PY2

cat > tests/unit/failureBuilderModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildDraftFailureTrace } from '../../src/features/packet-atlas/failure-builder/failureBuilderModel'

describe('failure builder model', () => {
  it('cuts off stages after break point', () => {
    const rows = buildDraftFailureTrace(httpsExampleScenario, { title:'x', kind:'blocked', breakStageId:'arp-gateway', affectedStageIds:['lan-frame'], symptom:'x', rootCause:'x', observable:'x' })
    expect(rows.find((row) => row.stageId === 'arp-gateway')?.status).toBe('break')
    expect(rows.filter((row) => row.status === 'cut-off').length).toBeGreaterThan(0)
  })
})
TS

printf '%s\n' '✅ v2.4 applied — Failure Variant Builder UI.'
printf '%s\n' '🧪 Now run: npm run build && npm test'
