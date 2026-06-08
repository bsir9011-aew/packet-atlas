import { describe, expect, it } from 'vitest'
import { explainWorkspace } from '../../src/features/packet-atlas/screen-explain/explainThisScreenModel'
import { atlasWorkspaces } from '../../src/features/packet-atlas/workspace/workspaceModel'
describe('explain this screen model',()=>{it('provides a plain explanation for every workspace',()=>{for(const w of atlasWorkspaces){const e=explainWorkspace(w);expect(e.plainEnglish.length).toBeGreaterThan(20);expect(e.lookFor.length).toBeGreaterThan(20);expect(e.notebookLine.length).toBeGreaterThan(20)}});it('explains capture as real packet evidence',()=>{const c=atlasWorkspaces.find((w)=>w.id==='capture')!;expect(explainWorkspace(c).notebookLine).toContain('HTTPS hides readable HTTP')})})
