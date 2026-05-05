import { useCallback, useRef } from 'react'
import type { PointerEventHandler } from 'react'
import type { Direction } from './types'

const SWIPE_THRESHOLD_PX = 24
const SWIPE_REARM_DELAY_MS = 180

interface SwipePoint {
  x: number
  y: number
}

interface SwipeSession {
  armed: boolean
  anchor: SwipePoint
  current: SwipePoint
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
  const rearmTimeoutRef = useRef<number | null>(null)

  const clearRearmTimeout = useCallback(() => {
    if (rearmTimeoutRef.current !== null) {
      window.clearTimeout(rearmTimeoutRef.current)
      rearmTimeoutRef.current = null
    }
  }, [])

  const scheduleRearm = useCallback(() => {
    clearRearmTimeout()
    rearmTimeoutRef.current = window.setTimeout(() => {
      const session = sessionRef.current

      if (!session) {
        rearmTimeoutRef.current = null
        return
      }

      sessionRef.current = {
        ...session,
        armed: true,
        anchor: session.current,
      }
      rearmTimeoutRef.current = null
    }, SWIPE_REARM_DELAY_MS)
  }, [clearRearmTimeout])

  const handlePointerDown = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      if (!isTouchPointer(event.pointerType) || isControlButton(event.target)) {
        return
      }

      clearRearmTimeout()
      sessionRef.current = {
        armed: true,
        anchor: { x: event.clientX, y: event.clientY },
        current: { x: event.clientX, y: event.clientY },
        pointerId: event.pointerId,
      }

      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [clearRearmTimeout],
  )

  const handlePointerMove = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      const session = sessionRef.current

      if (!session || session.pointerId !== event.pointerId) {
        return
      }

      const nextPoint = { x: event.clientX, y: event.clientY }
      sessionRef.current = {
        ...session,
        current: nextPoint,
      }

      if (!session.armed) {
        scheduleRearm()
        return
      }

      const deltaX = nextPoint.x - session.anchor.x
      const deltaY = nextPoint.y - session.anchor.y
      const nextDirection = getSwipeDirection(deltaX, deltaY)

      if (!nextDirection) {
        return
      }

      event.preventDefault()
      onStep(nextDirection)

      sessionRef.current = {
        armed: false,
        anchor: nextPoint,
        current: nextPoint,
        pointerId: event.pointerId,
      }
      scheduleRearm()
    },
    [onStep, scheduleRearm],
  )

  const handlePointerUp = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      const session = sessionRef.current

      if (!session || session.pointerId !== event.pointerId) {
        return
      }

      clearRearmTimeout()
      sessionRef.current = null
      event.currentTarget.releasePointerCapture(event.pointerId)
    },
    [clearRearmTimeout],
  )

  const handlePointerCancel = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      const session = sessionRef.current

      if (!session || session.pointerId !== event.pointerId) {
        return
      }

      clearRearmTimeout()
      sessionRef.current = null
    },
    [clearRearmTimeout],
  )

  return {
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}
