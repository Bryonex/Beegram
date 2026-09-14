import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { gameService } from '../../services/gameService'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { useToast } from '../../contexts/ToastContext'

const width = 8
const candyColors = ['🍬', '🍭', '🍫', '🍩', '🍪', '🧁']

export function CandyCrush({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  
  const { profile } = useCurrentProfile()
  const { success } = useToast()

  useEffect(() => {
    loadHighScore()
  }, [profile?.relationship_id])

  const loadHighScore = async () => {
    if (!profile?.relationship_id) return
    try {
      const score = await gameService.getHighScore(profile.relationship_id, 'candy')
      if (score > 0) setHighScore(score)
    } catch (err) {
      console.error(err)
    }
  }

  const saveScore = async (newScore: number) => {
    if (!profile?.relationship_id) return
    if (newScore > highScore) {
      setHighScore(newScore)
      success('New High Score!')
      await gameService.submitScore(
        profile.relationship_id,
        profile.id,
        'candy',
        newScore
      )
    }
  }

  const checkColumnForThree = useCallback(() => {
    let newScore = score
    let changed = false
    const newBoard = [...board]
    for (let i = 0; i <= 47; i++) {
      const columnOfThree = [i, i + width, i + width * 2]
      const decidedColor = newBoard[i]
      const isBlank = newBoard[i] === ''

      if (columnOfThree.every(square => newBoard[square] === decidedColor && !isBlank)) {
        newScore += 3
        changed = true
        columnOfThree.forEach(square => newBoard[square] = '')
      }
    }
    if (changed) {
      setScore(newScore)
      setBoard(newBoard)
      saveScore(newScore)
      return true
    }
    return false
  }, [board, score])

  const checkRowForThree = useCallback(() => {
    let newScore = score
    let changed = false
    const newBoard = [...board]
    for (let i = 0; i < 64; i++) {
      const rowOfThree = [i, i + 1, i + 2]
      const decidedColor = newBoard[i]
      const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63]
      const isBlank = newBoard[i] === ''

      if (notValid.includes(i)) continue

      if (rowOfThree.every(square => newBoard[square] === decidedColor && !isBlank)) {
        newScore += 3
        changed = true
        rowOfThree.forEach(square => newBoard[square] = '')
      }
    }
    if (changed) {
      setScore(newScore)
      setBoard(newBoard)
      saveScore(newScore)
      return true
    }
    return false
  }, [board, score])

  const moveIntoSquareBelow = useCallback(() => {
    let changed = false
    const newBoard = [...board]
    for (let i = 0; i <= 55; i++) {
      const firstRow = [0, 1, 2, 3, 4, 5, 6, 7]
      const isFirstRow = firstRow.includes(i)

      if (isFirstRow && newBoard[i] === '') {
        let randomColor = Math.floor(Math.random() * candyColors.length)
        newBoard[i] = candyColors[randomColor]
        changed = true
      }

      if (newBoard[i + width] === '') {
        newBoard[i + width] = newBoard[i]
        newBoard[i] = ''
        changed = true
      }
    }
    if (changed) {
      setBoard(newBoard)
    }
  }, [board])

  useEffect(() => {
    const timer = setInterval(() => {
      checkColumnForThree()
      checkRowForThree()
      moveIntoSquareBelow()
    }, 150)
    return () => clearInterval(timer)
  }, [checkColumnForThree, checkRowForThree, moveIntoSquareBelow])

  const createBoard = () => {
    const randomColorArrangement = []
    for (let i = 0; i < width * width; i++) {
      const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)]
      randomColorArrangement.push(randomColor)
    }
    setBoard(randomColorArrangement)
  }

  useEffect(() => {
    createBoard()
  }, [])

  const handleCandyClick = (index: number) => {
    if (draggedIdx === null) {
      setDraggedIdx(index)
    } else {
      // Check if adjacent
      const validMoves = [
        draggedIdx - 1, draggedIdx + 1,
        draggedIdx - width, draggedIdx + width
      ]
      
      const isLeftEdge = draggedIdx % width === 0
      const isRightEdge = draggedIdx % width === width - 1

      if (isLeftEdge) {
        validMoves.splice(validMoves.indexOf(draggedIdx - 1), 1)
      }
      if (isRightEdge) {
        validMoves.splice(validMoves.indexOf(draggedIdx + 1), 1)
      }

      const validMove = validMoves.includes(index)

      if (validMove) {
        const newBoard = [...board]
        const temp = newBoard[draggedIdx]
        newBoard[draggedIdx] = newBoard[index]
        newBoard[index] = temp
        setBoard(newBoard)
      }
      
      setDraggedIdx(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF5F5] flex flex-col pt-safe">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/50 backdrop-blur-md border-b border-black/5">
        <button onClick={onBack} className="p-2 -ml-2 text-black/60 hover:text-black">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="font-serif text-lg font-medium text-pink-600">Sweet Match</h2>
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-black/60 mt-1">
            <span className="flex items-center gap-1">
              Score: {score}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Trophy className="w-3 h-3" /> {highScore}
            </span>
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div 
          className="w-full max-w-[400px] aspect-square bg-white rounded-2xl shadow-sm border border-pink-100 p-2 flex flex-wrap"
        >
          <AnimatePresence>
            {board.map((candy, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleCandyClick(index)}
                className={`w-[12.5%] h-[12.5%] flex items-center justify-center text-3xl cursor-pointer hover:bg-pink-50 rounded-xl transition-colors ${
                  draggedIdx === index ? 'bg-pink-100 scale-110 shadow-sm z-10 ring-2 ring-pink-300' : ''
                }`}
              >
                {candy}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
