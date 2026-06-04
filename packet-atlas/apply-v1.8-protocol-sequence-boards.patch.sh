#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '🔁 Applying Packet Atlas v1.8 — Protocol Sequence Boards...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo '❌ Run from inner app folder.'; exit 1; fi
mkdir -p patches/backups/v1.8 src/features/packet-atlas/sequences
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v1.8/PacketAtlasPage.tsx 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/v1.8/packetAtlas.css 2>/dev/null || true
cat > src/features/packet-atlas/sequences/sequenceBoardModel.ts <<'TS'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { getScenarioVariant } from '../variants/scenarioVariants'
export type SequenceItemStatus = 'done' | 'active' | 'future' | 'break' | 'cut-off'
export type SequenceItem = { id: string; label: string; from: string; to: string; payload: string; stageId: string; status: SequenceItemStatus }
const baseSequences: Record<string, Omit<SequenceItem,'status'>[]> = {
  dns:[{id:'dns-1',label:'Query',from:'Client OS',to:'DNS resolver',payload:'Who is example.com?',stageId:'dns-query'},{id:'dns-2',label:'Answer',from:'DNS resolver',to:'Client OS',payload:'203.0.113.10',stageId:'dns-response'}],
  arp:[{id:'arp-1',label:'Who-has',from:'Client OS',to:'LAN broadcast',payload:'Who has gateway IP?',stageId:'arp-gateway'},{id:'arp-2',label:'Local frame',from:'Client NIC',to:'Switch',payload:'Frame to gateway MAC',stageId:'lan-frame'}],
  tcp:[{id:'tcp-1',label:'SYN',from:'Client',to:'Server:443',payload:'Open connection',stageId:'tcp-handshake'},{id:'tcp-2',label:'SYN/ACK',from:'Server:443',to:'Client',payload:'I hear you',stageId:'tcp-handshake'},{id:'tcp-3',label:'ACK',from:'Client',to:'Server:443',payload:'Connection established',stageId:'tcp-handshake'}],
  tls:[{id:'tls-1',label:'ClientHello',from:'Browser',to:'Server edge',payload:'TLS options + SNI/ALPN',stageId:'tls-handshake'},{id:'tls-2',label:'Server flight',from:'Server edge',to:'Browser',payload:'TLS parameters + certificate',stageId:'tls-handshake'},{id:'tls-3',label:'Protected channel',from:'Both endpoints',to:'Both endpoints',payload:'Encrypted application data can begin',stageId:'http-request'}],
  http:[{id:'http-1',label:'GET /',from:'Browser',to:'Reverse proxy',payload:'Request main document',stageId:'http-request'},{id:'http-2',label:'Forward',from:'Reverse proxy',to:'App server',payload:'Route to upstream/app',stageId:'reverse-proxy'},{id:'http-3',label:'Handle',from:'App server',to:'DB/internal',payload:'Create response',stageId:'app-db'},{id:'http-4',label:'200/500 response',from:'Server side',to:'Browser',payload:'Response body/status',stageId:'http-response'}],
}
export function getSequenceKind(stage: JourneyStage): keyof typeof baseSequences { if(stage.stageKind.includes('dns')) return 'dns'; if(stage.stageKind.includes('arp')||stage.stageKind.includes('ethernet')) return 'arp'; if(stage.stageKind.includes('tcp')) return 'tcp'; if(stage.stageKind.includes('tls')) return 'tls'; return 'http' }
function stageIndex(scenario: JourneyScenario, stageId: string) { return scenario.stages.findIndex(s=>s.id===stageId) }
export function buildSequenceBoard(scenario: JourneyScenario, activeStage: JourneyStage, variantId: string): { kind: string; items: SequenceItem[]; breakStageId: string | null } {
  const variant=getScenarioVariant(variantId); const kind=getSequenceKind(activeStage); const activeIndex=stageIndex(scenario,activeStage.id); const breakIndex=variant.breakStageId?stageIndex(scenario,variant.breakStageId):-1
  const items=baseSequences[kind].map(item=>{ const itemIndex=stageIndex(scenario,item.stageId); let status: SequenceItemStatus=item.stageId===activeStage.id?'active':itemIndex<activeIndex?'done':'future'; if(variant.breakStageId===item.stageId) status='break'; else if(breakIndex>=0 && itemIndex>breakIndex) status='cut-off'; return {...item,status} })
  return { kind, items, breakStageId: variant.breakStageId ?? null }
}
TS
cat > src/features/packet-atlas/sequences/ProtocolSequenceBoard.tsx <<'TSX'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { buildSequenceBoard } from './sequenceBoardModel'
type Props = { scenario: JourneyScenario; stage: JourneyStage }
const statusIcon = { done:'✅', active:'🎯', future:'…', break:'🛑', 'cut-off':'⛔' }
export function ProtocolSequenceBoard({ scenario, stage }: Props) {
  const selectedVariantId=useAtlasStore(s=>s.selectedVariantId); const setSelectedStageId=useAtlasStore(s=>s.setSelectedStageId); const board=buildSequenceBoard(scenario,stage,selectedVariantId)
  return <section className="protocol-sequence-board"><div className="panel-heading"><span>Protocol Sequence Board</span><small>{board.kind.toUpperCase()}</small></div><div className="sequence-board__intro"><strong>🔁 Dialog view</strong><p>Map shows where the packet travels. This board shows who talks to whom and in what order.</p></div><div className="sequence-lane">{board.items.map((item,index)=><button key={item.id} className={`sequence-item sequence-item--${item.status}`} onClick={()=>setSelectedStageId(item.stageId)}><span className="sequence-item__number">{String(index+1).padStart(2,'0')}</span><span className="sequence-item__body"><b>{statusIcon[item.status]} {item.label}</b><small>{item.from} → {item.to}</small><em>{item.payload}</em></span></button>)}</div>{board.breakStageId?<div className="sequence-break-note"><strong>🛑 Variant break point</strong><span>Selected failure may stop at <b>{board.breakStageId}</b>.</span></div>:null}</section>
}
TSX
python3 <<'PY'
from pathlib import Path
import re
page=Path('src/features/packet-atlas/PacketAtlasPage.tsx'); text=page.read_text()
if "./sequences/ProtocolSequenceBoard" not in text:
    lines=text.splitlines(); pos=max(i for i,l in enumerate(lines) if l.startswith('import '))+1; lines.insert(pos, "import { ProtocolSequenceBoard } from './sequences/ProtocolSequenceBoard'"); text='\n'.join(lines)+'\n'
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v1.8',text)
comp='<ProtocolSequenceBoard scenario={httpsExampleScenario} stage={activeStage} />'
if comp not in text:
    anchor='<EncapsulationTransformView stage={activeStage} />'
    text=text.replace(anchor, anchor+'\n          '+comp,1) if anchor in text else text.replace('<PacketFieldExplorer stage={activeStage} />','<PacketFieldExplorer stage={activeStage} />\n          '+comp,1)
page.write_text(text)
cssp=Path('src/features/packet-atlas/packetAtlas.css'); css=cssp.read_text()
if '/* === Packet Atlas v1.8 Protocol Sequence Board START === */' not in css:
    css += r'''
/* === Packet Atlas v1.8 Protocol Sequence Board START === */
.protocol-sequence-board{border:1px solid #1e293b;background:rgba(15,23,42,.76);border-radius:22px;overflow:hidden;margin-top:18px;box-shadow:0 18px 80px rgba(0,0,0,.22)}.sequence-board__intro{padding:14px 16px;border-bottom:1px solid #1e293b;display:grid;gap:5px;background:rgba(2,6,23,.42)}.sequence-board__intro p{margin:0;color:#cbd5e1}.sequence-lane{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;padding:14px 16px}.sequence-item{display:flex;gap:10px;text-align:left;border:1px solid #1e293b;border-radius:16px;padding:12px;background:rgba(2,6,23,.52);color:#e5e7eb;cursor:pointer}.sequence-item:hover,.sequence-item--active{border-color:#38bdf8;background:rgba(8,47,73,.52)}.sequence-item--done{border-color:rgba(34,197,94,.28)}.sequence-item--break{border-color:rgba(248,113,113,.75);background:rgba(127,29,29,.25)}.sequence-item--cut-off{opacity:.48}.sequence-item__number{color:#38bdf8;font-weight:900}.sequence-item__body{display:grid;gap:4px}.sequence-item__body small{color:#94a3b8}.sequence-item__body em{color:#cbd5e1;font-style:normal}.sequence-break-note{border-top:1px solid #1e293b;padding:13px 16px;background:rgba(127,29,29,.18);display:grid;gap:5px}.sequence-break-note span{color:#fecaca}
/* === Packet Atlas v1.8 Protocol Sequence Board END === */
'''
    cssp.write_text(css)
PY
cat > tests/unit/sequenceBoardModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildSequenceBoard, getSequenceKind } from '../../src/features/packet-atlas/sequences/sequenceBoardModel'
describe('sequence board model', () => {
  it('selects TCP board for TCP handshake stage', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='tcp-handshake')!; expect(getSequenceKind(stage)).toBe('tcp') })
  it('marks break points in failure variants', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='arp-gateway')!; const board=buildSequenceBoard(httpsExampleScenario,stage,'no-arp-gateway'); expect(board.items.some(i=>i.status==='break')).toBe(true) })
})
TS
printf '%s\n' '✅ v1.8 applied — Protocol Sequence Boards.'
printf '%s\n' '🧪 Now run: npm run build && npm test'
