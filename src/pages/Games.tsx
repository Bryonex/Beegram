import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Crown } from 'lucide-react'

import { TicTacToe } from '../components/games/TicTacToe'
import { PopBalloons } from '../components/games/PopBalloons'
import { ReflexZero } from '../components/games/ReflexZero'
import { RockPaperScissors } from '../components/games/RockPaperScissors'
import { TowerBlock } from '../components/games/TowerBlock'
import { CandyCrush } from '../components/games/CandyCrush'
import { ChessGame } from '../components/games/ChessGame'
import { FishCatch } from '../components/games/FishCatch'
import { gardenService } from '../services/gardenService'
import { gameService } from '../services/gameService'
import type { UserLeaderboard } from '../services/gameService'
import { useCurrentProfile } from '../hooks/useCurrentProfile'
import { GameRulesModal } from '../components/games/GameRulesModal'

export default function Games() {
  const navigate = useNavigate()
  const [activeGame, setActiveGame] = useState<'reflex' | 'tictactoe' | 'balloons' | 'rps' | 'tower' | 'candy' | 'chess' | 'fish' | null>(null)
  const [rulesGame, setRulesGame] = useState<'reflex' | 'tictactoe' | 'balloons' | 'rps' | 'tower' | 'candy' | 'chess' | 'fish' | null>(null)
  const { profile, partner } = useCurrentProfile()
  const [leaderboard, setLeaderboard] = useState<Record<string, UserLeaderboard>>({})

  useEffect(() => {
    if (profile?.relationship_id) {
      gameService.getLeaderboard(profile.relationship_id).then(setLeaderboard).catch(console.error)
    }
  }, [profile?.relationship_id, activeGame])

  const handleShowRules = (game: typeof activeGame) => {
    setRulesGame(game)
  }

  const handleStartGame = () => {
    const game = rulesGame
    setRulesGame(null)
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
  if (activeGame === 'fish') return <FishCatch onBack={() => setActiveGame(null)} />

  const myScore = profile?.id ? leaderboard[profile.id]?.overallScore || 0 : 0
  const partnerScore = partner?.id ? leaderboard[partner.id]?.overallScore || 0 : 0
  const leaderId = myScore >= partnerScore ? profile?.id : partner?.id

  return (
    <div className="w-full min-h-[100dvh] bg-[#FFFBF0] flex flex-col relative pt-safe pb-28">
      <div className="px-5 pt-6 pb-4 sticky top-0 bg-[#FFFBF0]/90 backdrop-blur-md z-20 border-b border-black/5">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-900/70 hover:text-amber-900 transition-colors border border-amber-100"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          <h1 className="text-xl font-serif text-amber-900 font-bold">Arcade</h1>
          <div className="w-10" />
        </div>

        {/* Global Scorecard */}
        <div className="w-full bg-white rounded-3xl p-4 shadow-sm border border-amber-100/50 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200" />
          
          <div className={`flex flex-col items-center ${leaderId === profile?.id ? 'scale-110 transition-transform' : 'opacity-70'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800/60 mb-1">{profile?.display_name || 'You'}</span>
            <div className="flex items-center gap-1.5">
              {leaderId === profile?.id && <Crown className="w-4 h-4 text-amber-500" />}
              <span className="font-serif text-2xl text-amber-900 font-bold">{myScore}</span>
            </div>
          </div>
          
          <div className="h-10 w-[1px] bg-amber-900/10" />

          <div className={`flex flex-col items-center ${leaderId === partner?.id ? 'scale-110 transition-transform' : 'opacity-70'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800/60 mb-1">{partner?.display_name || 'Partner'}</span>
            <div className="flex items-center gap-1.5">
              {leaderId === partner?.id && <Crown className="w-4 h-4 text-amber-500" />}
              <span className="font-serif text-2xl text-amber-900 font-bold">{partnerScore}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4 relative z-10 flex flex-col pb-safe">
        
        {/* Fish Catch */}
        <button onClick={() => handleShowRules('fish')} className="w-full relative overflow-hidden bg-gradient-to-br from-[#0099F7] to-[#F11712] p-5 rounded-3xl shadow-md border-0 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[140px] justify-end">
          <div className="absolute inset-0 bg-blue-900/40 mix-blend-overlay" />
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="text-white font-bold text-xs">Best: {profile?.id ? leaderboard[profile.id]?.games['fish'] || 0 : 0}</span>
          </div>
          <div className="relative z-10 text-white">
            <h3 className="font-serif text-2xl font-bold mb-1">Fish Catch</h3>
            <p className="text-sm text-white/90 font-medium">Eat small. Avoid big.</p>
            <p className="text-xs text-white/60 mt-2 uppercase tracking-widest font-bold">Difficulty: Medium</p>
          </div>
        </button>

        {/* ReflexZero */}
        <button onClick={() => handleShowRules('reflex')} className="w-full relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#334155] p-5 rounded-3xl shadow-md border-0 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[140px] justify-end">
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-white font-bold text-xs">Best: {profile?.id ? leaderboard[profile.id]?.games['reflex'] || 0 : 0}</span>
          </div>
          <div className="relative z-10 text-white">
            <h3 className="font-serif text-2xl font-bold mb-1 text-rose-500">ReflexZero</h3>
            <p className="text-sm text-slate-300 font-medium">Don't blink.</p>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">Difficulty: Hard</p>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          {/* Tic Tac Toe */}
          <button onClick={() => handleShowRules('tictactoe')} className="w-full relative overflow-hidden bg-gradient-to-br from-[#E6E6FA] to-[#D8BFD8] p-5 rounded-3xl shadow-sm border border-purple-200 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[160px]">
            <div className="absolute top-3 right-3 text-[10px] font-bold text-purple-900/40 uppercase bg-white/50 px-2 py-1 rounded-full">Easy</div>
            <div className="flex-1" />
            <h3 className="font-serif text-lg font-bold text-purple-900 leading-tight mb-1">Tic Tac<br/>Toe</h3>
            <p className="text-xs text-purple-900/60 font-medium">Wins: {profile?.id ? leaderboard[profile.id]?.games['tictactoe'] || 0 : 0}</p>
          </button>

          {/* Pop Balloons */}
          <button onClick={() => handleShowRules('balloons')} className="w-full relative overflow-hidden bg-gradient-to-br from-[#FFE4E1] to-[#FFB6C1] p-5 rounded-3xl shadow-sm border border-rose-200 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[160px]">
            <div className="absolute top-3 right-3 text-[10px] font-bold text-rose-900/40 uppercase bg-white/50 px-2 py-1 rounded-full">Medium</div>
            <div className="flex-1" />
            <h3 className="font-serif text-lg font-bold text-rose-900 leading-tight mb-1">Pop<br/>Balloons</h3>
            <p className="text-xs text-rose-900/60 font-medium">Best: {profile?.id ? leaderboard[profile.id]?.games['balloons'] || 0 : 0}</p>
          </button>

          {/* Sweet Match */}
          <button onClick={() => handleShowRules('candy')} className="w-full relative overflow-hidden bg-gradient-to-br from-[#FFC0CB] to-[#FF69B4] p-5 rounded-3xl shadow-sm border border-pink-300 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[160px]">
            <div className="absolute top-3 right-3 text-[10px] font-bold text-white/80 uppercase bg-white/20 px-2 py-1 rounded-full">Medium</div>
            <div className="flex-1" />
            <h3 className="font-serif text-lg font-bold text-white leading-tight mb-1">Sweet<br/>Match</h3>
            <p className="text-xs text-white/80 font-medium">Best: {profile?.id ? leaderboard[profile.id]?.games['candy'] || 0 : 0}</p>
          </button>

          {/* Tower Block */}
          <button onClick={() => handleShowRules('tower')} className="w-full relative overflow-hidden bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B] p-5 rounded-3xl shadow-sm border border-orange-300 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[160px]">
            <div className="absolute top-3 right-3 text-[10px] font-bold text-orange-900/40 uppercase bg-white/40 px-2 py-1 rounded-full">Hard</div>
            <div className="flex-1" />
            <h3 className="font-serif text-lg font-bold text-orange-900 leading-tight mb-1">Tower<br/>Block</h3>
            <p className="text-xs text-orange-900/70 font-medium">Best: {profile?.id ? leaderboard[profile.id]?.games['tower'] || 0 : 0}</p>
          </button>
        </div>

        {/* RPS & Chess Full Width */}
        <button onClick={() => handleShowRules('rps')} className="w-full bg-[#E8F5E9] p-5 rounded-3xl shadow-sm border border-green-200 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform mt-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-green-100">
            <span className="font-serif text-xl font-bold text-green-700">✌️</span>
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-bold text-green-900">Rock Paper Scissors</h3>
            <p className="text-xs font-medium text-green-800/60">Difficulty: Easy</p>
          </div>
          <div className="text-right">
            <span className="block text-xs font-bold text-green-900/40 uppercase">Streak</span>
            <span className="block text-xl font-serif font-bold text-green-800">{profile?.id ? leaderboard[profile.id]?.games['rps'] || 0 : 0}</span>
          </div>
        </button>

        <button onClick={() => handleShowRules('chess')} className="w-full bg-[#F5DEB3] p-5 rounded-3xl shadow-sm border border-amber-300/50 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center border border-white/40">
            <span className="font-serif text-xl font-bold text-amber-900">♟️</span>
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-bold text-amber-900">Chess</h3>
            <p className="text-xs font-medium text-amber-900/60">Difficulty: Hard</p>
          </div>
          <div className="text-right">
            <span className="block text-xs font-bold text-amber-900/40 uppercase">Wins</span>
            <span className="block text-xl font-serif font-bold text-amber-900">{profile?.id ? leaderboard[profile.id]?.games['chess'] || 0 : 0}</span>
          </div>
        </button>

      </div>

      {rulesGame && (
        <GameRulesModal 
          game={rulesGame}
          onClose={() => setRulesGame(null)}
          onStart={handleStartGame}
        />
      )}
    </div>
  )
}
