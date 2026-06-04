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
