import type { CameraPresetMap, PlayerState, StageData, StageTile, TileKind } from './types'

const STAGE_LAYOUT = [
  '....................',
  '..##.......#........',
  '......#........##...',
  '..........###.......',
  '....#...............',
  '.............#......',
  '..###...............',
  '...........##.......',
  '.....#..............',
  '.........#......#...',
  '....................',
  '....##..............',
  '..............###...',
  '.......#............',
  '.............#......',
  '..#.................',
  '...........##.......',
  '......#.............',
  '...............#....',
  '....................',
] as const

const CAMERA_REGION_LAYOUT = [
  'AAAAAABBBBBBBBCCCCCC',
  'AAAAAABBBBBBBBCCCCCC',
  'AAAAAABBBBBBBBCCCCCC',
  'AAAAAABBBBBBBBCCCCCC',
  'DDDDDEEEEEEEFFFFFFFF',
  'DDDDDEEEEEEEFFFFFFFF',
  'DDDDDEEEEEEEFFFFFFFF',
  'DDDDDEEEEEEEFFFFFFFF',
  'DDDDDEEEEEEEFFFFFFFF',
  'GGGGGGGGGHHHHHHHHHHH',
  'GGGGGGGGGHHHHHHHHHHH',
  'GGGGGGGGGHHHHHHHHHHH',
  'GGGGGGGGGHHHHHHHHHHH',
  'GGGGGGGGGHHHHHHHHHHH',
  'IIIIIIIIJJJJJJJJJJJJ',
  'IIIIIIIIJJJJJJJJJJJJ',
  'IIIIIIIIJJJJJJJJJJJJ',
  'IIIIIIIIJJJJJJJJJJJJ',
  'IIIIIIIIJJJJJJJJJJJJ',
  'IIIIIIIJJJJJJJJJJJJJ',
] as const

const STAGE_COLUMNS = 20
const STAGE_ROWS = 20

function parseTile(symbol: string): TileKind {
  return symbol === '#' ? 'wall' : 'ground'
}

function parseCameraId(symbol: string) {
  switch (symbol) {
    case 'A':
      return 1
    case 'B':
      return 2
    case 'C':
      return 3
    case 'D':
      return 4
    case 'E':
      return 5
    case 'F':
      return 6
    case 'G':
      return 7
    case 'H':
      return 8
    case 'I':
      return 9
    case 'J':
      return 10
    default:
      throw new Error(`Unknown camera region symbol: ${symbol}`)
  }
}

function buildStage(): StageData {
  if (STAGE_LAYOUT.length !== STAGE_ROWS) {
    throw new Error('Stage row count does not match the expected size.')
  }

  if (CAMERA_REGION_LAYOUT.length !== STAGE_ROWS) {
    throw new Error('Camera region row count does not match the expected size.')
  }

  const tiles = STAGE_LAYOUT.map((row, y) => {
    if (row.length !== STAGE_COLUMNS) {
      throw new Error(`Stage row ${y} does not match the expected width.`)
    }

    const regionRow = CAMERA_REGION_LAYOUT[y]

    if (!regionRow || regionRow.length !== STAGE_COLUMNS) {
      throw new Error(`Camera region row ${y} does not match the expected width.`)
    }

    return row.split('').map<StageTile>((symbol, x) => ({
      cameraId: parseCameraId(regionRow[x]),
      kind: parseTile(symbol),
    }))
  })

  return {
    columns: STAGE_COLUMNS,
    rows: STAGE_ROWS,
    tiles,
  }
}

export const CAMERA_PRESETS: CameraPresetMap = {
  1: { id: 1, x: 0, y: 0, columns: 8, rows: 8 },
  2: { id: 2, x: 5, y: 0, columns: 7, rows: 7 },
  3: { id: 3, x: 12, y: 0, columns: 8, rows: 8 },
  4: { id: 4, x: 0, y: 4, columns: 9, rows: 9 },
  5: { id: 5, x: 6.25, y: 4.25, columns: 6.5, rows: 6.5 },
  6: { id: 6, x: 11, y: 3, columns: 9, rows: 9 },
  7: { id: 7, x: 0, y: 9, columns: 10, rows: 10 },
  8: { id: 8, x: 9, y: 8, columns: 8, rows: 8 },
  9: { id: 9, x: 0, y: 12, columns: 8, rows: 8 },
  10: { id: 10, x: 8, y: 8, columns: 12, rows: 12 },
}

export const STAGE_DATA = buildStage()

export const INITIAL_PLAYER_STATE: PlayerState = {
  position: { x: 1, y: 1 },
}
