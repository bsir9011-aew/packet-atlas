import { describe, expect, it } from 'vitest'
import { buildCaptureWorkspaceGuideSummary } from '../../src/features/packet-atlas/capture-guide/captureWorkspaceGuideModel'
describe('capture workspace guide model',()=>{it('orders capture reading from contrast to detailed inspection',()=>{const g=buildCaptureWorkspaceGuideSummary();expect(g.steps.map((s)=>s.id)).toEqual(['contrast','evidence','timeline','inspector']);expect(g.safetyRule).toContain('Raw PCAP stays local')})})
