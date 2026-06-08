import type { AtlasWorkspaceDefinition } from '../workspace/workspaceModel'
import { buildAtlasOrientationSummary } from './atlasOrientationModel'

type Props = {
  currentWorkspace: AtlasWorkspaceDefinition
  workspaces: AtlasWorkspaceDefinition[]
}

export function AtlasOrientationPanel({ currentWorkspace, workspaces }: Props) {
  const orientation = buildAtlasOrientationSummary(currentWorkspace)

  return (
    <section className="atlas-orientation-panel" aria-label="Atlas orientation">
      <div className="atlas-orientation__hero">
        <div>
          <p className="atlas-orientation__eyebrow">Start here</p>
          <h3>{orientation.title}</h3>
          <p>{orientation.subtitle}</p>
        </div>
        <div className="atlas-orientation__current">
          <span>Current workspace</span>
          <strong>
            {currentWorkspace.icon} {currentWorkspace.label}
          </strong>
        </div>
      </div>

      <div className="atlas-orientation__bridge">
        <strong>🧪 Lab vs app</strong>
        <p>{orientation.labBridge}</p>
      </div>

      <div className="atlas-orientation__grid">
        <div className="atlas-orientation__card atlas-orientation__card--focus">
          <strong>What to look at now</strong>
          <p>{orientation.currentFocus}</p>
        </div>

        <div className="atlas-orientation__card">
          <strong>Recommended reading path</strong>
          <ol>
            {orientation.suggestedRoute.map((step) => (
              <li key={step.id}>
                <span>{step.label}</span>
                <small>{step.why}</small>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <details className="atlas-orientation__details">
        <summary>What each workspace is for</summary>
        <div className="atlas-orientation__workspace-list">
          {workspaces.map((workspace) => (
            <div key={workspace.id}>
              <strong>
                {workspace.icon} {workspace.label}
              </strong>
              <p>{orientation.workspaceHints[workspace.id]}</p>
            </div>
          ))}
        </div>
      </details>
    </section>
  )
}
