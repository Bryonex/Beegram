import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft} from 'lucide-react'
import { gameService } from '../../services/gameService'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'

type GameState = 'MENU' | 'READY' | 'STAREDOWN' | 'STRIKE' | 'FEINT' | 'RESULT' | 'GAMEOVER'
type Difficulty = 'WANDERER' | 'WARRIOR' | 'DEMON'

interface AudioState {
  ctx: AudioContext | null
  playTone: (freq: number, type: OscillatorType, dur: number, vol?: number) => void
}

export function ReflexZero({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<GameState>('MENU')
  const [difficulty, setDifficulty] = useState<Difficulty>('WARRIOR')
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [streak, setStreak] = useState(0)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [bestReaction, setBestReaction] = useState<number>(() => parseInt(localStorage.getItem('reflex-best-time') || '9999', 10))
  const [bestScore, setBestScore] = useState<number>(0)
  const [resultMsg, setResultMsg] = useState('')
  const [visualEffect, setVisualEffect] = useState<'none' | 'flash' | 'slash' | 'shake' | 'feint'>('none')

  const { profile } = useCurrentProfile()

  const strikeStartTime = useRef<number>(0)
  const timeoutRefs = useRef<number[]>([])
  const audioRef = useRef<AudioState>({ ctx: null, playTone: () => {} })

  useEffect(() => {
    // Init audio context on first interaction
    const initAudio = () => {
      if (!audioRef.current.ctx) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const playTone = (freq: number, type: OscillatorType, dur: number, vol = 0.1) => {
          if (ctx.state === 'suspended') ctx.resume()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = type
          osc.frequency.setValueAtTime(freq, ctx.currentTime)
          
          gain.gain.setValueAtTime(vol, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur)
          
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + dur)
        }
        audioRef.current = { ctx, playTone }
      }
    }
    
    document.addEventListener('pointerdown', initAudio, { once: true })
    return () => {
      document.removeEventListener('pointerdown', initAudio)
      clearTimeouts()
    }
  }, [])

  useEffect(() => {
    if (profile?.relationship_id) {
      gameService.getHighScore(profile.relationship_id, 'reflexzero').then(score => {
        setBestScore(score)
      })
    }
  }, [profile?.relationship_id])

  const playSound = (type: 'ready' | 'strike' | 'hit' | 'death' | 'feint') => {
    const { playTone } = audioRef.current
    switch (type) {
      case 'ready': playTone(220, 'sine', 0.5, 0.05); break;
      case 'strike': playTone(880, 'square', 0.1, 0.1); break;
      case 'hit': playTone(150, 'sawtooth', 0.3, 0.2); playTone(100, 'square', 0.3, 0.2); break;
      case 'death': playTone(50, 'sawtooth', 1.0, 0.3); break;
      case 'feint': playTone(300, 'triangle', 0.2, 0.05); break;
    }
  }

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }

  const addTimeout = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay)
    timeoutRefs.current.push(id)
  }

  const startRound = () => {
    setGameState('READY')
    setVisualEffect('none')
    setReactionTime(null)
    playSound('ready')
    
    addTimeout(() => {
      setGameState('STAREDOWN')
      
      // Calculate delay based on difficulty
      let baseDelay = 2000
      let randDelay = 3000
      if (difficulty === 'WANDERER') { baseDelay = 1500; randDelay = 2000; }
      if (difficulty === 'DEMON') { baseDelay = 2500; randDelay = 4000; }
      
      const staredownTime = baseDelay + Math.random() * randDelay
      
      addTimeout(() => {
        // Decide feint or strike
        let feintChance = 0.2
        if (difficulty === 'WANDERER') feintChance = 0.1
        if (difficulty === 'DEMON') feintChance = 0.35
        
        if (Math.random() < feintChance) {
          triggerFeint()
        } else {
          triggerStrike()
        }
      }, staredownTime)
      
    }, 1500)
  }

  const triggerFeint = () => {
    setGameState('FEINT')
    setVisualEffect('feint')
    playSound('feint')
    
    addTimeout(() => {
      if (gameState !== 'GAMEOVER') {
        // Back to staredown after feint
        setVisualEffect('none')
        setGameState('STAREDOWN')
        addTimeout(triggerStrike, 1000 + Math.random() * 2000)
      }
    }, 400)
  }

  const triggerStrike = () => {
    setGameState('STRIKE')
    setVisualEffect('flash')
    playSound('strike')
    strikeStartTime.current = performance.now()
    
    // Death window
    let window = 600
    if (difficulty === 'WANDERER') window = 800
    if (difficulty === 'DEMON') window = 400
    // gets faster as streak goes up
    window = Math.max(250, window - (streak * 10))
    
    addTimeout(() => {
      // If still in STRIKE state after window, enemy kills player
      if (document.getElementById('reflex-container')?.dataset.state === 'STRIKE') {
        handleDeath("Too slow.")
      }
    }, window)
  }

  const handleDeath = (msg: string) => {
    clearTimeouts()
    setGameState('GAMEOVER')
    setResultMsg(msg)
    setVisualEffect('shake')
    playSound('death')
    
    if (score > bestScore) {
      setBestScore(score)
      if (profile?.relationship_id && profile?.id) {
        gameService.submitScore(profile.relationship_id, profile.id, 'reflexzero', score)
      }
    }
  }

  const handleAction = () => {
    if (gameState === 'MENU' || gameState === 'GAMEOVER') return
    
    if (gameState === 'READY' || gameState === 'STAREDOWN' || gameState === 'FEINT') {
      // Early strike
      handleDeath(gameState === 'FEINT' ? "Fell for the feint." : "Struck too early.")
      return
    }
    
    if (gameState === 'STRIKE') {
      // Successful strike
      const rTime = Math.floor(performance.now() - strikeStartTime.current)
      clearTimeouts()
      setReactionTime(rTime)
      setGameState('RESULT')
      setVisualEffect('slash')
      playSound('hit')
      
      const pts = Math.max(10, 1000 - rTime) * (difficulty === 'DEMON' ? 2 : difficulty === 'WANDERER' ? 0.5 : 1)
      setScore(s => s + Math.floor(pts))
      setStreak(s => s + 1)
      setRound(r => r + 1)
      
      if (rTime < bestReaction || bestReaction === 9999) {
        setBestReaction(rTime)
        localStorage.setItem('reflex-best-time', rTime.toString())
      }
      
      addTimeout(() => {
        startRound()
      }, 2000)
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleAction()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, difficulty, score, streak])

  const restart = () => {
    setScore(0)
    setRound(1)
    setStreak(0)
    startRound()
  }

  return (
    <div 
      id="reflex-container"
      data-state={gameState}
      className={`w-full min-h-[100dvh] flex flex-col relative select-none touch-none overflow-hidden transition-colors duration-300
        ${gameState === 'GAMEOVER' ? 'bg-[#2A1B1F]' : 'bg-[#1C1A27]'}
        ${visualEffect === 'shake' ? 'animate-[shake_0.5s_ease-in-out]' : ''}
      `}
      onPointerDown={handleAction}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px) rotate(-1deg); }
          40% { transform: translateX(10px) rotate(1deg); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes flash {
          0% { background-color: white; }
          100% { background-color: transparent; }
        }
        @keyframes slash {
          0% { clip-path: polygon(0 50%, 100% 50%, 100% 50%, 0 50%); opacity: 1; }
          50% { clip-path: polygon(0 40%, 100% 10%, 100% 60%, 0 90%); opacity: 1; }
          100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 0; }
        }
      `}</style>

      {/* Screen Effects */}
      {visualEffect === 'flash' && <div className="absolute inset-0 z-10 pointer-events-none bg-white animate-[flash_0.2s_ease-out]" />}
      {visualEffect === 'slash' && <div className="absolute inset-0 z-10 pointer-events-none bg-[#E5484D] animate-[slash_0.3s_ease-out]" />}
      
      <div className="px-5 pt-safe-top mt-6 sticky top-0 z-20 flex items-center justify-between">
        <button 
          onClick={(e) => { e.stopPropagation(); onBack(); }} 
          className="w-10 h-10 rounded-full bg-[#2D2A3B] shadow-sm flex items-center justify-center text-[#E5484D] hover:bg-[#3A364C] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[#E5484D] font-serif text-sm opacity-80 uppercase tracking-widest">ReflexZero</div>
            <div className="text-[#D8D4CF] text-xs font-sans">Don't blink.</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 relative z-10 pointer-events-none">
        
        {/* HUD */}
        {gameState !== 'MENU' && (
          <div className="absolute top-4 w-full px-8 flex justify-between text-[#D8D4CF] font-serif text-sm opacity-60">
            <div>Score: {score}</div>
            <div>Round: {round}</div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {gameState === 'MENU' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center pointer-events-auto">
              <h1 className="text-5xl font-serif text-[#D8D4CF] mb-2 tracking-wide">Reflex<span className="text-[#E5484D]">Zero</span></h1>
              <p className="text-[#D8D4CF]/60 mb-12 uppercase tracking-widest text-sm">Path of the Ronin</p>
              
              <div className="flex flex-col gap-4 w-64 mx-auto mb-12">
                {(['WANDERER', 'WARRIOR', 'DEMON'] as Difficulty[]).map(d => (
                  <button 
                    key={d}
                    onClick={(e) => { e.stopPropagation(); setDifficulty(d); }}
                    className={`py-3 px-6 rounded-none border border-[#E5484D]/30 uppercase tracking-widest text-sm transition-colors
                      ${difficulty === d ? 'bg-[#E5484D]/20 text-[#E5484D] border-[#E5484D]' : 'text-[#D8D4CF]/60 hover:text-[#D8D4CF]'}
                    `}
                  >
                    {d}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); startRound(); }}
                className="py-4 px-12 bg-[#E5484D] text-[#1C1A27] font-bold uppercase tracking-widest hover:bg-[#F2555A] transition-colors"
              >
                Begin
              </button>
            </motion.div>
          )}

          {gameState === 'READY' && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[#D8D4CF] text-2xl font-serif tracking-widest uppercase">
              Ready
            </motion.div>
          )}

          {gameState === 'STAREDOWN' && (
            <motion.div key="staredown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[#E5484D]/60 text-xl font-serif tracking-widest uppercase">
              ...
            </motion.div>
          )}

          {gameState === 'FEINT' && (
            <motion.div key="feint" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-[#D8D4CF] text-3xl font-serif tracking-widest uppercase blur-[1px]">
              !!
            </motion.div>
          )}

          {gameState === 'STRIKE' && (
            <motion.div key="strike" initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-[#E5484D] text-6xl font-serif font-bold tracking-widest uppercase">
              STRIKE
            </motion.div>
          )}

          {gameState === 'RESULT' && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-[#D8D4CF] text-4xl font-serif mb-2">{reactionTime}ms</div>
              <div className="text-[#E5484D] text-sm uppercase tracking-widest">Streak: {streak}</div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pointer-events-auto">
              <div className="text-[#E5484D] text-5xl font-serif mb-4 uppercase tracking-wider">Run Over</div>
              <div className="text-[#D8D4CF] text-lg font-serif mb-8">{resultMsg}</div>
              
              <div className="flex gap-8 justify-center mb-12 text-sm uppercase tracking-widest">
                <div className="text-left">
                  <div className="text-[#D8D4CF]/50 mb-1">Score</div>
                  <div className="text-[#D8D4CF] text-xl">{score}</div>
                </div>
                <div className="text-left">
                  <div className="text-[#D8D4CF]/50 mb-1">Best</div>
                  <div className="text-[#E5484D] text-xl">{bestScore}</div>
                </div>
                <div className="text-left">
                  <div className="text-[#D8D4CF]/50 mb-1">Fastest</div>
                  <div className="text-[#D8D4CF] text-xl">{bestReaction === 9999 ? '-' : `${bestReaction}ms`}</div>
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); restart(); }}
                className="py-4 px-12 border border-[#E5484D] text-[#E5484D] font-bold uppercase tracking-widest hover:bg-[#E5484D] hover:text-[#1C1A27] transition-colors"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Enemy Silhouette graphic */}
      {gameState !== 'MENU' && gameState !== 'GAMEOVER' && (
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[300px] pointer-events-none opacity-20 transition-opacity duration-300" style={{ opacity: gameState === 'STAREDOWN' ? 0.4 : gameState === 'STRIKE' ? 0.8 : 0.2 }}>
            <svg viewBox="0 0 100 150" fill="#E5484D">
              <path d="M50 10 C60 10 65 20 60 30 C55 40 45 40 40 30 C35 20 40 10 50 10 Z" />
              <path d="M30 40 Q50 35 70 40 L80 150 L20 150 Z" />
            </svg>
         </div>
      )}

      {/* Instruction */}
      {(gameState === 'READY' || gameState === 'STAREDOWN') && (
        <div className="absolute bottom-12 w-full text-center text-[#D8D4CF]/30 text-xs uppercase tracking-widest pointer-events-none">
          Tap anywhere to strike
        </div>
      )}
    </div>
  )
}
