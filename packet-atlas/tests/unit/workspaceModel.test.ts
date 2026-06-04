import { describe, expect, it } from 'vitest'
import { atlasWorkspaces, getWorkspaceById } from '../../src/features/packet-atlas/workspace/workspaceModel'

describe('workspace model', () => {
  it('keeps Packet Atlas organized into focused workspaces', () => {
    expect(atlasWorkspaces.map((workspace) => workspace.id)).toEqual([
      'journey',
      'diagnostics',
      'protocols',
      'internals',
      'capture',
    ])
  })

  it('falls back to the journey workspace for unknown ids', () => {
    expect(getWorkspaceById('missing' as never).id).toBe('journey')
  })
})
