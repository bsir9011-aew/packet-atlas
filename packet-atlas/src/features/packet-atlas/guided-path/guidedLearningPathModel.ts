import type { AtlasWorkspaceDefinition, AtlasWorkspaceId } from '../workspace/workspaceModel'
export type GuidedLearningStep = { id: string; label: string; workspaceId: AtlasWorkspaceId; checkpoint: string; notebookPrompt: string }
export type GuidedLearningPathSummary = { title: string; activeStep: GuidedLearningStep; steps: GuidedLearningStep[]; rule: string }
const steps: GuidedLearningStep[] = [
 { id:'map', label:'1. Read the journey map', workspaceId:'journey', checkpoint:'Can I explain the 14-stage happy path without looking?', notebookPrompt:'Write: URL → DNS → TCP → TLS → HTTP → render.' },
 { id:'proof', label:'2. Compare real evidence', workspaceId:'capture', checkpoint:'Can I explain why HTTPS has readable HTTP = 0?', notebookPrompt:'Write: HTTPS hides HTTP inside TLS; plaintext HTTP exposes GET/200.' },
 { id:'breaks', label:'3. Inspect failures', workspaceId:'diagnostics', checkpoint:'Can I point to where a route becomes cut off?', notebookPrompt:'Write one failure and the first stage it affects.' },
 { id:'variants', label:'4. Explore variants', workspaceId:'protocols', checkpoint:'Can I say what changes when protocol assumptions change?', notebookPrompt:'Write one DNS/TLS/proxy variant and what becomes visible or hidden.' },
 { id:'microscope', label:'5. Use internals as microscope', workspaceId:'internals', checkpoint:'Can I separate packet fields from application meaning?', notebookPrompt:'Write: field evidence is not the same as application truth.' },
]
export function buildGuidedLearningPathSummary(currentWorkspace: AtlasWorkspaceDefinition): GuidedLearningPathSummary { const activeStep=steps.find((s)=>s.workspaceId===currentWorkspace.id)??steps[0]; return {title:'Recommended path through the atlas', activeStep, steps, rule:'Do not try to understand every panel at once. Follow the path: map → proof → failures → variants → microscope.'} }
export function listGuidedLearningSteps(): GuidedLearningStep[] { return steps }
