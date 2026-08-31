import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

import { TicTacToe } from '../components/games/TicTacToe'
import { PopBalloons } from '../components/games/PopBalloons'
import { ReflexZero } from '../components/games/ReflexZero'
import { RockPaperScissors } from '../components/games/RockPaperScissors'
import { TowerBlock } from '../components/games/TowerBlock'
import { CandyCrush } from '../components/games/CandyCrush'
import { ChessGame } from '../components/games/ChessGame'
import { gardenService } from '../services/gardenService'
import { useCurrentProfile } from '../hooks/useCurrentProfile'

export default function Games() {
  const navigate = useNavigate()
  const [activeGame, setActiveGame] = useState<'reflex' | 'tictactoe' | 'balloons' | 'rps' | 'tower' | 'candy' | 'chess' | null>(null)
  const { profile } = useCurrentProfile()

  const handlePlayGame = (game: 'reflex' | 'tictactoe' | 'balloons' | 'rps' | 'tower' | 'candy' | 'chess') => {
    setActiveGame(game)
    if (profile?.relationship_id) {
      gardenService.checkAndUnlockAchievement(
        profile.relationship_id,
        profile.id,
        'Lavender',
        'First Game Played',
        'Arcade'
      ).catch(console.error)
    }
  }

  if (activeGame === 'reflex') return <ReflexZero onBack={() => setActiveGame(null)} />
  if (activeGame === 'tictactoe') return <TicTacToe onBack={() => setActiveGame(null)} />
  if (activeGame === 'balloons') return <PopBalloons onBack={() => setActiveGame(null)} />
  if (activeGame === 'rps') return <RockPaperScissors onBack={() => setActiveGame(null)} />
  if (activeGame === 'tower') return <TowerBlock onBack={() => setActiveGame(null)} />
  if (activeGame === 'candy') return <CandyCrush onBack={() => setActiveGame(null)} />
  if (activeGame === 'chess') return <ChessGame onBack={() => setActiveGame(null)} />

  return (
    <div className="w-full min-h-[100dvh] bg-warmPaper flex flex-col relative pt-safe pb-24">
      <div className="px-5 pt-6 pb-2 sticky top-0 bg-warmPaper/80 backdrop-blur-md z-20 flex items-center justify-between border-b border-lavender-mist/50">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-deepPlum/70 hover:text-deepPlum transition-colors"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
        <h1 className="text-xl font-serif text-deepPlum font-medium">Arcade</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 mt-6 space-y-4 relative z-10">
        <button onClick={() => handlePlayGame('tictactoe')} className="w-full bg-[#EAE8F0] p-5 rounded-3xl shadow-sm border border-[#D5CFE1] flex items-center gap-4 text-left hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-3xl">⭕</div>
          <div>
            <h3 className="font-serif text-lg text-deepPlum">Tic Tac Toe</h3>
            <p className="text-xs text-deepPlum/60">Classic strategy game</p>
          </div>
        </button>

        <button onClick={() => handlePlayGame('balloons')} className="w-full bg-[#FFF0F5] p-5 rounded-3xl shadow-sm border border-[#FADCE6] flex items-center gap-4 text-left hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-3xl">🎈</div>
          <div>
            <h3 className="font-serif text-lg text-deepPlum">Pop the Balloons</h3>
            <p className="text-xs text-deepPlum/60">Fast-paced popping action</p>
          </div>
        </button>

        <button onClick={() => handlePlayGame('candy')} className="w-full bg-[#FFF5F5] p-5 rounded-3xl shadow-sm border border-pink-100 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-3xl">🍬</div>
          <div>
            <h3 className="font-serif text-lg text-pink-600">Sweet Match</h3>
            <p className="text-xs text-pink-600/60">Match 3 puzzle game</p>
          </div>
        </button>

        <button onClick={() => handlePlayGame('chess')} className="w-full bg-[#F0D9B5] p-5 rounded-3xl shadow-sm border border-[#B58863]/30 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-3xl">♟️</div>
          <div>
            <h3 className="font-serif text-lg text-[#4A3219]">Chess</h3>
            <p className="text-xs text-[#4A3219]/60">Classic strategy</p>
          </div>
        </button>

        <button onClick={() => handlePlayGame('rps')} className="w-full bg-[#F5F3E9] p-5 rounded-3xl shadow-sm border border-black/5 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-3xl">✌️</div>
          <div>
            <h3 className="font-serif text-lg text-black/80">Rock Paper Scissors</h3>
            <p className="text-xs text-black/40">Beat the bot</p>
          </div>
        </button>

        <button onClick={() => handlePlayGame('tower')} className="w-full bg-[#2A2B38] p-5 rounded-3xl shadow-md border border-white/10 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl">🏗️</div>
          <div>
            <h3 className="font-serif text-lg text-white">Tower Block</h3>
            <p className="text-xs text-white/60">Build to the sky</p>
          </div>
        </button>

        <button onClick={() => handlePlayGame('reflex')} className="w-full bg-[#1C1A27] p-5 rounded-3xl shadow-md border border-[#E5484D]/30 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-[#2D2A3B] rounded-2xl flex items-center justify-center text-3xl">⚔️</div>
          <div>
            <h3 className="font-serif text-lg text-[#E5484D] uppercase tracking-widest">ReflexZero</h3>
            <p className="text-xs text-[#D8D4CF]/60">Don't blink.</p>
          </div>
        </button>

      </div>
    </div>
  )
}
