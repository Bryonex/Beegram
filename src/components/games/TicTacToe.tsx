import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, RotateCcw, User, Cpu, } from 'lucide-react'

type Player = 'X' | 'O' | null
type Mode = 'local' | 'ai'

export function TicTacToe({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState<boolean>(true)
  const [mode, setMode] = useState<Mode>('ai')
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return squares.every(Boolean) ? 'draw' : null
  }

  const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares)
    if (result === 'O') return 10 - depth
    if (result === 'X') return depth - 10
    if (result === 'draw') return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O'
          let score = minimax(squares, depth + 1, false)
          squares[i] = null
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X'
          let score = minimax(squares, depth + 1, true)
          squares[i] = null
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  const makeAIMove = () => {
    if (winner || xIsNext) return

    let bestScore = -Infinity
    let move = -1
    const squares = [...board]
    
    // Slight randomness for "easy" feel, but mostly plays perfect
    if (Math.random() < 0.2) {
      const available = squares.map((s, i) => s === null ? i : null).filter(s => s !== null) as number[]
      move = available[Math.floor(Math.random() * available.length)]
    } else {
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O'
          let score = minimax(squares, 0, false)
          squares[i] = null
          if (score > bestScore) {
            bestScore = score
            move = i
          }
        }
      }
    }

    if (move !== -1) {
      handleClick(move)
    }
  }

  useEffect(() => {
    if (mode === 'ai' && !xIsNext && !winner) {
      const timer = setTimeout(makeAIMove, 500)
      return () => clearTimeout(timer)
    }
  }, [xIsNext, mode, winner, board])

  const handleClick = (i: number) => {
    if (board[i] || winner) return

    const newBoard = [...board]
    newBoard[i] = xIsNext ? 'X' : 'O'
    setBoard(newBoard)
    
    const newWinner = checkWinner(newBoard)
    if (newWinner) {
      setWinner(newWinner)
    } else {
      setXIsNext(!xIsNext)
    }
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setXIsNext(true)
    setWinner(null)
  }

  return (
    <div className="w-full min-h-[100dvh] flex flex-col relative pt-safe pb-24 bg-[#F8F9FA]">
      <div className="px-5 pt-6 pb-2 sticky top-0 z-20 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-deepPlum/70">
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
        <h1 className="text-xl font-serif text-deepPlum font-medium">Tic Tac Toe</h1>
        <div className="flex items-center gap-2">          <button onClick={reset} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-deepPlum/70">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        
        <div className="flex gap-4 mb-12 bg-white/50 p-1.5 rounded-full shadow-inner border border-gray-100">
          <button 
            onClick={() => { setMode('ai'); reset(); }}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${mode === 'ai' ? 'bg-white shadow-sm text-deepPlum' : 'text-deepPlum/50'}`}
          >
            <Cpu className="w-4 h-4" /> 1 Player
          </button>
          <button 
            onClick={() => { setMode('local'); reset(); }}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${mode === 'local' ? 'bg-white shadow-sm text-deepPlum' : 'text-deepPlum/50'}`}
          >
            <User className="w-4 h-4" /> 2 Players
          </button>
        </div>

        <div className="mb-8 h-8 flex items-center justify-center">
          {winner ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-xl font-serif text-deepPlum font-medium">
              {winner === 'draw' ? "It's a draw!" : `${winner} wins!`}
            </motion.div>
          ) : (
            <div className="text-lg font-serif text-deepPlum/70">
              {xIsNext ? 'Your turn (X)' : (mode === 'ai' ? 'Bee is thinking...' : 'Player 2 (O)')}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!winner || !!cell || (!xIsNext && mode === 'ai')}
              className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-5xl font-light hover:bg-gray-50 transition-colors"
            >
              {cell && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }}
                  className={cell === 'X' ? 'text-dustyRose' : 'text-sage'}
                >
                  {cell}
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
