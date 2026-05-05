import type { CSSProperties } from 'react'
import type {
  CameraState,
  Direction,
  GridPosition,
  PlayerState,
  RedState,
  StageData,
  StageTile,
  TileKind,
} from '../game/types'
import floorImage from '../assets/floor.webp'
import hole1Image from '../assets/hole1.webp'
import hole2Image from '../assets/hole2.webp'

type CharacterSpriteSet = 'white' | 'red'

const directionalSpriteModules = import.meta.glob('../assets/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>

interface GameBoardProps {
  camera: CameraState
  cameraSlideDurationMs: number
  player: PlayerState
  playerMoveDurationMs: number
  red: RedState
  stage: StageData
}

interface CharacterSprite {
  id: string
  direction: Direction
  position: GridPosition
  spriteSet: CharacterSpriteSet
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

function getCharacterImage(spriteSet: CharacterSpriteSet, direction: Direction) {
  // Directional sprite names: white-up.webp, white-down.webp, red-left.webp, etc.
  const directionalImage = directionalSpriteModules[`../assets/${spriteSet}-${direction}.webp`]

  if (directionalImage) {
    return directionalImage
  }

  return (
    directionalSpriteModules[`../assets/${spriteSet}-down.webp`]
    ?? directionalSpriteModules[`../assets/${spriteSet}-up.webp`]
    ?? directionalSpriteModules[`../assets/${spriteSet}-left.webp`]
    ?? directionalSpriteModules[`../assets/${spriteSet}-right.webp`]
    ?? ''
  )
}

export function GameBoard({
  camera,
  cameraSlideDurationMs,
  player,
  playerMoveDurationMs,
  red,
  stage,
}: GameBoardProps) {
  const { frame } = camera
  const viewportTileWidth = 100 / frame.columns
  const viewportTileHeight = 100 / frame.rows
  const worldTileWidth = 100 / stage.columns
  const worldTileHeight = 100 / stage.rows
  const characterWidthScale = 0.95
  const characterHeightScale = 1.5
  const worldStyle = {
    width: `${(stage.columns / frame.columns) * 100}%`,
    height: `${(stage.rows / frame.rows) * 100}%`,
    left: `${-frame.x * viewportTileWidth}%`,
    top: `${-frame.y * viewportTileHeight}%`,
    transitionDuration: `${cameraSlideDurationMs}ms`,
    gridTemplateColumns: `repeat(${stage.columns}, 1fr)`,
    gridTemplateRows: `repeat(${stage.rows}, 1fr)`,
  } as CSSProperties
  const characters = ([
    {
      id: 'player',
      direction: player.direction,
      position: player.position,
      spriteSet: 'white',
    },
    {
      id: 'red',
      direction: red.direction,
      position: red.position,
      spriteSet: 'red',
    },
  ] satisfies CharacterSprite[]).sort((left, right) => (
    left.position.y - right.position.y
    || left.position.x - right.position.x
  ))

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

        {characters.map((character) => {
          const characterStyle = {
            width: `${worldTileWidth * characterWidthScale}%`,
            height: `${worldTileHeight * characterHeightScale}%`,
            left: `${(character.position.x + 0.5) * worldTileWidth}%`,
            top: `${(character.position.y + 1) * worldTileHeight}%`,
            transform: 'translate(-50%, -100%)',
            transitionDuration: `${playerMoveDurationMs}ms`,
            zIndex: stage.rows + character.position.y,
          } as CSSProperties
          const characterTokenStyle = {
            backgroundImage: `url(${getCharacterImage(character.spriteSet, character.direction)})`,
          } as CSSProperties

          return (
            <div key={character.id} className="character-marker" style={characterStyle}>
              <div className="character-token" style={characterTokenStyle} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
