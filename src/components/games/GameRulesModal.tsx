import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

type GameType = 'reflex' | 'tictactoe' | 'balloons' | 'rps' | 'tower' | 'candy' | 'chess' | 'fish'

interface GameRulesModalProps {
  game: GameType
  onClose: () => void
  onStart: () => void
}

const GAME_RULES: Record<GameType, { title: string; goal: string; controls: string; scoring: string; danger?: string; bg: string }> = {
  fish: {
    title: 'Fish Catch',
    goal: 'Eat smaller fish to grow larger. Survive as long as possible.',
    controls: 'Desktop: Arrow keys. Mobile: Touch and drag.',
    scoring: 'Points for eating fish based on their size.',
    danger: 'Larger fish will eat you. Game over immediately.',
    bg: 'from-blue-600 to-blue-900 text-white',
  },
  reflex: {
    title: 'ReflexZero',
    goal: 'Tap the targets as fast as possible when they turn red.',
    controls: 'Tap the screen.',
    scoring: 'Faster taps = higher score.',
    danger: 'Tapping before it turns red costs you.',
    bg: 'from-slate-800 to-slate-900 text-white',
  },
  tictactoe: {
    title: 'Tic Tac Toe',
    goal: 'Get three in a row (horizontal, vertical, diagonal).',
    controls: 'Tap an empty cell to place your mark.',
    scoring: 'Winning gives you a point.',
    bg: 'from-purple-200 to-purple-300 text-purple-900',
  },
  balloons: {
    title: 'Pop Balloons',
    goal: 'Pop balloons before they float away.',
    controls: 'Tap balloons to pop them.',
    scoring: 'Points for popping. Multipliers for streaks.',
    danger: 'Missing balloons breaks your streak.',
    bg: 'from-rose-200 to-rose-300 text-rose-900',
  },
  rps: {
    title: 'Rock Paper Scissors',
    goal: 'Beat the bot using classic RPS rules.',
    controls: 'Tap Rock, Paper, or Scissors.',
    scoring: 'Build your winning streak.',
    danger: 'Losing resets your streak to 0.',
    bg: 'from-green-100 to-green-200 text-green-900',
  },
  tower: {
    title: 'Tower Block',
    goal: 'Stack blocks as perfectly as possible to build a tall tower.',
    controls: 'Tap to drop the swinging block.',
    scoring: 'Each stacked block is a point. Perfect stacks give bonuses.',
    danger: 'Dropping a block off the edge ends the game.',
    bg: 'from-orange-300 to-orange-400 text-orange-900',
  },
  candy: {
    title: 'Sweet Match',
    goal: 'Match 3 or more identical candies to score.',
    controls: 'Swipe to swap adjacent candies.',
    scoring: 'Larger matches = more points.',
    bg: 'from-pink-300 to-pink-400 text-white',
  },
  chess: {
    title: 'Chess',
    goal: 'Checkmate the opponent\'s king.',
    controls: 'Tap a piece, then tap a valid square.',
    scoring: '1 point per checkmate win.',
    bg: 'from-amber-200 to-amber-300 text-amber-900',
  }
}

export function GameRulesModal({ game, onClose, onStart }: GameRulesModalProps) {
  const rules = GAME_RULES[game]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br ${rules.bg}`}
        >
          <div className="p-6 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
            >
              <X className="w-5 h-5 text-current opacity-80" />
            </button>
            
            <h2 className="text-3xl font-serif font-bold mb-6 pt-2">{rules.title}</h2>
            
            <div className="space-y-4 text-sm font-medium opacity-90">
              <div>
                <h4 className="uppercase tracking-widest text-[10px] opacity-70 mb-1 font-bold">Goal</h4>
                <p>{rules.goal}</p>
              </div>
              
              <div>
                <h4 className="uppercase tracking-widest text-[10px] opacity-70 mb-1 font-bold">Controls</h4>
                <p>{rules.controls}</p>
              </div>
              
              <div>
                <h4 className="uppercase tracking-widest text-[10px] opacity-70 mb-1 font-bold">Scoring</h4>
                <p>{rules.scoring}</p>
              </div>
              
              {rules.danger && (
                <div>
                  <h4 className="uppercase tracking-widest text-[10px] opacity-70 mb-1 font-bold">Danger</h4>
                  <p>{rules.danger}</p>
                </div>
              )}
            </div>

            <button
              onClick={onStart}
              className="mt-8 w-full py-4 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-[0.98] transition-all font-bold tracking-wide border border-white/20 backdrop-blur-md"
            >
              START GAME
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
