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
