import { describe, expect, it } from 'vitest'
import { getKeyboardTargetStageId } from '../../src/features/packet-atlas/accessibility/keyboardNavigationModel'

describe('keyboard navigation model', () => {
  const stages = ['one', 'two', 'three']

  it('moves between stages and respects boundaries', () => {
    expect(getKeyboardTargetStageId(stages, 'one', 'ArrowRight')).toBe('two')
    expect(getKeyboardTargetStageId(stages, 'three', 'ArrowRight')).toBe('three')
    expect(getKeyboardTargetStageId(stages, 'two', 'ArrowLeft')).toBe('one')
    expect(getKeyboardTargetStageId(stages, 'two', 'Home')).toBe('one')
    expect(getKeyboardTargetStageId(stages, 'two', 'End')).toBe('three')
  })
})
