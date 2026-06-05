export type NavigationKey = 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'ArrowUp' | 'Home' | 'End'

export function getKeyboardTargetStageId(
  stageIds: string[],
  selectedStageId: string,
  key: NavigationKey,
): string {
  if (stageIds.length === 0) return selectedStageId

  const currentIndex = Math.max(0, stageIds.indexOf(selectedStageId))

  if (key === 'Home') return stageIds[0]
  if (key === 'End') return stageIds[stageIds.length - 1]
  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return stageIds[Math.min(stageIds.length - 1, currentIndex + 1)]
  }

  return stageIds[Math.max(0, currentIndex - 1)]
}

export function shouldIgnoreKeyboardNavigation(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return target.isContentEditable || ['input', 'textarea', 'select', 'button'].includes(tag)
}
