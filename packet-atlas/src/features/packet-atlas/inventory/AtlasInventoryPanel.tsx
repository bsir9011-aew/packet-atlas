import { buildAtlasInventorySummary } from './atlasInventoryModel'

export function AtlasInventoryPanel() {
  const summary = buildAtlasInventorySummary()
  return <section className="atlas-inventory-panel" aria-label="Atlas inventory">
    <div className="atlas-inventory__header"><div><p className="atlas-inventory__eyebrow">Project map</p><h3>{summary.title}</h3><p>{summary.subtitle}</p></div><div className="atlas-inventory__count"><strong>{summary.itemCount}</strong><span>tracked parts</span></div></div>
    <div className="atlas-inventory__proof">🧠 {summary.strongestProof}</div>
    <div className="atlas-inventory__groups">{Object.entries(summary.groups).map(([workspace, items]) => <div key={workspace} className="atlas-inventory__group"><h4>{workspace}</h4><ul>{items.map((item) => <li key={item.id}><span data-status={item.status}>{item.status}</span><strong>{item.label}</strong><small>{item.whyItMatters}</small></li>)}</ul></div>)}</div>
  </section>
}
