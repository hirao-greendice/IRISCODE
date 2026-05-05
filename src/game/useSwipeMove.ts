import { useCallback, useRef } from 'react'
import type { PointerEventHandler } from 'react'
import type { Direction } from './types'

const SWIPE_THRESHOLD_PX = 18

interface SwipePoint {
  x: number
  y: number
}

interface SwipeSession {
  anchor: SwipePoint
  pointerId: number
}

interface UseSwipeMoveOptions {
  onStep: (direction: Direction) => void
}

function getSwipeDirection(deltaX: number, deltaY: number): Direction | null {
  if (
    Math.abs(deltaX) < SWIPE_THRESHOLD_PX
    && Math.abs(deltaY) < SWIPE_THRESHOLD_PX
  ) {
    return null
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left'
  }

  return deltaY > 0 ? 'down' : 'up'
}

function isTouchPointer(pointerType: string) {
  return pointerType === 'touch' || pointerType === 'pen'
}

function isControlButton(target: EventTarget | null) {
  return target instanceof Element && target.closest('.control-button') !== null
}

export function useSwipeMove({ onStep }: UseSwipeMoveOptions) {
  const sessionRef = useRef<SwipeSession | null>(null)

  const handlePointerDown = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      if (!isTouchPointer(event.pointerType) || isControlButton(event.target)) {
        return
      }

      sessionRef.current = {
        anchor: { x: event.clientX, y: event.clientY },
        pointerId: event.pointerId,
      }

      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [],
  )

  const handlePointerMove = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      const session = sessionRef.current

      if (!session || session.pointerId !== event.pointerId) {
        return
      }

      const deltaX = event.clientX - session.anchor.x
      const deltaY = event.clientY - session.anchor.y
      const nextDirection = getSwipeDirection(deltaX, deltaY)

      if (!nextDirection) {
        return
      }

      event.preventDefault()
      onStep(nextDirection)

      sessionRef.current = {
        anchor: { x: event.clientX, y: event.clientY },
        pointerId: event.pointerId,
      }
    },
    [onStep],
  )

  const handlePointerUp = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      const session = sessionRef.current

      if (!session || session.pointerId !== event.pointerId) {
        return
      }

      sessionRef.current = null
      event.currentTarget.releasePointerCapture(event.pointerId)
    },
    [],
  )

  const handlePointerCancel = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      const session = sessionRef.current

      if (!session || session.pointerId !== event.pointerId) {
        return
      }

      sessionRef.current = null
    },
    [],
  )

  return {
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}
