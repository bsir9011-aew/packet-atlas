#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '📦 Applying Packet Atlas v1.7 — Encapsulation Transform View...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo '❌ Run from inner app folder.'; exit 1; fi
mkdir -p patches/backups/v1.7 src/features/packet-atlas/encapsulation
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v1.7/PacketAtlasPage.tsx 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/v1.7/packetAtlas.css 2>/dev/null || true
cat > src/features/packet-atlas/encapsulation/encapsulationTransformModel.ts <<'TS'
import type { JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'
export type TransformStep = { id: LayerLens; icon: string; label: string; wrapper: string; visible: boolean; example: string; action: string }
const order: Omit<TransformStep,'visible'>[] = [
  { id:'human', icon:'👤', label:'Human intent', wrapper:'Goal', example:'open https://example.com', action:'starts as intention' },
  { id:'application', icon:'🌐', label:'Application meaning', wrapper:'HTTP/DNS/App', example:'GET / or DNS question', action:'turns goal into protocol semantics' },
  { id:'tls', icon:'🔐', label:'TLS protection', wrapper:'Security wrapper', example:'TLS records / encrypted data', action:'protects application bytes' },
  { id:'transport', icon:'🚚', label:'Transport wrapper', wrapper:'TCP/UDP', example:'ports, stream, flags', action:'identifies endpoint process/flow' },
  { id:'network', icon:'🧭', label:'Network wrapper', wrapper:'IP packet', example:'src IP → dst IP', action:'makes routing possible' },
  { id:'link', icon:'🔌', label:'Local delivery wrapper', wrapper:'Ethernet/Wi‑Fi frame', example:'src MAC → dst MAC', action:'moves across one local hop' },
  { id:'physical', icon:'〰️', label:'Signal view', wrapper:'Bits / symbols', example:'medium-dependent signal', action:'serializes frame into the medium' },
]
export function getTransformSteps(stage: JourneyStage): TransformStep[] { const visible=new Set(stage.layerFocus); const steps=order.map(s=>({...s, visible: visible.has(s.id)})); return stage.direction==='response' ? [...steps].reverse() : steps }
export function getTransformMode(stage: JourneyStage): 'wrap'|'unwrap'|'internal' { if(stage.direction==='response') return 'unwrap'; if(stage.direction==='internal') return 'internal'; return 'wrap' }
export function getTransformHeadline(stage: JourneyStage): string { const mode=getTransformMode(stage); if(mode==='unwrap') return 'Response travels upward: signal becomes useful content again.'; if(mode==='internal') return 'Internal processing: payload changes meaning inside infrastructure.'; return 'Request travels downward: intent gets wrapped for transport.' }
export function getNatTransformNote(stage: JourneyStage): string | null { const a=stage.addresses; if(!a?.natSrcIp && !a?.natSrcPort) return null; return `NAT transform: ${a.srcIp ?? 'source IP'}:${a.srcPort ?? 'source port'} → ${a.natSrcIp ?? 'public IP'}:${a.natSrcPort ?? 'public port'}` }
TS
cat > src/features/packet-atlas/encapsulation/EncapsulationTransformView.tsx <<'TSX'
import type { JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { getNatTransformNote, getTransformHeadline, getTransformMode, getTransformSteps } from './encapsulationTransformModel'

type Props = { stage: JourneyStage }
const modeLabel = { wrap:'Wrapping downward', unwrap:'Unwrapping upward', internal:'Internal transform' }
export function EncapsulationTransformView({ stage }: Props) {
  const selectedLayerLens = useAtlasStore((s) => s.selectedLayerLens)
  const setSelectedLayerLens = useAtlasStore((s) => s.setSelectedLayerLens)
  const steps=getTransformSteps(stage); const mode=getTransformMode(stage); const natNote=getNatTransformNote(stage)
  return <section className="encapsulation-transform-view"><div className="panel-heading"><span>Encapsulation Transform View</span><small>{stage.shortName}</small></div>
    <div className="transform-hero"><div><p className="transform-eyebrow">{modeLabel[mode]}</p><h3>{getTransformHeadline(stage)}</h3><p>Same journey, different wrappers. Click a wrapper to sync the active lens.</p></div><div className="transform-mode-badge">{stage.direction}</div></div>
    <div className="transform-ladder">{steps.map((step,index)=>{const active=step.id===selectedLayerLens; return <button key={step.id} className={['transform-step', step.visible?'transform-step--visible':'transform-step--dim', active?'transform-step--active':''].filter(Boolean).join(' ')} onClick={()=>setSelectedLayerLens(step.id)}><span className="transform-step__index">{String(index+1).padStart(2,'0')}</span><span className="transform-step__body"><b>{step.icon} {step.label}</b><small>{step.wrapper}</small><em>{step.action}</em></span><span className="transform-step__example">{step.example}</span></button>})}</div>
    {natNote ? <div className="transform-nat-note"><strong>🧭 Address rewrite detected</strong><span>{natNote}</span></div> : null}</section>
}
TSX
python3 <<'PY'
from pathlib import Path
import re
page=Path('src/features/packet-atlas/PacketAtlasPage.tsx'); text=page.read_text()
if "./encapsulation/EncapsulationTransformView" not in text:
    lines=text.splitlines(); pos=max(i for i,l in enumerate(lines) if l.startswith('import '))+1; lines.insert(pos, "import { EncapsulationTransformView } from './encapsulation/EncapsulationTransformView'"); text='\n'.join(lines)+'\n'
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v1.7',text)
comp='<EncapsulationTransformView stage={activeStage} />'
if comp not in text:
    for anchor in ['<PacketFieldExplorer stage={activeStage} />','<ProtocolMiniDiagram stage={activeStage} scenario={httpsExampleScenario} />','<StageDeepDiveCards scenario={httpsExampleScenario} stage={activeStage} />','<RouteTimeline scenario={httpsExampleScenario} />']:
        if anchor in text:
            text=text.replace(anchor, anchor+'\n          '+comp,1); break
page.write_text(text)
cssp=Path('src/features/packet-atlas/packetAtlas.css'); css=cssp.read_text()
if '/* === Packet Atlas v1.7 Encapsulation Transform START === */' not in css:
    css += r'''
/* === Packet Atlas v1.7 Encapsulation Transform START === */
.encapsulation-transform-view{border:1px solid #1e293b;background:rgba(15,23,42,.76);border-radius:22px;overflow:hidden;margin-top:18px;box-shadow:0 18px 80px rgba(0,0,0,.22)}.transform-hero{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:16px;padding:16px;border-bottom:1px solid #1e293b;background:radial-gradient(circle at top left,rgba(56,189,248,.12),transparent 24rem),rgba(2,6,23,.38)}.transform-eyebrow{margin:0 0 6px;color:#38bdf8;font-size:.76rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.transform-hero h3{margin:0 0 8px}.transform-hero p{margin:0;color:#cbd5e1;line-height:1.5}.transform-mode-badge{align-self:center;justify-self:end;border:1px solid #334155;border-radius:999px;padding:10px 14px;color:#bae6fd;font-weight:900;background:rgba(2,6,23,.56)}.transform-ladder{display:grid;gap:8px;padding:14px 16px}.transform-step{display:grid;grid-template-columns:42px minmax(0,1fr) minmax(150px,260px);gap:12px;align-items:center;text-align:left;border:1px solid #1e293b;border-radius:16px;padding:11px;background:rgba(2,6,23,.5);color:#e5e7eb;cursor:pointer}.transform-step:hover,.transform-step--active{border-color:#38bdf8;background:rgba(8,47,73,.55)}.transform-step--visible{border-color:rgba(56,189,248,.42)}.transform-step--dim{opacity:.55}.transform-step__index{color:#38bdf8;font-weight:900}.transform-step__body{display:grid;gap:3px}.transform-step__body small{color:#94a3b8}.transform-step__body em{color:#cbd5e1;font-style:normal}.transform-step__example{border:1px solid #334155;border-radius:12px;padding:8px;color:#a7f3d0;background:rgba(2,6,23,.45);overflow-wrap:anywhere}.transform-nat-note{display:grid;gap:5px;border-top:1px solid #1e293b;padding:14px 16px;background:rgba(113,63,18,.16)}.transform-nat-note span{color:#fde68a}@media(max-width:760px){.transform-hero,.transform-step{grid-template-columns:1fr}.transform-mode-badge{justify-self:start}}
/* === Packet Atlas v1.7 Encapsulation Transform END === */
'''
    cssp.write_text(css)
PY
cat > tests/unit/encapsulationTransformModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getTransformMode, getTransformSteps } from '../../src/features/packet-atlas/encapsulation/encapsulationTransformModel'
describe('encapsulation transform model', () => {
  it('wraps request stages downward', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='http-request')!; expect(getTransformMode(stage)).toBe('wrap'); expect(getTransformSteps(stage)[0].id).toBe('human') })
  it('unwraps response stages upward', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='http-response')!; expect(getTransformMode(stage)).toBe('unwrap'); expect(getTransformSteps(stage)[0].id).toBe('physical') })
})
TS
printf '%s\n' '✅ v1.7 applied — Encapsulation Transform View.'
printf '%s\n' '🧪 Now run: npm run build && npm test'
