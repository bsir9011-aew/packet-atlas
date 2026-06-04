import { useEffect, useMemo, useState } from 'react'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { getNextStageId, getPreviousStageId, getStageIndex, getTraceProgress, traceSpeedMs, type TraceSpeed } from './cinematicTraceModel'

type Props = { scenario: JourneyScenario; stage: JourneyStage }
export function CinematicTraceMode({ scenario, stage }: Props) {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<TraceSpeed>('normal')
  const setSelectedStageId = useAtlasStore((state)=>state.setSelectedStageId)
  const index = useMemo(()=>getStageIndex(scenario, stage.id), [scenario, stage.id])
  const progress = getTraceProgress(scenario, stage.id)
  useEffect(()=>{
    if (!playing) return
    const timer = window.setInterval(()=>{
      const next = getNextStageId(scenario, stage.id)
      if (next === stage.id) { setPlaying(false); return }
      setSelectedStageId(next)
    }, traceSpeedMs[speed])
    return ()=>window.clearInterval(timer)
  }, [playing, scenario, stage.id, speed, setSelectedStageId])
  return <section className="cinematic-trace-panel">
    <div className="panel-heading"><span>Cinematic Trace Mode</span><small>{playing ? 'playing' : 'paused'}</small></div>
    <div className="cinematic-trace__hero"><div><p className="cinematic-trace__eyebrow">Trace playback</p><h3>{index+1}. {stage.shortName}</h3><p>Step through the same request/response journey like a moving atlas: one active stage at a time, with every panel following the selected node.</p></div><div className="cinematic-trace__meter"><strong>{progress}%</strong><span>{index+1}/{scenario.stages.length}</span></div></div>
    <div className="cinematic-trace__bar"><span style={{width:`${progress}%`}} /></div>
    <div className="cinematic-trace__controls"><button onClick={()=>setSelectedStageId(scenario.stages[0]?.id ?? stage.id)}>Restart</button><button onClick={()=>setSelectedStageId(getPreviousStageId(scenario, stage.id))}>Previous</button><button className="cinematic-trace__play" onClick={()=>setPlaying((value)=>!value)}>{playing ? 'Pause' : 'Play'}</button><button onClick={()=>setSelectedStageId(getNextStageId(scenario, stage.id))}>Next</button><select value={speed} onChange={(event)=>setSpeed(event.target.value as TraceSpeed)}><option value="slow">slow</option><option value="normal">normal</option><option value="fast">fast</option></select></div>
    <div className="cinematic-trace__rail">{scenario.stages.map((item,idx)=><button key={item.id} onClick={()=>setSelectedStageId(item.id)} className={item.id===stage.id?'cinematic-dot cinematic-dot--active':'cinematic-dot'} title={item.shortName}>{idx+1}</button>)}</div>
  </section>
}
