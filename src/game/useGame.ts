import { useCallback, useEffect, useRef, useState } from 'react'
import { getCamera, stepGame } from './logic'
import type { Direction, GameState } from './types'
import { CAMERA_PRESETS, INITIAL_GAME_STATE, STAGE_DATA } from './world'

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

export const PLAYER_MOVE_MS = 160
export const CAMERA_SLIDE_MS = 500
export const HELD_MOVE_INITIAL_DELAY_MS = 250
export const HELD_MOVE_REPEAT_MS = 190

interface GameSessionState {
  game: GameState
  history: GameState[]
}

export function useGame() {
  const [session, setSession] = useState<GameSessionState>({
    game: INITIAL_GAME_STATE,
    history: [],
  })
  const heldDirectionsRef = useRef<Direction[]>([])
  const stepTimeoutRef = useRef<number | null>(null)
  const runStepRef = useRef<() => void>(() => {})
  const hasRepeatedRef = useRef(false)

  const clearHeldMove = useCallback(() => {
    heldDirectionsRef.current = []

    if (stepTimeoutRef.current !== null) {
      window.clearTimeout(stepTimeoutRef.current)
    }

    stepTimeoutRef.current = null
    hasRepeatedRef.current = false
  }, [])

  const stepMove = useCallback((direction: Direction) => {
    setSession((currentSession) => {
      const result = stepGame(STAGE_DATA, currentSession.game, direction)

      if (result.type === 'blocked') {
        return currentSession
      }

      return {
        game: result.game,
        history: [...currentSession.history, currentSession.game],
      }
    })
  }, [])

  const getActiveDirection = useCallback(() => {
    const directions = heldDirectionsRef.current
    return directions[directions.length - 1] ?? null
  }, [])

  const releaseMove = useCallback((direction: Direction) => {
    heldDirectionsRef.current = heldDirectionsRef.current.filter(
      (value) => value !== direction,
    )

    if (heldDirectionsRef.current.length === 0 && stepTimeoutRef.current !== null) {
      clearHeldMove()
    }
  }, [clearHeldMove])

  const runStep = useCallback(() => {
    const direction = getActiveDirection()

    if (!direction) {
      stepTimeoutRef.current = null
      hasRepeatedRef.current = false
      return
    }

    stepMove(direction)

    const nextDelay = hasRepeatedRef.current
      ? HELD_MOVE_REPEAT_MS
      : HELD_MOVE_INITIAL_DELAY_MS

    hasRepeatedRef.current = true
    stepTimeoutRef.current = window.setTimeout(() => {
      runStepRef.current()
    }, nextDelay)
  }, [getActiveDirection, stepMove])

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
      clearHeldMove()
    }
  }, [clearHeldMove])

  const undo = useCallback(() => {
    clearHeldMove()
    setSession((currentSession) => {
      const previousGame = currentSession.history.at(-1)

      if (!previousGame) {
        return currentSession
      }

      return {
        game: previousGame,
        history: currentSession.history.slice(0, -1),
      }
    })
  }, [clearHeldMove])

  const reset = useCallback(() => {
    clearHeldMove()
    setSession((currentSession) => {
      if (currentSession.history.length === 0) {
        return currentSession
      }

      return {
        game: INITIAL_GAME_STATE,
        history: [],
      }
    })
  }, [clearHeldMove])

  return {
    cameraSlideDurationMs: CAMERA_SLIDE_MS,
    camera: getCamera(STAGE_DATA, CAMERA_PRESETS, session.game.player.position),
    canReset: session.history.length > 0,
    canUndo: session.history.length > 0,
    move,
    player: session.game.player,
    playerMoveDurationMs: PLAYER_MOVE_MS,
    red: session.game.red,
    releaseMove,
    reset,
    stepMove,
    stage: STAGE_DATA,
    undo,
  }
}
