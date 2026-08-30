import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Trophy } from 'lucide-react'

interface Balloon {
  id: number
  left: number
  color: string
  points: number
}

const colors = [
  { hex: '#E8A8B8', points: 10 }, // Rose
  { hex: '#765A9E', points: 20 }, // Lavender
  { hex: '#F3C969', points: 15 }, // Sunflower
  { hex: '#A9BEA5', points: 5 },  // Sage
  { hex: '#1a1b2e', points: -20 }, // Bad balloon
]

export function PopBalloons({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('balloons-score') || '0', 10))

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false)
      setBalloons([])
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('balloons-score', score.toString())
      }
    }
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft, score, highScore])

  useEffect(() => {
    let spawner: any;
    if (isPlaying) {
      spawner = setInterval(() => {
        const type = colors[Math.floor(Math.random() * colors.length)]
        setBalloons(prev => [...prev, { 
          id: Date.now() + Math.random(), 
          left: Math.random() * 80 + 10,
          color: type.hex,
          points: type.points
        }])
      }, 700)
    }
    return () => clearInterval(spawner)
  }, [isPlaying])

  const popBalloon = (id: number, points: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (!isPlaying) return
    setScore(s => Math.max(0, s + points))
    setBalloons(prev => prev.filter(b => b.id !== id))
    
    // Add pop effect here if desired (e.g. little floating number)
  }

  const startGame = () => {
    setScore(0)
    setTimeLeft(30)
    setIsPlaying(true)
    setBalloons([])
  }

  return (
    <div className="w-full min-h-[100dvh] flex flex-col relative pt-safe pb-24 bg-sky-50">
      <div className="px-5 pt-6 pb-2 sticky top-0 z-20 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-deepPlum/70">
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
        <h1 className="text-xl font-serif text-deepPlum font-medium">Pop Balloons</h1>
        <div className="w-10 flex justify-end items-center gap-1 text-deepPlum">
          <Trophy className="w-4 h-4 text-sunflower" />
          <span className="text-sm font-bold">{highScore}</span>
        </div>
      </div>

      <div className="flex-1 relative mx-4 mt-6 bg-white/40 backdrop-blur-sm border border-sky-100 rounded-3xl overflow-hidden shadow-sm min-h-[400px]">
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
          <div className="bg-white/80 px-4 py-2 rounded-2xl shadow-sm border border-lavender-mist/50">
             <span className="text-deepPlum/60 text-xs font-bold uppercase tracking-wider block">Score</span>
             <span className="text-2xl font-serif text-deepPlum leading-none">{score}</span>
          </div>
          <div className="bg-white/80 px-4 py-2 rounded-2xl shadow-sm border border-lavender-mist/50 text-right">
            <span className="text-deepPlum/60 text-xs font-bold uppercase tracking-wider block">Time</span>
            <span className={`text-2xl font-serif leading-none ${timeLeft <= 5 ? 'text-red-500' : 'text-deepPlum'}`}>{timeLeft}s</span>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          {!isPlaying ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md z-20 px-6 text-center">
                <div className="text-6xl mb-6">🎈</div>
                {timeLeft === 0 && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-serif text-deepPlum mb-2">Time's Up!</h2>
                    <p className="text-deepPlum/70">You scored {score} points!</p>
                  </div>
                )}
                <button onClick={startGame} className="px-8 py-4 bg-sky-400 text-white rounded-2xl font-medium shadow-md flex items-center gap-2">
                  <Trophy className="w-5 h-5 fill-current" /> {timeLeft === 0 ? 'Play Again' : 'Start Popping'}
                </button>
             </div>
          ) : (
            balloons.map(b => (
              <motion.button
                key={b.id}
                initial={{ top: '110%', opacity: 1, scale: 0.8 }}
                animate={{ top: '-20%', scale: 1.1 }}
                transition={{ duration: 4 + Math.random() * 2, ease: 'linear' }}
                onAnimationComplete={() => setBalloons(prev => prev.filter(x => x.id !== b.id))}
                onClick={(e: any) => popBalloon(b.id, b.points, e)}
                onTouchStart={(e: any) => popBalloon(b.id, b.points, e)}
                className="absolute w-14 h-16 focus:outline-none"
                style={{ left: `${b.left}%` }}
              >
                <div 
                  className="w-full h-full rounded-t-[50%] rounded-b-[40%] shadow-inner flex flex-col justify-end items-center" 
                  style={{ backgroundColor: b.color }}
                >
                  {/* Balloon knot */}
                  <div className="w-2 h-2 -mb-2 border-l border-r border-b opacity-50" style={{ borderColor: b.color }} />
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
