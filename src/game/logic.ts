import type {
  CameraState,
  CameraPresetMap,
  CharacterState,
  Direction,
  GameState,
  GameStepResult,
  GridPosition,
  RedState,
  StageData,
} from './types'

const DIRECTION_VECTORS: Record<Direction, GridPosition> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const DIRECTION_ORDER: Direction[] = ['up', 'down', 'left', 'right']

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function isInsideStage(stage: StageData, tile: GridPosition) {
  return tile.x >= 0 && tile.y >= 0 && tile.x < stage.columns && tile.y < stage.rows
}

function getNextPosition(position: GridPosition, direction: Direction): GridPosition {
  const delta = DIRECTION_VECTORS[direction]

  return {
    x: position.x + delta.x,
    y: position.y + delta.y,
  }
}

function isSamePosition(left: GridPosition, right: GridPosition) {
  return left.x === right.x && left.y === right.y
}

export function getTile(stage: StageData, position: GridPosition) {
  return stage.tiles[position.y]?.[position.x] ?? null
}

function canOccupyTile(
  stage: StageData,
  position: GridPosition,
  blockedPositions: GridPosition[] = [],
) {
  if (!isInsideStage(stage, position)) {
    return false
  }

  const nextTile = getTile(stage, position)

  if (!nextTile || nextTile.kind === 'wall') {
    return false
  }

  return blockedPositions.every((blockedPosition) => !isSamePosition(blockedPosition, position))
}

function moveCharacter<TCharacter extends CharacterState>(
  stage: StageData,
  character: TCharacter,
  direction: Direction,
  blockedPositions: GridPosition[] = [],
): TCharacter | null {
  const nextPosition = getNextPosition(character.position, direction)

  if (!canOccupyTile(stage, nextPosition, blockedPositions)) {
    return null
  }

  return {
    ...character,
    position: nextPosition,
  }
}

function hasLineOfSight(
  stage: StageData,
  origin: GridPosition,
  direction: Direction,
  target: GridPosition,
) {
  const delta = DIRECTION_VECTORS[direction]
  let current = getNextPosition(origin, direction)

  while (isInsideStage(stage, current)) {
    const tile = getTile(stage, current)

    if (!tile || tile.kind === 'wall') {
      return false
    }

    if (isSamePosition(current, target)) {
      return true
    }

    current = {
      x: current.x + delta.x,
      y: current.y + delta.y,
    }
  }

  return false
}

function getDistance(left: GridPosition, right: GridPosition) {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y)
}

function getRedMoveCandidates(red: RedState, playerPosition: GridPosition) {
  const horizontalDirection =
    playerPosition.x === red.position.x
      ? null
      : playerPosition.x > red.position.x
        ? 'right'
        : 'left'
  const verticalDirection =
    playerPosition.y === red.position.y
      ? null
      : playerPosition.y > red.position.y
        ? 'down'
        : 'up'
  const candidates: Array<{
    axisDistance: number
    direction: Direction
    facingBonus: number
    order: number
  }> = []

  if (horizontalDirection) {
    candidates.push({
      axisDistance: Math.abs(playerPosition.x - red.position.x),
      direction: horizontalDirection,
      facingBonus: horizontalDirection === red.direction ? 1 : 0,
      order: DIRECTION_ORDER.indexOf(horizontalDirection),
    })
  }

  if (verticalDirection) {
    candidates.push({
      axisDistance: Math.abs(playerPosition.y - red.position.y),
      direction: verticalDirection,
      facingBonus: verticalDirection === red.direction ? 1 : 0,
      order: DIRECTION_ORDER.indexOf(verticalDirection),
    })
  }

  return candidates
    .sort((left, right) => (
      right.axisDistance - left.axisDistance
      || right.facingBonus - left.facingBonus
      || left.order - right.order
    ))
    .map((candidate) => candidate.direction)
}

function moveRed(stage: StageData, red: RedState, playerPosition: GridPosition) {
  const currentDistance = getDistance(red.position, playerPosition)

  for (const direction of getRedMoveCandidates(red, playerPosition)) {
    const movedRed = moveCharacter(stage, red, direction, [playerPosition])

    if (!movedRed) {
      continue
    }

    if (getDistance(movedRed.position, playerPosition) >= currentDistance) {
      continue
    }

    return {
      ...movedRed,
      direction,
    }
  }

  return red
}

export function stepGame(
  stage: StageData,
  game: GameState,
  direction: Direction,
): GameStepResult {
  const redWasWatching = hasLineOfSight(
    stage,
    game.red.position,
    game.red.direction,
    game.player.position,
  )
  const movedPlayer = moveCharacter(stage, game.player, direction, [game.red.position])

  if (!movedPlayer) {
    return { type: 'blocked' }
  }

  const nextPlayer = {
    ...movedPlayer,
    direction,
  }
  const nextRed = redWasWatching
    ? moveRed(stage, game.red, nextPlayer.position)
    : game.red

  return {
    type: 'step',
    game: {
      player: nextPlayer,
      red: nextRed,
    },
  }
}

export function getCamera(
  stage: StageData,
  presets: CameraPresetMap,
  position: GridPosition,
): CameraState {
  const tile = getTile(stage, position)

  if (!tile) {
    throw new Error('The player is outside of the stage.')
  }

  const preset = presets[tile.cameraId]

  if (!preset) {
    throw new Error(`Camera preset ${tile.cameraId} is missing.`)
  }

  return {
    frame: {
      ...preset,
      x: clamp(preset.x, 0, Math.max(stage.columns - preset.columns, 0)),
      y: clamp(preset.y, 0, Math.max(stage.rows - preset.rows, 0)),
    },
    id: preset.id,
  }
}
