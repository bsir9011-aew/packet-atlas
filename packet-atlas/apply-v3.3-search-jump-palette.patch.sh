#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this patch from /workspaces/packet-atlas/packet-atlas"
  exit 1
fi

echo "🔎 Applying Packet Atlas v3.3 — Search & Jump Palette..."
mkdir -p patches/backups src/features/packet-atlas/search tests/unit
[ -f src/features/packet-atlas/PacketAtlasPage.tsx ] && cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/PacketAtlasPage.before-v3.3.tsx
[ -f src/features/packet-atlas/packetAtlas.css ] && cp src/features/packet-atlas/packetAtlas.css patches/backups/packetAtlas.before-v3.3.css

cat > src/features/packet-atlas/search/searchIndex.ts <<'TS'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type StageSearchResult = {
  stageId: string
  label: string
  direction: JourneyStage['direction']
  deviceRole: JourneyStage['device']['role']
  layers: string[]
  haystack: string
}

function normalize(value: unknown) {
  return String(value ?? '').toLowerCase()
}

export function buildStageSearchIndex(scenario: JourneyScenario): StageSearchResult[] {
  return scenario.stages.map((stage) => {
    const addressValues = stage.addresses ? Object.values(stage.addresses) : []
    const copyValues = Object.values(stage.copy)
    const projectionValues = Object.values(stage.representations).flatMap((projection) =>
      projection ? Object.values(projection) : [],
    )

    const haystack = [
      stage.id,
      stage.shortName,
      stage.stageKind,
      stage.direction,
      stage.device.role,
      stage.device.nodeId,
      stage.payloadRef,
      ...stage.layerFocus,
      ...addressValues,
      ...copyValues,
      ...projectionValues,
    ]
      .map(normalize)
      .join(' ')

    return {
      stageId: stage.id,
      label: stage.shortName,
      direction: stage.direction,
      deviceRole: stage.device.role,
      layers: [...stage.layerFocus],
      haystack,
    }
  })
}

export function searchStages(
  index: StageSearchResult[],
  query: string,
  limit = 8,
): StageSearchResult[] {
  const normalized = normalize(query).trim()
  if (!normalized) return index.slice(0, limit)

  const terms = normalized.split(/\s+/).filter(Boolean)
  return index
    .filter((result) => terms.every((term) => result.haystack.includes(term)))
    .slice(0, limit)
}
TS

cat > src/features/packet-atlas/search/SearchJumpPalette.tsx <<'TSX'
import { useEffect, useMemo, useRef, useState } from 'react'
import { httpsExampleScenario } from '../scenarios/httpsExample'
import { useAtlasStore } from '../store/atlasStore'
import { buildStageSearchIndex, searchStages } from './searchIndex'

export function SearchJumpPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)

  const index = useMemo(() => buildStageSearchIndex(httpsExampleScenario), [])
  const results = useMemo(() => searchStages(index, query, 10), [index, query])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isPaletteShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
      if (isPaletteShortcut) {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  function jumpTo(stageId: string) {
    setSelectedStageId(stageId)
    setOpen(false)
    setQuery('')
  }

  return (
    <section className="search-palette-shell" aria-label="Search and jump palette">
      <button className="search-palette-trigger" onClick={() => setOpen(true)}>
        <span>🔎 Search atlas</span>
        <kbd>Ctrl K</kbd>
      </button>

      {open ? (
        <div className="search-palette-backdrop" onClick={() => setOpen(false)}>
          <div className="search-palette" onClick={(event) => event.stopPropagation()}>
            <div className="search-palette__input-row">
              <span>🔎</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search stage, device, protocol, port, IP, field…"
              />
              <kbd>Esc</kbd>
            </div>

            <div className="search-palette__results">
              {results.map((result) => (
                <button
                  key={result.stageId}
                  className={
                    result.stageId === selectedStageId
                      ? 'search-result search-result--active'
                      : 'search-result'
                  }
                  onClick={() => jumpTo(result.stageId)}
                >
                  <strong>{result.label}</strong>
                  <span>
                    {result.direction} · {result.deviceRole} · {result.layers.join(' / ')}
                  </span>
                </button>
              ))}

              {results.length === 0 ? (
                <p className="search-palette__empty">No matching stage found.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
TSX

python3 <<'PY'
from pathlib import Path
import re

page = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text = page.read_text()
text = re.sub(r'Packet Atlas v\d+\.\d+', 'Packet Atlas v3.3', text)
if "./search/SearchJumpPalette" not in text:
    # Place after local CSS import if possible.
    text = text.replace("import './packetAtlas.css'", "import './packetAtlas.css'\nimport { SearchJumpPalette } from './search/SearchJumpPalette'", 1)
if '<SearchJumpPalette />' not in text:
    if '</header>' in text:
        text = text.replace('</header>', '</header>\n\n      <SearchJumpPalette />', 1)
    else:
        text = text.replace('<main className="atlas-layout">', '<SearchJumpPalette />\n\n      <main className="atlas-layout">', 1)
page.write_text(text)

css_path = Path('src/features/packet-atlas/packetAtlas.css')
css = css_path.read_text()
if '/* === Packet Atlas v3.3 Search START === */' not in css:
    css += r'''

/* === Packet Atlas v3.3 Search START === */
.search-palette-shell {
  margin: 0 0 14px;
}

.search-palette-trigger {
  width: 100%;
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.76);
  color: #e5e7eb;
  border-radius: 18px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.search-palette-trigger:hover {
  border-color: #38bdf8;
  background: rgba(8, 47, 73, 0.65);
}

.search-palette-trigger kbd,
.search-palette__input-row kbd {
  border: 1px solid #334155;
  background: #020617;
  color: #94a3b8;
  border-radius: 8px;
  padding: 4px 7px;
  font-size: 0.78rem;
}

.search-palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: start center;
  padding-top: 9vh;
  background: rgba(2, 6, 23, 0.62);
  backdrop-filter: blur(8px);
}

.search-palette {
  width: min(760px, calc(100vw - 32px));
  border: 1px solid #334155;
  background: #020617;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 30px 120px rgba(0, 0, 0, 0.55);
}

.search-palette__input-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 14px;
  border-bottom: 1px solid #1e293b;
}

.search-palette__input-row input {
  width: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  color: #f8fafc;
  font: inherit;
}

.search-palette__results {
  max-height: min(520px, 60vh);
  overflow: auto;
  padding: 10px;
  display: grid;
  gap: 8px;
}

.search-result {
  text-align: left;
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.72);
  color: #e5e7eb;
  border-radius: 14px;
  padding: 11px 12px;
  display: grid;
  gap: 5px;
  cursor: pointer;
}

.search-result:hover,
.search-result--active {
  border-color: #38bdf8;
  background: rgba(8, 47, 73, 0.76);
}

.search-result span,
.search-palette__empty {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
}
/* === Packet Atlas v3.3 Search END === */
'''
    css_path.write_text(css)
PY

cat > tests/unit/searchIndex.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildStageSearchIndex, searchStages } from '../../src/features/packet-atlas/search/searchIndex'

describe('search index', () => {
  it('finds stages by protocol and port', () => {
    const index = buildStageSearchIndex(httpsExampleScenario)
    expect(searchStages(index, '443').length).toBeGreaterThan(0)
    expect(searchStages(index, 'DNS')[0].label.toLowerCase()).toContain('dns')
  })

  it('returns initial suggestions for an empty query', () => {
    const index = buildStageSearchIndex(httpsExampleScenario)
    expect(searchStages(index, '', 3)).toHaveLength(3)
  })
})
TS

echo "✅ v3.3 applied — Search & Jump Palette."
echo "🧪 Now run: npm run build && npm test"
