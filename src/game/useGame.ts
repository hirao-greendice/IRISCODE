import { useCallback, useEffect, useRef, useState } from 'react'
import { getCamera, movePlayer } from './logic'
import type { Direction, PlayerState } from './types'
import { CAMERA_PRESETS, INITIAL_PLAYER_STATE, STAGE_DATA } from './world'

const KEY_TO_DIRECTION: Record<string, Direction> = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
}

export const PLAYER_MOVE_MS = 140
export const CAMERA_SLIDE_MS = 480
export const HELD_MOVE_INITIAL_DELAY_MS = 220
export const HELD_MOVE_REPEAT_MS = 180

export function useGame() {
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_STATE)
  const heldDirectionsRef = useRef<Direction[]>([])
  const stepTimeoutRef = useRef<number | null>(null)
  const runStepRef = useRef<() => void>(() => {})
  const hasRepeatedRef = useRef(false)

  const getActiveDirection = useCallback(() => {
    const directions = heldDirectionsRef.current
    return directions[directions.length - 1] ?? null
  }, [])

  const releaseMove = useCallback((direction: Direction) => {
    heldDirectionsRef.current = heldDirectionsRef.current.filter(
      (value) => value !== direction,
    )

    if (heldDirectionsRef.current.length === 0 && stepTimeoutRef.current !== null) {
      window.clearTimeout(stepTimeoutRef.current)
      stepTimeoutRef.current = null
      hasRepeatedRef.current = false
    }
  }, [])

  const runStep = useCallback(() => {
    const direction = getActiveDirection()

    if (!direction) {
      stepTimeoutRef.current = null
      hasRepeatedRef.current = false
      return
    }

    setPlayer((currentPlayer) => {
      const result = movePlayer(STAGE_DATA, currentPlayer, direction)

      if (result.type === 'blocked') {
        return currentPlayer
      }

      return result.player
    })

    const nextDelay = hasRepeatedRef.current
      ? HELD_MOVE_REPEAT_MS
      : HELD_MOVE_INITIAL_DELAY_MS

    hasRepeatedRef.current = true
    stepTimeoutRef.current = window.setTimeout(() => {
      runStepRef.current()
    }, nextDelay)
  }, [getActiveDirection])

  useEffect(() => {
    runStepRef.current = runStep
  }, [runStep])

  const move = useCallback(
    (direction: Direction) => {
      heldDirectionsRef.current = [
        ...heldDirectionsRef.current.filter((value) => value !== direction),
        direction,
      ]

      if (stepTimeoutRef.current === null) {
        hasRepeatedRef.current = false
        runStep()
      }
    },
    [runStep],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.key.toLowerCase()]

      if (!direction) {
        return
      }

      event.preventDefault()
      move(direction)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.key.toLowerCase()]

      if (!direction) {
        return
      }

      releaseMove(direction)
    }

    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [move, releaseMove])

  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current !== null) {
        window.clearTimeout(stepTimeoutRef.current)
      }
      stepTimeoutRef.current = null
      hasRepeatedRef.current = false
    }
  }, [])

  return {
    cameraSlideDurationMs: CAMERA_SLIDE_MS,
    camera: getCamera(STAGE_DATA, CAMERA_PRESETS, player.position),
    move,
    player,
    playerMoveDurationMs: PLAYER_MOVE_MS,
    releaseMove,
    stage: STAGE_DATA,
  }
}
