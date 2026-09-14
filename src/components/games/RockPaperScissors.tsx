import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Trophy } from 'lucide-react'
import { gameService } from '../../services/gameService'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { useToast } from '../../contexts/ToastContext'

type Choice = 'rock' | 'paper' | 'scissors' | null
type Result = 'win' | 'lose' | 'draw' | null

const choices = [
  { id: 'rock', emoji: '✊', beats: 'scissors' },
  { id: 'paper', emoji: '✋', beats: 'rock' },
  { id: 'scissors', emoji: '✌️', beats: 'paper' }
] as const

export function RockPaperScissors({ onBack }: { onBack: () => void }) {
  const [streak, setStreak] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [botChoice, setBotChoice] = useState<Choice>(null)
  const [result, setResult] = useState<Result>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const { profile } = useCurrentProfile()
  const { success } = useToast()

  useEffect(() => {
    loadHighScore()
  }, [profile?.relationship_id])

  const loadHighScore = async () => {
    if (!profile?.relationship_id) return
    try {
      const score = await gameService.getHighScore(profile.relationship_id, 'rps')
      if (score > 0) {
        setHighScore(score)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const saveScore = async (newStreak: number) => {
    if (!profile?.relationship_id) return
    if (newStreak > highScore) {
      setHighScore(newStreak)
      success('New High Score!')
      await gameService.submitScore(
        profile.relationship_id,
        profile.id,
        'rps',
        newStreak
      )
    }
  }

  const play = (choice: Choice) => {
    if (!choice || isPlaying) return
    setIsPlaying(true)
    setPlayerChoice(choice)
    
    // Simulate thinking
    setTimeout(() => {
      const bot = choices[Math.floor(Math.random() * choices.length)].id
      setBotChoice(bot)
      
      const playerObj = choices.find(c => c.id === choice)
      let currentResult: Result = 'draw'
      
      if (playerObj?.beats === bot) {
        currentResult = 'win'
        setStreak(s => s + 1)
      } else if (choice !== bot) {
        currentResult = 'lose'
        saveScore(streak)
        setStreak(0)
      }
      
      setResult(currentResult)
      
      setTimeout(() => {
        setIsPlaying(false)
        if (currentResult === 'lose') {
          setPlayerChoice(null)
          setBotChoice(null)
          setResult(null)
        }
      }, 2000)
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F3E9] flex flex-col pt-safe">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/50 backdrop-blur-md border-b border-black/5">
        <button onClick={onBack} className="p-2 -ml-2 text-black/60 hover:text-black">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="font-serif text-lg font-medium">Rock Paper Scissors</h2>
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-black/60 mt-1">
            <span className="flex items-center gap-1">
              Streak: {streak}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Trophy className="w-3 h-3" /> {highScore}
            </span>
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-12">
        
        {/* Bot Area */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm font-medium text-black/40 uppercase tracking-widest">Bot</div>
          <motion.div 
            className="w-32 h-32 bg-white rounded-3xl shadow-sm border border-black/5 flex items-center justify-center text-6xl"
            animate={{ 
              rotate: isPlaying && !botChoice ? [0, -10, 10, -10, 10, 0] : 0 
            }}
            transition={{ duration: 0.5, repeat: isPlaying && !botChoice ? Infinity : 0 }}
          >
            {botChoice ? choices.find(c => c.id === botChoice)?.emoji : '🤖'}
          </motion.div>
        </div>

        {/* Result Area */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`text-2xl font-black uppercase tracking-widest ${
                  result === 'win' ? 'text-green-500' :
                  result === 'lose' ? 'text-red-500' :
                  'text-black/40'
                }`}
              >
                {result === 'win' ? 'YOU WIN!' : result === 'lose' ? 'YOU LOSE!' : 'DRAW!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="text-sm font-medium text-black/40 uppercase tracking-widest">You</div>
          <div className="flex justify-center gap-4 w-full">
            {choices.map((c) => (
              <button
                key={c.id}
                disabled={isPlaying}
                onClick={() => play(c.id)}
                className={`flex-1 aspect-square bg-white rounded-3xl shadow-sm border border-black/5 flex items-center justify-center text-4xl hover:scale-105 active:scale-95 transition-all ${
                  playerChoice === c.id ? 'ring-4 ring-black/10 scale-110' : ''
                } ${isPlaying && playerChoice !== c.id ? 'opacity-50 grayscale' : ''}`}
              >
                {c.emoji}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
