import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { gameService } from '../../services/gameService'

interface FishCatchProps {
  onBack: () => void
}

interface Fish {
  id: number
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
}

const PLAYER_START_RADIUS = 15
const MAX_PLAYER_RADIUS = 100
const COLORS = ['#FF9A9E', '#FECFEF', '#A18CD1', '#FBC2EB', '#84FAB0', '#8FD3F4', '#FFECD2', '#FCB69F']

export function FishCatch({ onBack }: FishCatchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  
  const { profile } = useCurrentProfile()
  
  // Game State Refs (to avoid re-renders during loop)
  const playerRef = useRef({ x: 0, y: 0, radius: PLAYER_START_RADIUS, targetX: 0, targetY: 0 })
  const fishesRef = useRef<Fish[]>([])
  const frameRef = useRef<number>(0)
  const scoreRef = useRef(0)
  const fishIdCounter = useRef(0)

  useEffect(() => {
    if (profile?.relationship_id) {
      gameService.getHighScore(profile.relationship_id!, 'fish').then(score => setBestScore(score))
    }
  }, [profile])

  const spawnFish = (canvasWidth: number, canvasHeight: number) => {
    // Spawn mostly smaller or slightly larger fish, occasionally huge
    const isHuge = Math.random() < 0.1
    const pRadius = playerRef.current.radius
    let radius = isHuge 
      ? pRadius + 20 + Math.random() * 40
      : Math.max(8, pRadius - 10 + Math.random() * (pRadius > 30 ? 30 : pRadius + 5))
      
    // Determine spawn edge (0: top, 1: right, 2: bottom, 3: left)
    const edge = Math.floor(Math.random() * 4)
    let x = 0, y = 0, vx = 0, vy = 0
    const speed = (Math.random() * 1.5 + 0.5) * (15 / Math.max(10, radius)) // smaller = faster
    
    if (edge === 0) {
      x = Math.random() * canvasWidth
      y = -radius
      vx = (Math.random() - 0.5) * speed
      vy = speed
    } else if (edge === 1) {
      x = canvasWidth + radius
      y = Math.random() * canvasHeight
      vx = -speed
      vy = (Math.random() - 0.5) * speed
    } else if (edge === 2) {
      x = Math.random() * canvasWidth
      y = canvasHeight + radius
      vx = (Math.random() - 0.5) * speed
      vy = -speed
    } else {
      x = -radius
      y = Math.random() * canvasHeight
      vx = speed
      vy = (Math.random() - 0.5) * speed
    }

    // Don't spawn large fish dangerously close to player
    const distToPlayer = Math.hypot(x - playerRef.current.x, y - playerRef.current.y)
    if (radius > pRadius && distToPlayer < pRadius + radius + 100) {
      return // Cancel spawn this frame if it's too dangerous
    }

    fishesRef.current.push({
      id: fishIdCounter.current++,
      x, y, radius, vx, vy,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    })
  }

  const startGame = () => {
    setGameOver(false)
    setScore(0)
    scoreRef.current = 0
    fishesRef.current = []
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      playerRef.current = {
        x: rect.width / 2,
        y: rect.height / 2,
        targetX: rect.width / 2,
        targetY: rect.height / 2,
        radius: PLAYER_START_RADIUS
      }
    }
    
    setIsPlaying(true)
  }

  const handleGameOver = async () => {
    setIsPlaying(false)
    setGameOver(true)
    
    if (profile?.relationship_id && scoreRef.current > bestScore) {
      setBestScore(scoreRef.current)
      await gameService.submitScore(profile.relationship_id, profile.id, 'fish', scoreRef.current)
    }
  }

  useEffect(() => {
    if (!isPlaying) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const resize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth
        canvas.height = containerRef.current.clientHeight
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let lastSpawnTime = 0

    const drawFish = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, isPlayer: boolean, vx: number) => {
      ctx.save()
      ctx.translate(x, y)
      // Flip if moving left
      if (vx < 0) {
        ctx.scale(-1, 1)
      }

      // Tail
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(-r * 0.5, 0)
      ctx.lineTo(-r * 1.2, -r * 0.6)
      ctx.lineTo(-r * 1.2, r * 0.6)
      ctx.fill()

      // Body
      ctx.beginPath()
      ctx.ellipse(0, 0, r, r * 0.7, 0, 0, Math.PI * 2)
      ctx.fill()

      // Eye
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(r * 0.4, -r * 0.2, r * 0.2, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = isPlayer ? '#1e3a8a' : '#000'
      ctx.beginPath()
      ctx.arc(r * 0.5, -r * 0.2, r * 0.08, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const loop = (timestamp: number) => {
      // Spawn logic
      if (timestamp - lastSpawnTime > 600 - (scoreRef.current * 0.5)) { // speeds up slightly
        spawnFish(canvas.width, canvas.height)
        lastSpawnTime = timestamp
      }

      // Update Player
      const p = playerRef.current
      // Smooth follow target
      const dx = p.targetX - p.x
      const dy = p.targetY - p.y
      p.x += dx * 0.1
      p.y += dy * 0.1
      
      // Clamp player to screen
      p.x = Math.max(p.radius, Math.min(canvas.width - p.radius, p.x))
      p.y = Math.max(p.radius, Math.min(canvas.height - p.radius, p.y))

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update fishes
      for (let i = fishesRef.current.length - 1; i >= 0; i--) {
        const f = fishesRef.current[i]
        f.x += f.vx
        f.y += f.vy

        // Remove offscreen
        if (f.x < -f.radius * 2 || f.x > canvas.width + f.radius * 2 || 
            f.y < -f.radius * 2 || f.y > canvas.height + f.radius * 2) {
          fishesRef.current.splice(i, 1)
          continue
        }

        drawFish(ctx, f.x, f.y, f.radius, f.color, false, f.vx)

        // Collision
        const dist = Math.hypot(p.x - f.x, p.y - f.y)
        if (dist < (p.radius * 0.7 + f.radius * 0.7)) { // * 0.7 for elliptical forgiveness
          if (p.radius > f.radius) {
            // Eat
            fishesRef.current.splice(i, 1)
            scoreRef.current += Math.floor(f.radius)
            setScore(scoreRef.current)
            if (p.radius < MAX_PLAYER_RADIUS) {
              p.radius += (f.radius / p.radius) * 1.5 // Diminishing returns on growth
            }
          } else {
            // Die
            handleGameOver()
            return // Stop loop
          }
        }
      }

      // Draw Player
      drawFish(ctx, p.x, p.y, p.radius, '#FBBF24', true, dx) // Amber player

      if (isPlaying) {
        frameRef.current = requestAnimationFrame(loop)
      }
    }

    frameRef.current = requestAnimationFrame(loop)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isPlaying])

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPlaying) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      playerRef.current.targetX = e.clientX - rect.left
      playerRef.current.targetY = e.clientY - rect.top
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0099F7] flex flex-col font-sans" style={{ background: 'linear-gradient(to bottom, #0099F7, #0052D4)' }}>
      {/* Header */}
      <div className="pt-safe flex items-center justify-between p-4 z-10 text-white">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Score</span>
          <span className="text-2xl font-black">{score}</span>
        </div>
        <div className="w-10 h-10" />
      </div>

      {/* Game Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden touch-none"
        onPointerDown={handlePointerMove}
        onPointerMove={handlePointerMove}
      >
        {/* Bubbles bg effect */}
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_10%,_transparent_10%)] bg-[length:40px_40px]" />
        
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

      </div>

      {/* Start / Game Over Screens */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 pointer-events-auto"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl flex flex-col items-center text-white max-w-sm w-full mx-5 shadow-2xl">
              <h2 className="text-4xl font-black mb-2">{gameOver ? 'GAME OVER' : 'FISH CATCH'}</h2>
              
              {gameOver && (
                <div className="text-center my-6">
                  <p className="text-lg opacity-80 font-medium">Final Score</p>
                  <p className="text-5xl font-black text-amber-300">{score}</p>
                  <p className="text-sm opacity-60 mt-2">Best: {Math.max(score, bestScore)}</p>
                </div>
              )}

              <button 
                onClick={startGame}
                className="w-full py-4 rounded-full bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 active:scale-95 transition-all shadow-lg mt-4 cursor-pointer"
              >
                {gameOver ? 'PLAY AGAIN' : 'START'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
