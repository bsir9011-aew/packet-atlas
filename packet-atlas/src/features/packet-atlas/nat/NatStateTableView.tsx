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
