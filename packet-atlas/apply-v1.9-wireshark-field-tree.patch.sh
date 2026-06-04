#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '🦈 Applying Packet Atlas v1.9 — Wireshark-style Field Tree...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo '❌ Run from inner app folder.'; exit 1; fi
mkdir -p patches/backups/v1.9 src/features/packet-atlas/field-tree
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v1.9/PacketAtlasPage.tsx 2>/dev/null || true
cp src/features/packet-atlas/packetAtlas.css patches/backups/v1.9/packetAtlas.css 2>/dev/null || true
cat > src/features/packet-atlas/field-tree/fieldTreeModel.ts <<'TS'
import type { JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'
export type FieldTreeNode = { id: string; label: string; lens: LayerLens; value?: string; children: FieldTreeNode[] }
function value(v: unknown): string | undefined { if(v===undefined||v===null||v==='') return undefined; if(Array.isArray(v)) return v.join(', '); if(typeof v==='object') return JSON.stringify(v); return String(v) }
function node(id:string,label:string,lens:LayerLens,val?:unknown,children:FieldTreeNode[]=[]):FieldTreeNode { return {id,label,lens,value:value(val),children} }
export function buildFieldTree(stage: JourneyStage): FieldTreeNode[] { const a=stage.addresses??{}; const reps=stage.representations; const tree: FieldTreeNode[]=[]
  tree.push(node('human','Human interpretation','human',undefined,[node('human-visible','Visible meaning','human',reps.human?.label??stage.copy.whatUserSees),node('human-trap','Common trap','human',stage.copy.easyToConfuse)]))
  if(reps.http||stage.layerFocus.includes('application')) tree.push(node('application','Application / HTTP / DNS','application',undefined,[node('app-summary','Application meaning','application',stage.copy.samePayloadHereLooksLike),...Object.entries(reps.http??{}).map(([k,v])=>node(`http-${k}`,k,'application',v))]))
  if(reps.tls||stage.layerFocus.includes('tls')) tree.push(node('tls','TLS','tls',undefined,[node('tls-purpose','Purpose','tls','Security wrapper / protected channel'),...Object.entries(reps.tls??{}).map(([k,v])=>node(`tls-${k}`,k,'tls',v))]))
  if(reps.tcp||a.srcPort||a.dstPort||stage.layerFocus.includes('transport')) tree.push(node('transport','TCP / UDP','transport',undefined,[node('src-port','Source port','transport',a.srcPort),node('dst-port','Destination port','transport',a.dstPort),node('nat-src-port','NAT source port','transport',a.natSrcPort),...Object.entries(reps.tcp??{}).map(([k,v])=>node(`tcp-${k}`,k,'transport',v))]))
  if(reps.ip||a.srcIp||a.dstIp||stage.layerFocus.includes('network')) tree.push(node('network','IPv4 packet','network',undefined,[node('src-ip','Source IP','network',a.srcIp),node('dst-ip','Destination IP','network',a.dstIp),node('nat-src-ip','NAT source IP','network',a.natSrcIp),...Object.entries(reps.ip??{}).map(([k,v])=>node(`ip-${k}`,k,'network',v))]))
  if(reps.ethernet||a.srcMac||a.dstMac||stage.layerFocus.includes('link')) tree.push(node('link','Ethernet / local link','link',undefined,[node('src-mac','Source MAC','link',a.srcMac),node('dst-mac','Destination MAC','link',a.dstMac),...Object.entries(reps.ethernet??{}).map(([k,v])=>node(`eth-${k}`,k,'link',v))]))
  if(reps.bits||reps.signal||stage.layerFocus.includes('physical')) tree.push(node('physical','Bits / signal','physical',undefined,[...Object.entries(reps.bits??{}).map(([k,v])=>node(`bits-${k}`,k,'physical',v)),...Object.entries(reps.signal??{}).map(([k,v])=>node(`signal-${k}`,k,'physical',v))]))
  return tree }
export function countTreeNodes(nodes: FieldTreeNode[]): number { return nodes.reduce((sum,n)=>sum+1+countTreeNodes(n.children),0) }
TS
cat > src/features/packet-atlas/field-tree/WiresharkFieldTree.tsx <<'TSX'
import type { CSSProperties } from 'react'
import type { FieldTreeNode } from './fieldTreeModel'
import type { JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { buildFieldTree, countTreeNodes } from './fieldTreeModel'
type Props = { stage: JourneyStage }
function TreeNode({ node, level }: { node: FieldTreeNode; level: number }) {
  const selectedLayerLens=useAtlasStore(s=>s.selectedLayerLens); const setSelectedLayerLens=useAtlasStore(s=>s.setSelectedLayerLens); const active=node.lens===selectedLayerLens; const hasChildren=node.children.length>0
  return <div className="field-tree-node" style={{'--tree-level': level} as CSSProperties}><button className={active?'field-tree-row field-tree-row--active':'field-tree-row'} onClick={()=>setSelectedLayerLens(node.lens)}><span className="field-tree-row__chevron">{hasChildren?'▾':'•'}</span><span className="field-tree-row__label">{node.label}</span><span className="field-tree-row__lens">{node.lens}</span>{node.value?<code>{node.value}</code>:null}</button>{hasChildren?<div className="field-tree-children">{node.children.map(child=><TreeNode key={child.id} node={child} level={level+1}/>)}</div>:null}</div>
}
export function WiresharkFieldTree({ stage }: Props) { const tree=buildFieldTree(stage); const count=countTreeNodes(tree); return <section className="wireshark-field-tree"><div className="panel-heading"><span>Wireshark-style Field Tree</span><small>{count} nodes</small></div><div className="field-tree-intro"><strong>🦈 Packet details without drowning in hex</strong><p>Expand the mental stack as a tree. Click a branch to sync the active lens.</p></div><div className="field-tree-body">{tree.map(node=><TreeNode key={node.id} node={node} level={0}/>)}</div></section> }
TSX
python3 <<'PY'
from pathlib import Path
import re
page=Path('src/features/packet-atlas/PacketAtlasPage.tsx'); text=page.read_text()
if "./field-tree/WiresharkFieldTree" not in text:
    lines=text.splitlines(); pos=max(i for i,l in enumerate(lines) if l.startswith('import '))+1; lines.insert(pos, "import { WiresharkFieldTree } from './field-tree/WiresharkFieldTree'"); text='\n'.join(lines)+'\n'
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v1.9',text)
comp='<WiresharkFieldTree stage={activeStage} />'
if comp not in text:
    anchor='<ProtocolSequenceBoard scenario={httpsExampleScenario} stage={activeStage} />'
    text=text.replace(anchor, anchor+'\n          '+comp,1) if anchor in text else text.replace('<PacketFieldExplorer stage={activeStage} />','<PacketFieldExplorer stage={activeStage} />\n          '+comp,1)
page.write_text(text)
cssp=Path('src/features/packet-atlas/packetAtlas.css'); css=cssp.read_text()
if '/* === Packet Atlas v1.9 Wireshark Field Tree START === */' not in css:
    css += r'''
/* === Packet Atlas v1.9 Wireshark Field Tree START === */
.wireshark-field-tree{border:1px solid #1e293b;background:rgba(15,23,42,.76);border-radius:22px;overflow:hidden;margin-top:18px;box-shadow:0 18px 80px rgba(0,0,0,.22)}.field-tree-intro{padding:14px 16px;border-bottom:1px solid #1e293b;background:rgba(2,6,23,.42)}.field-tree-intro p{margin:6px 0 0;color:#cbd5e1;line-height:1.45}.field-tree-body{padding:12px 16px 16px;display:grid;gap:6px}.field-tree-node{--tree-level:0}.field-tree-row{width:100%;display:grid;grid-template-columns:24px minmax(0,1fr) 110px minmax(160px,.7fr);gap:8px;align-items:center;text-align:left;border:1px solid #1e293b;border-radius:12px;padding:8px 10px;padding-left:calc(10px + (var(--tree-level) * 18px));background:rgba(2,6,23,.52);color:#e5e7eb;cursor:pointer}.field-tree-row:hover,.field-tree-row--active{border-color:#38bdf8;background:rgba(8,47,73,.5)}.field-tree-row__chevron{color:#38bdf8;font-weight:900}.field-tree-row__label{font-weight:900;overflow-wrap:anywhere}.field-tree-row__lens{color:#93c5fd;font-size:.78rem;font-weight:900}.field-tree-row code{color:#a7f3d0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.field-tree-children{margin-top:6px;display:grid;gap:6px}@media(max-width:850px){.field-tree-row{grid-template-columns:24px 1fr}.field-tree-row__lens,.field-tree-row code{grid-column:2}}
/* === Packet Atlas v1.9 Wireshark Field Tree END === */
'''
    cssp.write_text(css)
PY
cat > tests/unit/fieldTreeModel.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildFieldTree, countTreeNodes } from '../../src/features/packet-atlas/field-tree/fieldTreeModel'
describe('field tree model', () => {
  it('builds network and transport branches for DNS query', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='dns-query')!; const tree=buildFieldTree(stage); expect(tree.some(n=>n.id==='network')).toBe(true); expect(tree.some(n=>n.id==='transport')).toBe(true); expect(countTreeNodes(tree)).toBeGreaterThan(tree.length) })
})
TS
printf '%s\n' '✅ v1.9 applied — Wireshark-style Field Tree.'
printf '%s\n' '🧪 Now run: npm run build && npm test'
