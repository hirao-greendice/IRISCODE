import './App.css'
import { ControlPad } from './components/ControlPad'
import { GameBoard } from './components/GameBoard'
import { useGame } from './game/useGame'

function App() {
  const {
    camera,
    cameraSlideDurationMs,
    canReset,
    canUndo,
    move,
    player,
    playerMoveDurationMs,
    red,
    reset,
    releaseMove,
    stage,
    undo,
  } = useGame()

  return (
    <main className="app-shell">
      <section className="game-layout" aria-label="Grid game prototype">
        <div className="game-stage">
          <GameBoard
            camera={camera}
            cameraSlideDurationMs={cameraSlideDurationMs}
            player={player}
            playerMoveDurationMs={playerMoveDurationMs}
            red={red}
            stage={stage}
          />
        </div>

        <div className="controls-area">
          <ControlPad
            disabled={false}
            onReset={reset}
            onMove={move}
            onMoveEnd={releaseMove}
            onUndo={undo}
            resetDisabled={!canReset}
            undoDisabled={!canUndo}
          />
        </div>
      </section>
    </main>
  )
}

export default App
