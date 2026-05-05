import type { CSSProperties } from 'react'
import type { CameraState, PlayerState, StageData, StageTile, TileKind } from '../game/types'
import floorImage from '../assets/floor.webp'
import hole1Image from '../assets/hole1.webp'
import hole2Image from '../assets/hole2.webp'
import playerImage from '../assets/player.webp'

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

function getTileImage(stage: StageData, tile: StageTile, x: number, y: number) {
  if (tile.kind === 'ground') {
    return floorImage
  }

  const aboveTile = stage.tiles[y - 1]?.[x]
  return aboveTile?.kind === 'ground' ? hole1Image : hole2Image
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
  const playerWidthScale = 0.95
  const playerHeightScale = 1.5
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
    width: `${worldTileWidth * playerWidthScale}%`,
    height: `${worldTileHeight * playerHeightScale}%`,
    left: `${(player.position.x + 0.5) * worldTileWidth}%`,
    top: `${(player.position.y + 1) * worldTileHeight}%`,
    transform: 'translate(-50%, -100%)',
    transitionDuration: `${playerMoveDurationMs}ms`,
  } as CSSProperties
  const playerTokenStyle = {
    backgroundImage: `url(${playerImage})`,
  } as CSSProperties

  return (
    <div className="stage-viewport">
      <div className="stage-world" style={worldStyle}>
        {stage.tiles.map((row, rowIndex) =>
          row.map((tile: StageTile, columnIndex) => {
            const tileImage = getTileImage(stage, tile, columnIndex, rowIndex)

            return (
              <div
                key={`${columnIndex}-${rowIndex}`}
                className={getTileClassName(tile.kind)}
              >
                <div
                  className="tile-sprite"
                  style={{ backgroundImage: `url(${tileImage})` }}
                />
                <span className={getTileLabelClassName(tile.kind)}>{tile.cameraId}</span>
              </div>
            )
          }),
        )}

        <div className="player-marker" style={playerStyle}>
          <div className="player-token" style={playerTokenStyle} />
        </div>
      </div>
    </div>
  )
}
