import { describe, expect, it } from 'vitest'
import { buildGuidedLearningPathSummary, listGuidedLearningSteps } from '../../src/features/packet-atlas/guided-path/guidedLearningPathModel'
import { atlasWorkspaces } from '../../src/features/packet-atlas/workspace/workspaceModel'
describe('guided learning path model', () => { it('starts from map and moves toward evidence and failures', () => { const steps=listGuidedLearningSteps(); expect(steps.map((s)=>s.workspaceId).slice(0,3)).toEqual(['journey','capture','diagnostics']); expect(steps.every((s)=>s.notebookPrompt.length>10)).toBe(true) }); it('selects active step', () => { const capture=atlasWorkspaces.find((w)=>w.id==='capture')!; expect(buildGuidedLearningPathSummary(capture).activeStep.workspaceId).toBe('capture') }) })
