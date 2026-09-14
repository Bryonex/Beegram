import { useState, useEffect } from 'react'
import { ChevronLeft, Trophy } from 'lucide-react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { gameService } from '../../services/gameService'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { useToast } from '../../contexts/ToastContext'

const ChessboardAny = Chessboard as any;

export function ChessGame({ onBack }: { onBack: () => void }) {
  const [game, setGame] = useState(new Chess())
  const [wins, setWins] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [status, setStatus] = useState<string>('Your turn')
  
  const { profile } = useCurrentProfile()
  const { success } = useToast()

  useEffect(() => {
    loadHighScore()
  }, [profile?.relationship_id])

  const loadHighScore = async () => {
    if (!profile?.relationship_id) return
    try {
      const score = await gameService.getHighScore(profile.relationship_id, 'chess')
      if (score > 0) setHighScore(score)
    } catch (err) {
      console.error(err)
    }
  }

  const saveScore = async (newWins: number) => {
    if (!profile?.relationship_id) return
    if (newWins > highScore) {
      setHighScore(newWins)
      success('New High Score!')
      await gameService.submitScore(
        profile.relationship_id,
        profile.id,
        'chess',
        newWins
      )
    }
  }

  function makeRandomMove() {
    const possibleMoves = game.moves()
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) {
      handleGameOver()
      return
    }

    const randomIndex = Math.floor(Math.random() * possibleMoves.length)
    const move = possibleMoves[randomIndex]
    
    // Safety check with safe move copy
    const gameCopy = new Chess(game.fen())
    gameCopy.move(move)
    setGame(gameCopy)
    
    if (gameCopy.isGameOver()) {
      handleGameOver()
    } else {
      setStatus('Your turn')
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (game.isGameOver()) return false

    const gameCopy = new Chess(game.fen())
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to queen for simplicity
    })

    if (move === null) return false

    setGame(gameCopy)

    if (gameCopy.isGameOver()) {
      handleGameOver(true)
    } else {
      setStatus('Bot is thinking...')
      setTimeout(makeRandomMove, 400)
    }
    
    return true
  }

  function handleGameOver(playerWon = false) {
    if (game.isCheckmate()) {
      if (playerWon) {
        setStatus('Checkmate! You win!')
        const newWins = wins + 1
        setWins(newWins)
        saveScore(newWins)
      } else {
        setStatus('Checkmate! Bot wins!')
      }
    } else if (game.isDraw()) {
      setStatus('Draw!')
    } else {
      setStatus('Game Over!')
    }
  }

  function resetGame() {
    setGame(new Chess())
    setStatus('Your turn')
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F0D9B5] flex flex-col pt-safe">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/50 backdrop-blur-md border-b border-[#B58863]/30">
        <button onClick={onBack} className="p-2 -ml-2 text-[#4A3219]/60 hover:text-[#4A3219]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="font-serif text-lg font-medium text-[#4A3219]">Chess</h2>
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-[#4A3219]/60 mt-1">
            <span className="flex items-center gap-1">
              Wins: {wins}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Trophy className="w-3 h-3" /> {highScore}
            </span>
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <div className="text-sm font-medium font-sans px-4 py-2 bg-white/40 rounded-full text-[#4A3219] shadow-sm">
          {status}
        </div>

        <div className="w-full max-w-[400px] aspect-square rounded-sm overflow-hidden shadow-2xl border-4 border-[#4A3219]">
          <ChessboardAny 
            position={game.fen()} 
            onPieceDrop={onDrop}
            customBoardStyle={{
              borderRadius: '2px',
            }}
            customDarkSquareStyle={{ backgroundColor: '#B58863' }}
            customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}
          />
        </div>

        <button 
          onClick={resetGame}
          className="mt-4 px-6 py-3 bg-[#4A3219] text-white rounded-full font-serif shadow-md hover:bg-[#5C3F20] transition-colors"
        >
          {game.isGameOver() ? 'Play Again' : 'Restart Game'}
        </button>
      </div>
    </div>
  )
}
