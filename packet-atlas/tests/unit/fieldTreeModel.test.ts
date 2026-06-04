import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildFieldTree, countTreeNodes } from '../../src/features/packet-atlas/field-tree/fieldTreeModel'
describe('field tree model', () => {
  it('builds network and transport branches for DNS query', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='dns-query')!; const tree=buildFieldTree(stage); expect(tree.some(n=>n.id==='network')).toBe(true); expect(tree.some(n=>n.id==='transport')).toBe(true); expect(countTreeNodes(tree)).toBeGreaterThan(tree.length) })
})
