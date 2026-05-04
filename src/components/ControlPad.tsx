import type { Direction } from '../game/types'

interface ControlPadProps {
  disabled: boolean
  onMove: (direction: Direction) => void
  onMoveEnd: (direction: Direction) => void
}

export function ControlPad({ disabled, onMove, onMoveEnd }: ControlPadProps) {
  const handlePointerDown = (direction: Direction) => {
    if (disabled) {
      return
    }

    onMove(direction)
  }

  const handlePointerEnd = (direction: Direction) => {
    onMoveEnd(direction)
  }

  return (
    <div className="control-pad" aria-label="Touch controls">
      <span className="control-spacer" aria-hidden="true" />
      <button
        type="button"
        className="control-button"
        aria-label="Move up"
        disabled={disabled}
        onPointerDown={() => handlePointerDown('up')}
        onPointerUp={() => handlePointerEnd('up')}
        onPointerCancel={() => handlePointerEnd('up')}
        onPointerLeave={() => handlePointerEnd('up')}
      >
        ^
      </button>
      <span className="control-spacer" aria-hidden="true" />

      <button
        type="button"
        className="control-button"
        aria-label="Move left"
        disabled={disabled}
        onPointerDown={() => handlePointerDown('left')}
        onPointerUp={() => handlePointerEnd('left')}
        onPointerCancel={() => handlePointerEnd('left')}
        onPointerLeave={() => handlePointerEnd('left')}
      >
        {'<'}
      </button>
      <button
        type="button"
        className="control-button"
        aria-label="Move down"
        disabled={disabled}
        onPointerDown={() => handlePointerDown('down')}
        onPointerUp={() => handlePointerEnd('down')}
        onPointerCancel={() => handlePointerEnd('down')}
        onPointerLeave={() => handlePointerEnd('down')}
      >
        v
      </button>
      <button
        type="button"
        className="control-button"
        aria-label="Move right"
        disabled={disabled}
        onPointerDown={() => handlePointerDown('right')}
        onPointerUp={() => handlePointerEnd('right')}
        onPointerCancel={() => handlePointerEnd('right')}
        onPointerLeave={() => handlePointerEnd('right')}
      >
        {'>'}
      </button>
    </div>
  )
}
