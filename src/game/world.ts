import type {
  CameraPresetMap,
  GameState,
  PlayerState,
  RedState,
  StageData,
  StageTile,
  TileKind,
} from './types'

const STAGE_LAYOUT = [
  '####################',
  '#...#.....##.......#',
  '#...#.###.##.......#',
  '#.........##.......#',
  '#...#.###.##.......#',
  '#...#.....##.......#',
  '#####.##..##.......#',
  '#....###.######.####',
  '#....#.......#...###',
  '#....#.......#...###',
  '#....#.......#...###',
  '###.##.......#######',
  '###.##.......###...#',
  '#............###...#',
  '#.....##.#######...#',
  '#.....#.....#####.##',
  '#...........#......#',
  '#.....#............#',
  '#######....#.......#',
  '####################',
] as const

const CAMERA_REGION_LAYOUT = [
  'AAAAAABBBBBBCCCCCCCC',
  'AAAAAABBBBBBCCCCCCCC',
  'AAAAAABBBBBLLCCCCCCC',
  'AAAAAKKBBBBBCCCCCCCC',
  'AAAAAABBBBBBCCCCCCCC',
  'AAMAAABBBBBBCCCCCCCC',
  'DDMDDDBBNBBBCCCOCCCC',
  'DDDDDDDENEEEFFFOFFFF',
  'DDDDDDDEEEEEFFFFFFFF',
  'DDDDDDEEEEEEFFFFFFFF',
  'DDDDDDEEEEEEEFFFFFFG',
  'DDDPDDEEEEEEEFFFFGGG',
  'HHHPHHEEEEEEEFFGGGGG',
  'HHHPHHHEQEEEEGGGGGGG',
  'HHHHHHHIQIIIJJGGGRGG',
  'HHHHHHIIQIIIJJJJGRGG',
  'HHHHHSSIIIIIJJJJJRJG',
  'HHHHHHIIIIITTJJJJJJJ',
  'HHHHHHIIIIIIJJJJJJJJ',
  'HHHHHIIIIIIIJJJJJJJJ',
] as const

const STAGE_COLUMNS = 20
const STAGE_ROWS = 20

function parseTile(symbol: string): TileKind {
  return symbol === '#' ? 'wall' : 'ground'
}

function parseCameraId(symbol: string) {
  const cameraId = symbol.charCodeAt(0) - 'A'.charCodeAt(0) + 1

  if (cameraId < 1 || cameraId > 20) {
    throw new Error(`Unknown camera region symbol: ${symbol}`)
  }

  return cameraId
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
  1: { id: 1, x: 0, y: 0, columns: 6, rows: 6 },
  2: { id: 2, x: 5.5, y: 0.5, columns: 6, rows: 6 },
  3: { id: 3, x: 11.5, y: 0, columns: 8, rows: 8 },
  4: { id: 4, x: 0, y: 6, columns: 6, rows: 6 },
  5: { id: 5, x: 5.5, y: 7, columns: 8, rows: 8 },
  6: { id: 6, x: 13, y: 7, columns: 5, rows: 5 },
  7: { id: 7, x: 14, y: 10.5, columns: 6, rows: 6 },
  8: { id: 8, x: 0, y: 12, columns: 7, rows: 7 },
  9: { id: 9, x: 6.5, y: 14.5, columns: 6, rows: 6 },
  10: { id: 10, x: 10, y: 10, columns: 10, rows: 10 },
  11: { id: 11, x: 0, y: 0, columns: 12, rows: 12 },
  12: { id: 12, x: 8, y: 0, columns: 12, rows: 12 },
  13: { id: 13, x: 0, y: 0.5, columns: 12, rows: 12 },
  14: { id: 14, x: 2.5, y: 1.5, columns: 12, rows: 12 },
  15: { id: 15, x: 8, y: 1.5, columns: 12, rows: 12 },
  16: { id: 16, x: 0, y: 8, columns: 12, rows: 12 },
  17: { id: 17, x: 2.5, y: 8, columns: 12, rows: 12 },
  18: { id: 18, x: 8, y: 8, columns: 12, rows: 12 },
  19: { id: 19, x: 0, y: 8, columns: 12, rows: 12 },
  20: { id: 20, x: 5.5, y: 8, columns: 12, rows: 12 },
}

export const STAGE_DATA = buildStage()

export const INITIAL_PLAYER_STATE: PlayerState = {
  position: { x: 2, y: 2 },
  direction: 'down',
}

export const INITIAL_RED_STATE: RedState = {
  position: { x: 9, y: 3 },
  direction: 'left',
}

export const INITIAL_GAME_STATE: GameState = {
  player: INITIAL_PLAYER_STATE,
  red: INITIAL_RED_STATE,
}
