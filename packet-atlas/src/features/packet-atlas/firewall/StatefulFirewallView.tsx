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
