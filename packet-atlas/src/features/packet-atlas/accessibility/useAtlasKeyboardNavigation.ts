import { useEffect } from 'react'
import { useAtlasStore } from '../store/atlasStore'
import {
  getKeyboardTargetStageId,
  shouldIgnoreKeyboardNavigation,
  type NavigationKey,
} from './keyboardNavigationModel'

const supportedKeys = new Set<NavigationKey>([
  'ArrowRight',
  'ArrowDown',
  'ArrowLeft',
  'ArrowUp',
  'Home',
  'End',
])

export function useAtlasKeyboardNavigation(
  stageIds: string[],
  selectedStageId: string,
) {
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!supportedKeys.has(event.key as NavigationKey)) return
      if (shouldIgnoreKeyboardNavigation(event.target)) return

      event.preventDefault()
      setSelectedStageId(
        getKeyboardTargetStageId(
          stageIds,
          selectedStageId,
          event.key as NavigationKey,
        ),
      )
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedStageId, setSelectedStageId, stageIds])
}
