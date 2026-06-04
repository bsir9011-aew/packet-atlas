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
