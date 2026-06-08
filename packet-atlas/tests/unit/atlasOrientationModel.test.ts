import { describe, expect, it } from 'vitest'
import {
  buildAtlasOrientationSummary,
  getOrientationHintForWorkspace,
} from '../../src/features/packet-atlas/orientation/atlasOrientationModel'
import { atlasWorkspaces } from '../../src/features/packet-atlas/workspace/workspaceModel'

describe('atlas orientation model', () => {
  it('explains the lab versus app mental model', () => {
    const capture = atlasWorkspaces.find((workspace) => workspace.id === 'capture')
    expect(capture).toBeTruthy()

    const summary = buildAtlasOrientationSummary(capture!)

    expect(summary.title).toContain('not lost')
    expect(summary.labBridge).toContain('Terminal work')
    expect(summary.labBridge).toContain('normalized, redacted evidence')
    expect(summary.currentFocus).toContain('real evidence')
    expect(summary.suggestedRoute.map((step) => step.workspaceId)).toEqual([
      'journey',
      'capture',
      'diagnostics',
      'protocols',
    ])
  })

  it('has an orientation hint for every workspace', () => {
    for (const workspace of atlasWorkspaces) {
      expect(getOrientationHintForWorkspace(workspace.id).length).toBeGreaterThan(20)
    }
  })
})
