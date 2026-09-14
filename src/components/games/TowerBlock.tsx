import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Trophy } from 'lucide-react'
import { gameService } from '../../services/gameService'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { useToast } from '../../contexts/ToastContext'

type Block = {
  x: number
  y: number
  width: number
  color: string
}

const GAME_WIDTH = 300
const BLOCK_HEIGHT = 30
const INITIAL_WIDTH = 200

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5']

export function TowerBlock({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  
  const { profile } = useCurrentProfile()
  const { success } = useToast()

  const [blocks, setBlocks] = useState<Block[]>([
    { x: GAME_WIDTH / 2 - INITIAL_WIDTH / 2, y: 0, width: INITIAL_WIDTH, color: COLORS[0] }
  ])
  
  const [movingBlock, setMovingBlock] = useState<Block | null>(null)
  const requestRef = useRef<number>(0)
  const speedRef = useRef(3)
  const directionRef = useRef(1)
  const blocksRef = useRef(blocks)
  const movingBlockRef = useRef(movingBlock)
  const gameOverRef = useRef(gameOver)

  useEffect(() => {
    blocksRef.current = blocks
    movingBlockRef.current = movingBlock
    gameOverRef.current = gameOver
  }, [blocks, movingBlock, gameOver])

  useEffect(() => {
    loadHighScore()
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [profile?.relationship_id])

  const loadHighScore = async () => {
    if (!profile?.relationship_id) return
    try {
      const score = await gameService.getHighScore(profile.relationship_id, 'tower')
      if (score > 0) setHighScore(score)
    } catch (err) {
      console.error(err)
    }
  }

  const saveScore = async (finalScore: number) => {
    if (!profile?.relationship_id) return
    if (finalScore > highScore) {
      setHighScore(finalScore)
      success('New High Score!')
      await gameService.submitScore(
        profile.relationship_id,
        profile.id,
        'tower',
        finalScore
      )
    }
  }

  const startGame = () => {
    setScore(0)
    setGameOver(false)
    setGameStarted(true)
    const initialBlocks = [{ x: GAME_WIDTH / 2 - INITIAL_WIDTH / 2, y: 0, width: INITIAL_WIDTH, color: COLORS[0] }]
    setBlocks(initialBlocks)
    speedRef.current = 3
    spawnBlock(initialBlocks, 1)
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
    requestRef.current = requestAnimationFrame(update)
  }

  const spawnBlock = (currentBlocks: Block[], nextLevel: number) => {
    const topBlock = currentBlocks[currentBlocks.length - 1]
    const newBlock = {
      x: 0,
      y: nextLevel * BLOCK_HEIGHT,
      width: topBlock.width,
      color: COLORS[nextLevel % COLORS.length]
    }
    setMovingBlock(newBlock)
    movingBlockRef.current = newBlock
  }

  const update = () => {
    if (gameOverRef.current || !movingBlockRef.current) return

    const block = movingBlockRef.current
    let newX = block.x + speedRef.current * directionRef.current

    if (newX <= 0) {
      newX = 0
      directionRef.current = 1
    } else if (newX + block.width >= GAME_WIDTH) {
      newX = GAME_WIDTH - block.width
      directionRef.current = -1
    }

    setMovingBlock({ ...block, x: newX })
    requestRef.current = requestAnimationFrame(update)
  }

  const placeBlock = () => {
    if (gameOver || !movingBlock) return

    const currentBlocks = blocksRef.current
    const topBlock = currentBlocks[currentBlocks.length - 1]
    
    const overlapStart = Math.max(topBlock.x, movingBlock.x)
    const overlapEnd = Math.min(topBlock.x + topBlock.width, movingBlock.x + movingBlock.width)
    const overlapWidth = overlapEnd - overlapStart

    if (overlapWidth <= 0) {
      // Missed completely
      setGameOver(true)
      setMovingBlock(null)
      saveScore(score)
      return
    }

    // Success - slice block
    const placedBlock = {
      ...movingBlock,
      x: overlapStart,
      width: overlapWidth
    }

    const newBlocks = [...currentBlocks, placedBlock]
    setBlocks(newBlocks)
    setScore(s => s + 1)
    
    // Increase speed slightly
    speedRef.current += 0.2

    spawnBlock(newBlocks, newBlocks.length)
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#2A2B38] flex flex-col pt-safe text-white select-none"
      onClick={() => gameStarted && !gameOver && placeBlock()}
    >

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#1A1B26]/80 backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white relative z-20">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center absolute inset-x-0 pointer-events-none">
          <div className="text-3xl font-black font-sans tracking-widest">{score}</div>
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#FFD700] mt-1">
            <Trophy className="w-3 h-3" /> {highScore}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative overflow-hidden flex justify-center">
        <div 
          className="relative h-full"
          style={{ width: GAME_WIDTH }}
        >
          {/* Camera adjustment based on height */}
          <div 
            className="absolute bottom-10 left-0 transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateY(${Math.max(0, (blocks.length - 10) * BLOCK_HEIGHT)}px)`
            }}
          >
            {blocks.map((block, i) => (
              <div
                key={i}
                className="absolute border-t border-white/20 shadow-sm"
                style={{
                  bottom: block.y,
                  left: block.x,
                  width: block.width,
                  height: BLOCK_HEIGHT,
                  backgroundColor: block.color,
                  transition: 'background-color 0.2s'
                }}
              />
            ))}
            
            {movingBlock && !gameOver && (
              <div
                className="absolute border-t border-white/20 shadow-md"
                style={{
                  bottom: movingBlock.y,
                  left: movingBlock.x,
                  width: movingBlock.width,
                  height: BLOCK_HEIGHT,
                  backgroundColor: movingBlock.color
                }}
              />
            )}
          </div>
        </div>

        {!gameStarted && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); startGame() }}
              className="bg-white text-[#2A2B38] px-8 py-4 rounded-full font-black tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              TAP TO START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <h3 className="text-4xl font-black text-white mb-2">GAME OVER</h3>
              <p className="text-white/60">Score: {score}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame() }}
              className="bg-[#FF6B6B] text-white px-8 py-4 rounded-full font-black tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FF6B6B]/20"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
