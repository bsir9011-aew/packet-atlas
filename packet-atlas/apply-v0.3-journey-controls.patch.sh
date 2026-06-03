#!/usr/bin/env bash
set -euo pipefail

VERSION="v0.3"
echo "🧭 Applying Packet Atlas ${VERSION} — Journey Controls + Lens-Synced Stack..."

if [ ! -f "src/features/packet-atlas/PacketAtlasPage.tsx" ]; then
  echo "❌ Run this from the root of the packet-atlas repo."
  echo "Expected file: src/features/packet-atlas/PacketAtlasPage.tsx"
  exit 1
fi

mkdir -p patches/backups
mkdir -p src/features/packet-atlas/navigation

cp src/features/packet-atlas/PacketAtlasPage.tsx "patches/backups/PacketAtlasPage.before-${VERSION}.tsx"
cp src/features/packet-atlas/layers/EncapsulationStack.tsx "patches/backups/EncapsulationStack.before-${VERSION}.tsx"
cp src/features/packet-atlas/packetAtlas.css "patches/backups/packetAtlas.before-${VERSION}.css"

cat > src/features/packet-atlas/navigation/JourneyControls.tsx <<'TSX'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  scenario: JourneyScenario
}

const directionIcon = {
  request: '➡️',
  response: '⬅️',
  internal: '🔁',
}

export function JourneyControls({ scenario }: Props) {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  const activeIndex = Math.max(
    scenario.stages.findIndex((stage) => stage.id === selectedStageId),
    0,
  )
  const activeStage = scenario.stages[activeIndex]
  const previousStage = scenario.stages[activeIndex - 1]
  const nextStage = scenario.stages[activeIndex + 1]
  const progress = ((activeIndex + 1) / scenario.stages.length) * 100

  return (
    <section className="journey-controls" aria-label="Journey controls">
      <div className="journey-controls__main">
        <button
          className="journey-button"
          type="button"
          disabled={!previousStage}
          onClick={() => previousStage && setSelectedStageId(previousStage.id)}
        >
          ← Previous
        </button>

        <div className="journey-status">
          <div className="journey-status__top">
            <span>
              Stage {activeIndex + 1} / {scenario.stages.length}
            </span>
            <strong>
              {directionIcon[activeStage.direction]} {activeStage.shortName}
            </strong>
          </div>
          <div className="journey-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button
          className="journey-button journey-button--primary"
          type="button"
          disabled={!nextStage}
          onClick={() => nextStage && setSelectedStageId(nextStage.id)}
        >
          Next →
        </button>
      </div>

      <div className="journey-rail" aria-label="Quick stage selector">
        {scenario.stages.map((stage, index) => (
          <button
            key={stage.id}
            type="button"
            className={
              stage.id === selectedStageId
                ? 'journey-dot journey-dot--active'
                : 'journey-dot'
            }
            title={`${index + 1}. ${stage.shortName}`}
            aria-label={`Go to stage ${index + 1}: ${stage.shortName}`}
            onClick={() => setSelectedStageId(stage.id)}
          >
            <span>{index + 1}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
TSX

cat > src/features/packet-atlas/layers/EncapsulationStack.tsx <<'TSX'
import type { JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  stage: JourneyStage
}

type StackItem = {
  key: string
  label: string
  lens: LayerLens
  hint: string
}

const stack: StackItem[] = [
  {
    key: 'human',
    label: 'Human intent',
    lens: 'human',
    hint: 'What the user thinks is happening',
  },
  {
    key: 'http',
    label: 'HTTP / application',
    lens: 'application',
    hint: 'Request, response and application semantics',
  },
  {
    key: 'tls',
    label: 'TLS protection',
    lens: 'tls',
    hint: 'Security wrapper around application data',
  },
  {
    key: 'tcp',
    label: 'TCP / UDP transport',
    lens: 'transport',
    hint: 'Ports, connection state and transport behavior',
  },
  {
    key: 'ip',
    label: 'IP packet',
    lens: 'network',
    hint: 'Source/destination IP and routing view',
  },
  {
    key: 'ethernet',
    label: 'Ethernet frame',
    lens: 'link',
    hint: 'Local MAC-to-MAC delivery',
  },
  {
    key: 'bits',
    label: 'Bits / signal',
    lens: 'physical',
    hint: 'Symbolic physical-medium view',
  },
]

function hasProjection(stage: JourneyStage, key: string) {
  if (key === 'human') return Boolean(stage.representations.human)
  if (key === 'http') return Boolean(stage.representations.http)
  if (key === 'tls') return Boolean(stage.representations.tls)
  if (key === 'tcp') return Boolean(stage.representations.tcp)
  if (key === 'ip') return Boolean(stage.representations.ip)
  if (key === 'ethernet') return Boolean(stage.representations.ethernet)
  return Boolean(stage.representations.bits ?? stage.representations.signal)
}

export function EncapsulationStack({ stage }: Props) {
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedLayerLens = useAtlasStore((state) => state.setSelectedLayerLens)

  return (
    <section className="encapsulation-stack encapsulation-stack--v03">
      <div className="panel-heading">
        <span>Encapsulation Stack</span>
        <small>{stage.direction}</small>
      </div>

      <div className="stack-hint">
        <strong>📦 Same journey, different wrapping</strong>
        <p>
          Kliknij warstwę, żeby zsynchronizować ją z Packet Inspectorem. To nie
          są osobne procesy — to ta sama podróż danych oglądana inną lupą.
        </p>
      </div>

      <div className="stack-list">
        {stack.map((item) => {
          const hasData = hasProjection(stage, item.key)
          const selected = selectedLayerLens === item.lens

          return (
            <button
              key={item.key}
              type="button"
              className={[
                'stack-item',
                hasData ? 'stack-item--active' : '',
                selected ? 'stack-item--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelectedLayerLens(item.lens)}
            >
              <span>
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
              <em>{hasData ? 'visible here' : 'not focused'}</em>
            </button>
          )
        })}
      </div>
    </section>
  )
}
TSX

cat > src/features/packet-atlas/PacketAtlasPage.tsx <<'TSX'
import { httpsExampleScenario } from './scenarios/httpsExample'
import { useAtlasStore } from './store/atlasStore'
import { GlobalJourneyMap } from './map/GlobalJourneyMap'
import { RouteTimeline } from './timeline/RouteTimeline'
import { PacketInspector } from './inspector/PacketInspector'
import { AssumptionBar } from './layers/AssumptionBar'
import { EncapsulationStack } from './layers/EncapsulationStack'
import { JourneyControls } from './navigation/JourneyControls'
import './packetAtlas.css'

export function PacketAtlasPage() {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const activeStage =
    httpsExampleScenario.stages.find((stage) => stage.id === selectedStageId) ??
    httpsExampleScenario.stages[0]

  return (
    <div className="atlas-shell">
      <header className="atlas-header">
        <div>
          <p className="eyebrow">Packet Atlas v0.3</p>
          <h1>{httpsExampleScenario.title}</h1>
          <p>{httpsExampleScenario.description}</p>
        </div>

        <div className="header-badge">
          <span>🧭</span>
          <strong>One journey</strong>
          <small>many lenses</small>
        </div>
      </header>

      <AssumptionBar scenario={httpsExampleScenario} />
      <JourneyControls scenario={httpsExampleScenario} />

      <main className="atlas-layout">
        <section className="map-column">
          <GlobalJourneyMap scenario={httpsExampleScenario} />
          <RouteTimeline scenario={httpsExampleScenario} />
        </section>

        <aside className="inspector-column">
          <PacketInspector stage={activeStage} />
          <EncapsulationStack stage={activeStage} />
        </aside>
      </main>
    </div>
  )
}
TSX

python3 <<'PY'
from pathlib import Path

css_path = Path('src/features/packet-atlas/packetAtlas.css')
css = css_path.read_text()

marker_start = '/* === Packet Atlas v0.3 Journey Controls START === */'
marker_end = '/* === Packet Atlas v0.3 Journey Controls END === */'

if marker_start in css and marker_end in css:
    before = css.split(marker_start)[0].rstrip()
    after = css.split(marker_end, 1)[1].lstrip()
    css = before + '\n\n' + after

v03_css = r'''
/* === Packet Atlas v0.3 Journey Controls START === */

.journey-controls {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.72);
  border-radius: 20px;
  padding: 12px;
  margin-bottom: 18px;
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.22);
}

.journey-controls__main {
  display: grid;
  grid-template-columns: auto minmax(220px, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.journey-button {
  border: 1px solid #334155;
  color: #e5e7eb;
  background: #020617;
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  font-weight: 800;
}

.journey-button:hover:not(:disabled) {
  border-color: #38bdf8;
  background: #082f49;
}

.journey-button--primary {
  border-color: #38bdf8;
  background: #0f2a3a;
}

.journey-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.journey-status {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.journey-status__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.journey-status__top span {
  color: #38bdf8;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.journey-status__top strong {
  color: #f8fafc;
  overflow-wrap: anywhere;
}

.journey-progress {
  width: 100%;
  height: 10px;
  border: 1px solid #1e293b;
  background: #020617;
  border-radius: 999px;
  overflow: hidden;
}

.journey-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #38bdf8, #a78bfa);
}

.journey-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.journey-dot {
  width: 34px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid #334155;
  color: #94a3b8;
  background: #020617;
  cursor: pointer;
  font-weight: 900;
  font-size: 0.75rem;
}

.journey-dot:hover,
.journey-dot--active {
  color: #f8fafc;
  border-color: #38bdf8;
  background: #082f49;
}

.encapsulation-stack--v03 .stack-hint {
  margin: 12px 14px 0;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 12px;
  background: rgba(2, 6, 23, 0.52);
}

.encapsulation-stack--v03 .stack-hint strong {
  color: #bae6fd;
}

.encapsulation-stack--v03 .stack-hint p {
  margin: 6px 0 0;
  color: #cbd5e1;
  line-height: 1.45;
  font-size: 0.9rem;
}

.encapsulation-stack--v03 .stack-item {
  width: 100%;
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.encapsulation-stack--v03 .stack-item:hover {
  border-color: #38bdf8;
  background: rgba(8, 47, 73, 0.42);
}

.encapsulation-stack--v03 .stack-item--selected {
  border-color: #a78bfa;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.13);
}

.encapsulation-stack--v03 .stack-item span {
  display: grid;
  gap: 3px;
}

.encapsulation-stack--v03 .stack-item strong {
  color: inherit;
}

.encapsulation-stack--v03 .stack-item small {
  color: #94a3b8;
  line-height: 1.3;
}

.encapsulation-stack--v03 .stack-item em {
  color: #94a3b8;
  font-style: normal;
  white-space: nowrap;
  font-size: 0.78rem;
}

.encapsulation-stack--v03 .stack-item--active em {
  color: #a7f3d0;
}

@media (max-width: 760px) {
  .journey-controls__main {
    grid-template-columns: 1fr;
  }

  .journey-status__top {
    align-items: flex-start;
    flex-direction: column;
  }
}

/* === Packet Atlas v0.3 Journey Controls END === */
'''

css = css.rstrip() + '\n\n' + v03_css.lstrip()
css_path.write_text(css)
PY

cat > tests/unit/journeyRelations.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('journey relations', () => {
  it('keeps next and previous relations reciprocal', () => {
    const byId = new Map(
      httpsExampleScenario.stages.map((stage) => [stage.id, stage]),
    )

    for (const stage of httpsExampleScenario.stages) {
      for (const nextId of stage.relations.nextIds) {
        const nextStage = byId.get(nextId)
        expect(nextStage, `Missing next stage ${nextId}`).toBeDefined()
        expect(nextStage?.relations.previousIds).toContain(stage.id)
      }

      for (const previousId of stage.relations.previousIds) {
        const previousStage = byId.get(previousId)
        expect(previousStage, `Missing previous stage ${previousId}`).toBeDefined()
        expect(previousStage?.relations.nextIds).toContain(stage.id)
      }
    }
  })
})
TS

echo "✅ v0.3 applied."
echo "🧪 Run: npm run build && npm test"
echo "🚀 Then: npm run dev -- --host 0.0.0.0"
