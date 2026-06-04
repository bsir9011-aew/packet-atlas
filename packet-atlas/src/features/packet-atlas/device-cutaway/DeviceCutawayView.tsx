import type { JourneyStage } from '../schema/journeyScenarioSchema'
import { buildDeviceCutaway, summarizeCutaway } from './deviceCutawayModel'

type Props = { stage: JourneyStage }
export function DeviceCutawayView({ stage }: Props) {
  const parts = buildDeviceCutaway(stage)
  return <section className="device-cutaway-panel">
    <div className="panel-heading"><span>Device Cutaway View</span><small>{stage.device.role}</small></div>
    <div className="device-cutaway__hero"><p className="device-cutaway__eyebrow">Inside the active observer</p><h3>{summarizeCutaway(stage)}</h3><p>This panel cuts the active device into functional blocks. It shows what the device can see, what it does with that view and what would be a false assumption.</p></div>
    <div className="device-cutaway__parts">{parts.map((part)=><article key={part.name} className="device-cutaway-card"><strong>{part.name}</strong><div><span>Sees</span><p>{part.sees}</p></div><div><span>Action</span><p>{part.action}</p></div><div><span>Cannot assume</span><p>{part.cannotAssume}</p></div></article>)}</div>
  </section>
}
