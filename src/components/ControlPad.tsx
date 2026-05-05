import type { Direction } from '../game/types'

interface ControlPadProps {
  disabled: boolean
  onReset: () => void
  onMove: (direction: Direction) => void
  onMoveEnd: (direction: Direction) => void
  onUndo: () => void
  resetDisabled: boolean
  undoDisabled: boolean
}

export function ControlPad({
  disabled,
  onMove,
  onMoveEnd,
  onReset,
  onUndo,
  resetDisabled,
  undoDisabled,
}: ControlPadProps) {
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
    <div className="control-layout" aria-label="Touch controls">
      <div className="control-pad">
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
          ↑
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
          ←
        </button>
        <span className="control-spacer control-center" aria-hidden="true" />
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
          →
        </button>

        <span className="control-spacer" aria-hidden="true" />
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
          ↓
        </button>
        <span className="control-spacer" aria-hidden="true" />
      </div>

      <div className="control-actions">
        <button
          type="button"
          className="control-button control-action-button"
          aria-label="Undo move"
          disabled={undoDisabled}
          onClick={onUndo}
        >
          UNDO
        </button>
        <button
          type="button"
          className="control-button control-action-button"
          aria-label="Reset puzzle"
          disabled={resetDisabled}
          onClick={onReset}
        >
          RESET
        </button>
      </div>
    </div>
  )
}
