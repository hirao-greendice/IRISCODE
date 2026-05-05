import './App.css'
import { ControlPad } from './components/ControlPad'
import { GameBoard } from './components/GameBoard'
import { useGame } from './game/useGame'
import { useSwipeMove } from './game/useSwipeMove'

function App() {
  const {
    camera,
    cameraSlideDurationMs,
    move,
    player,
    playerMoveDurationMs,
    releaseMove,
    stepMove,
    stage,
  } = useGame()
  const swipeHandlers = useSwipeMove({
    onStep: stepMove,
  })

  return (
    <main
      className="app-shell"
      onPointerCancel={swipeHandlers.handlePointerCancel}
      onPointerDown={swipeHandlers.handlePointerDown}
      onPointerMove={swipeHandlers.handlePointerMove}
      onPointerUp={swipeHandlers.handlePointerUp}
    >
      <section className="game-layout" aria-label="Grid game prototype">
        <div className="game-stage">
          <GameBoard
            camera={camera}
            cameraSlideDurationMs={cameraSlideDurationMs}
            player={player}
            playerMoveDurationMs={playerMoveDurationMs}
            stage={stage}
          />
        </div>

        <div className="controls-area">
          <ControlPad
            disabled={false}
            onMove={move}
            onMoveEnd={releaseMove}
          />
        </div>
      </section>
    </main>
  )
}

export default App
