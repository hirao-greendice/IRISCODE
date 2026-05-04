import type { CSSProperties } from 'react'
import type { CameraState, PlayerState, StageData, StageTile, TileKind } from '../game/types'

interface GameBoardProps {
  camera: CameraState
  cameraSlideDurationMs: number
  player: PlayerState
  playerMoveDurationMs: number
  stage: StageData
}

function getTileClassName(tile: TileKind) {
  switch (tile) {
    case 'wall':
      return 'stage-tile tile-wall'
    default:
      return 'stage-tile'
  }
}

function getTileLabelClassName(tile: TileKind) {
  return tile === 'wall' ? 'tile-label tile-label-wall' : 'tile-label'
}

export function GameBoard({
  camera,
  cameraSlideDurationMs,
  player,
  playerMoveDurationMs,
  stage,
}: GameBoardProps) {
  const { frame } = camera
  const viewportTileWidth = 100 / frame.columns
  const viewportTileHeight = 100 / frame.rows
  const worldTileWidth = 100 / stage.columns
  const worldTileHeight = 100 / stage.rows
  const playerSizeScale = 0.78
  const worldStyle = {
    width: `${(stage.columns / frame.columns) * 100}%`,
    height: `${(stage.rows / frame.rows) * 100}%`,
    left: `${-frame.x * viewportTileWidth}%`,
    top: `${-frame.y * viewportTileHeight}%`,
    transitionDuration: `${cameraSlideDurationMs}ms`,
    gridTemplateColumns: `repeat(${stage.columns}, 1fr)`,
    gridTemplateRows: `repeat(${stage.rows}, 1fr)`,
  } as CSSProperties
  const playerStyle = {
    width: `${worldTileWidth * playerSizeScale}%`,
    height: `${worldTileHeight * playerSizeScale}%`,
    left: `${(player.position.x + 0.5) * worldTileWidth}%`,
    top: `${(player.position.y + 0.5) * worldTileHeight}%`,
    transform: 'translate(-50%, -50%)',
    transitionDuration: `${playerMoveDurationMs}ms`,
  } as CSSProperties

  return (
    <div className="stage-viewport">
      <div className="stage-world" style={worldStyle}>
        {stage.tiles.map((row, rowIndex) =>
          row.map((tile: StageTile, columnIndex) => (
            <div
              key={`${columnIndex}-${rowIndex}`}
              className={getTileClassName(tile.kind)}
            >
              <span className={getTileLabelClassName(tile.kind)}>{tile.cameraId}</span>
            </div>
          )),
        )}

        <div className="player-marker" style={playerStyle}>
          <div className="player-token" />
        </div>
      </div>
    </div>
  )
}
