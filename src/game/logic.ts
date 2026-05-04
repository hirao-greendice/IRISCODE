import type {
  CameraState,
  CameraPresetMap,
  Direction,
  GridPosition,
  MoveResult,
  PlayerState,
  StageData,
} from './types'

const DIRECTION_VECTORS: Record<Direction, GridPosition> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function isInsideStage(stage: StageData, tile: GridPosition) {
  return tile.x >= 0 && tile.y >= 0 && tile.x < stage.columns && tile.y < stage.rows
}

export function getTile(stage: StageData, position: GridPosition) {
  return stage.tiles[position.y]?.[position.x] ?? null
}

export function movePlayer(
  stage: StageData,
  player: PlayerState,
  direction: Direction,
): MoveResult {
  const delta = DIRECTION_VECTORS[direction]
  const nextPosition = {
    x: player.position.x + delta.x,
    y: player.position.y + delta.y,
  }

  if (!isInsideStage(stage, nextPosition)) {
    return { type: 'blocked' }
  }

  const nextTile = getTile(stage, nextPosition)

  if (!nextTile || nextTile.kind === 'wall') {
    return { type: 'blocked' }
  }

  return {
    type: 'step',
    player: {
      position: nextPosition,
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
