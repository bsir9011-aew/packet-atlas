import { useMemo, useState } from 'react'
import { httpsExampleScenario } from '../scenarios/httpsExample'
import { useAtlasStore } from '../store/atlasStore'
import { getStagesForPathScope, pathScopes, type PathScopeId } from './pathScopeModel'

export function PathScopeFilter() {
  const [scopeId, setScopeId] = useState<PathScopeId>('all')
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  const activeScope = pathScopes.find((scope) => scope.id === scopeId) ?? pathScopes[0]
  const stages = useMemo(() => getStagesForPathScope(httpsExampleScenario, scopeId), [scopeId])
  const activeStageIsInside = stages.some((stage) => stage.id === selectedStageId)

  return (
    <section className="path-scope-panel" aria-label="Path scope filter">
      <div className="path-scope-panel__heading">
        <div>
          <strong>🧭 Path Scope Filter</strong>
          <p>{activeScope.description}</p>
        </div>
        <span>{stages.length} stages</span>
      </div>

      <div className="path-scope-options">
        {pathScopes.map((scope) => (
          <button
            key={scope.id}
            className={scope.id === scopeId ? 'path-scope-chip path-scope-chip--active' : 'path-scope-chip'}
            onClick={() => setScopeId(scope.id)}
          >
            {scope.label}
          </button>
        ))}
      </div>

      {!activeStageIsInside ? (
        <div className="path-scope-note">
          Current stage is outside this path scope. Jump to one of the visible stages below.
        </div>
      ) : null}

      <div className="path-scope-stage-row">
        {stages.map((stage) => (
          <button
            key={stage.id}
            className={stage.id === selectedStageId ? 'path-stage-pill path-stage-pill--active' : 'path-stage-pill'}
            onClick={() => setSelectedStageId(stage.id)}
          >
            {stage.shortName}
          </button>
        ))}
      </div>
    </section>
  )
}
