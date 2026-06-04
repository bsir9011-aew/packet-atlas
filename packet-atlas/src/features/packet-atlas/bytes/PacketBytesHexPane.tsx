import type { JourneyStage } from '../schema/journeyScenarioSchema'
import { buildByteGroups, flattenBytes } from './packetBytesModel'

type Props = { stage: JourneyStage }
function rows(bytes: string[], size=16) { const result: string[][]=[]; for (let i=0;i<bytes.length;i+=size) result.push(bytes.slice(i,i+size)); return result }
export function PacketBytesHexPane({ stage }: Props) {
  const groups = buildByteGroups(stage)
  const all = flattenBytes(groups)
  return <section className="hex-pane-panel">
    <div className="panel-heading"><span>Packet Bytes / Hex Pane Lite</span><small>{all.length ? `${all.length} synthetic bytes` : 'no packet bytes yet'}</small></div>
    <div className="hex-pane__notice"><strong>Educational bytes, not a real capture.</strong><p>This pane shows a synthetic, Wireshark-like byte map so fields can be connected with wrappers. Real fixture bytes come later from TShark exports.</p></div>
    <div className="hex-pane__groups">{groups.map((group)=><article key={group.layer} className="hex-group"><div><strong>{group.layer}</strong><span>{group.label}</span></div><p>{group.meaning}</p><code>{group.bytes.length ? group.bytes.join(' ') : '—'}</code></article>)}</div>
    {all.length ? <div className="hex-pane__table">{rows(all).map((row,index)=><div key={index} className="hex-row"><span>{(index*16).toString(16).padStart(4,'0')}</span><code>{row.join(' ')}</code></div>)}</div> : null}
  </section>
}
