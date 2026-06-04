import { useMemo, useState } from 'react'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { dnsResolutionModes, getDnsMode, getDnsStages } from './dnsResolutionModeModel'

type Props = { scenario: JourneyScenario; stage: JourneyStage }

export function DnsResolutionModesPanel({ scenario, stage }: Props) {
  const [modeId, setModeId] = useState(dnsResolutionModes[0].id)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const mode = getDnsMode(modeId)
  const dnsStages = useMemo(() => getDnsStages(scenario), [scenario])
  const isDnsStage = dnsStages.some((item) => item.id === stage.id)
  return <section className="dns-modes-panel">
    <div className="panel-heading"><span>DNS Resolution Modes</span><small>{mode.label}</small></div>
    <div className="dns-modes__tabs">{dnsResolutionModes.map((item)=><button key={item.id} className={item.id===modeId?'dns-mode-tab dns-mode-tab--active':'dns-mode-tab'} onClick={()=>setModeId(item.id)}>{item.label}</button>)}</div>
    <div className="dns-modes__hero"><div><p className="dns-modes__eyebrow">Name resolution variant</p><h3>{mode.effect}</h3><p>{mode.warning}</p></div><div className={isDnsStage?'dns-modes__badge dns-modes__badge--active':'dns-modes__badge'}>{isDnsStage?'active DNS stage':'active stage outside DNS'}</div></div>
    <div className="dns-modes__path">{mode.path.map((step,index)=><div key={step} className="dns-modes__step"><span>{index+1}</span><strong>{step}</strong></div>)}</div>
    <div className="dns-modes__facts"><div><strong>Who can see the name?</strong><p>{mode.visibleNameTo}</p></div><div><strong>Stops before</strong><p>{mode.stopsBefore ?? 'does not stop the baseline flow'}</p></div></div>
    <div className="dns-modes__stage-list">{dnsStages.map((item)=><button key={item.id} onClick={()=>setSelectedStageId(item.id)} className={item.id===stage.id?'dns-stage-pill dns-stage-pill--active':'dns-stage-pill'}>{item.shortName}</button>)}</div>
  </section>
}
