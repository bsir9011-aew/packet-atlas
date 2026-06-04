import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildSequenceBoard, getSequenceKind } from '../../src/features/packet-atlas/sequences/sequenceBoardModel'
describe('sequence board model', () => {
  it('selects TCP board for TCP handshake stage', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='tcp-handshake')!; expect(getSequenceKind(stage)).toBe('tcp') })
  it('marks break points in failure variants', () => { const stage=httpsExampleScenario.stages.find(i=>i.id==='arp-gateway')!; const board=buildSequenceBoard(httpsExampleScenario,stage,'no-arp-gateway'); expect(board.items.some(i=>i.status==='break')).toBe(true) })
})
