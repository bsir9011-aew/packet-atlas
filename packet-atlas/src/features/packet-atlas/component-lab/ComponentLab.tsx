import { componentInventory, groupInventoryByArea } from './componentInventory'

const areaLabels: Record<string, string> = {
  journey: '🧭 Journey',
  diagnostics: '🛠️ Diagnostics',
  protocols: '🔁 Protocols',
  internals: '🔬 Internals',
  capture: '🦈 Capture',
  shared: '🧩 Shared',
}

export function ComponentLab() {
  const groups = groupInventoryByArea()

  return (
    <section className="component-lab">
      <div className="panel-heading">
        <span>Component Lab</span>
        <small>{componentInventory.length} cataloged</small>
      </div>
      <div className="component-lab__intro">
        <strong>Storybook-ready inventory, without pulling Storybook into the app yet.</strong>
        <p>Use this as a lightweight catalog while the atlas stabilizes. Full Storybook can come later if the component API settles.</p>
      </div>
      <div className="component-lab__groups">
        {Object.entries(groups).map(([area, items]) => (
          <article key={area} className="component-lab__group">
            <h3>{areaLabels[area] ?? area}</h3>
            <div className="component-lab__items">
              {items.map((item) => (
                <div key={item.name} className="component-lab__item">
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.purpose}</p>
                  </div>
                  <span>{item.stability}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
