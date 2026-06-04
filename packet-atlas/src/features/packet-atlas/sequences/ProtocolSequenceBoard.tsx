import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { buildSequenceBoard } from './sequenceBoardModel'
type Props = { scenario: JourneyScenario; stage: JourneyStage }
const statusIcon = { done:'✅', active:'🎯', future:'…', break:'🛑', 'cut-off':'⛔' }
export function ProtocolSequenceBoard({ scenario, stage }: Props) {
  const selectedVariantId=useAtlasStore(s=>s.selectedVariantId); const setSelectedStageId=useAtlasStore(s=>s.setSelectedStageId); const board=buildSequenceBoard(scenario,stage,selectedVariantId)
  return <section className="protocol-sequence-board"><div className="panel-heading"><span>Protocol Sequence Board</span><small>{board.kind.toUpperCase()}</small></div><div className="sequence-board__intro"><strong>🔁 Dialog view</strong><p>Map shows where the packet travels. This board shows who talks to whom and in what order.</p></div><div className="sequence-lane">{board.items.map((item,index)=><button key={item.id} className={`sequence-item sequence-item--${item.status}`} onClick={()=>setSelectedStageId(item.stageId)}><span className="sequence-item__number">{String(index+1).padStart(2,'0')}</span><span className="sequence-item__body"><b>{statusIcon[item.status]} {item.label}</b><small>{item.from} → {item.to}</small><em>{item.payload}</em></span></button>)}</div>{board.breakStageId?<div className="sequence-break-note"><strong>🛑 Variant break point</strong><span>Selected failure may stop at <b>{board.breakStageId}</b>.</span></div>:null}</section>
}
