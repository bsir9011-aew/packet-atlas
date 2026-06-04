import { useMemo, useState } from 'react'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { getHttpProfile, getHttpStages, http2ChangesStage, httpVersionProfiles } from './httpVersionModel'

type Props = { scenario: JourneyScenario; stage: JourneyStage }
export function HttpVersionVariantPanel({ scenario, stage }: Props) {
  const [profileId, setProfileId] = useState(httpVersionProfiles[0].id)
  const setSelectedStageId = useAtlasStore((state)=>state.setSelectedStageId)
  const profile = getHttpProfile(profileId)
  const httpStages = useMemo(()=>getHttpStages(scenario), [scenario])
  const stageChanges = profile.id === 'http2' && http2ChangesStage(stage)
  return <section className="http-version-panel">
    <div className="panel-heading"><span>HTTP Version Variant</span><small>{profile.label}</small></div>
    <div className="http-version__switch">{httpVersionProfiles.map((item)=><button key={item.id} className={item.id===profileId?'http-version-tab http-version-tab--active':'http-version-tab'} onClick={()=>setProfileId(item.id)}>{item.label}</button>)}</div>
    <div className="http-version__grid"><div className="http-version__main"><p className="http-version__eyebrow">Application protocol shape</p><h3>{profile.visibleChange}</h3><div className="http-version__facts"><span>ALPN: <b>{profile.alpn}</b></span><span>{profile.transport}</span><span>{profile.multiplexing}</span></div></div><div className={stageChanges?'http-version__badge http-version__badge--active':'http-version__badge'}>{stageChanges?'active stage changes in HTTP/2':'active stage mostly unchanged'}</div></div>
    <div className="http-version__cards"><article><strong>Request shape</strong><p>{profile.requestShape}</p></article><article><strong>Response shape</strong><p>{profile.responseShape}</p></article></div>
    <div className="http-version__sequence">{profile.sequence.map((step,index)=><div key={step} className="http-version__step"><span>{index+1}</span><p>{step}</p></div>)}</div>
    <div className="http-version__stage-list">{httpStages.map((item)=><button key={item.id} onClick={()=>setSelectedStageId(item.id)} className={item.id===stage.id?'http-stage-pill http-stage-pill--active':'http-stage-pill'}>{item.shortName}</button>)}</div>
  </section>
}
