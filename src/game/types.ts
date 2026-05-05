export type Direction = 'up' | 'down' | 'left' | 'right'

export interface GridPosition {
  x: number
  y: number
}

export interface CharacterState {
  position: GridPosition
}

export interface FacingCharacterState extends CharacterState {
  direction: Direction
}

export type TileKind = 'ground' | 'wall'

export interface StageTile {
  cameraId: number
  kind: TileKind
}

export interface StageData {
  columns: number
  rows: number
  tiles: StageTile[][]
}

export type PlayerState = FacingCharacterState

export type RedState = FacingCharacterState

export interface GameState {
  player: PlayerState
  red: RedState
}

export interface CameraFrame {
  // Camera presets can use decimal values for sub-tile framing and zoom.
  columns: number
  id: number
  rows: number
  x: number
  y: number
}

export type CameraPresetMap = Record<number, CameraFrame>

export interface CameraState {
  frame: CameraFrame
  id: number
}

export type GameStepResult = { type: 'blocked' } | { type: 'step'; game: GameState }
