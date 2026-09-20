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
        
        {/* Fish Catch: Ocean */}
        <button onClick={() => handleShowRules('fish')} className="w-full relative overflow-hidden bg-gradient-to-b from-blue-400 to-blue-600 p-5 rounded-3xl shadow-lg border border-blue-300/50 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[160px] group">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDQwIEMyMCAyMCAxMCAxMCAxMCAwIiBzdHJva2U9IiNGRkYiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] animate-[pulse_4s_ease-in-out_infinite]" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
              <span className="text-white font-bold text-xs">Best: {profile?.id ? leaderboard[profile.id]?.games['fish'] || 0 : 0}</span>
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full">
              <span className="text-white/90 font-bold text-[10px] uppercase tracking-wider">Medium</span>
            </div>
          </div>
          
          <div className="flex-1" />
          
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <h3 className="font-serif text-3xl font-bold text-white mb-1 drop-shadow-md">Fish Catch</h3>
              <p className="text-sm text-blue-50 font-medium opacity-90">Eat small. Avoid big.</p>
            </div>
            <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-blue-50 transition-colors">
              <span className="font-bold text-sm">▶</span>
            </div>
          </div>
        </button>

        {/* ReflexZero: Cyber */}
        <button onClick={() => handleShowRules('reflex')} className="w-full relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-black p-5 rounded-3xl shadow-lg border border-purple-500/30 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[160px] group">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="bg-purple-900/40 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-fuchsia-100 font-bold text-xs">Best: {profile?.id ? leaderboard[profile.id]?.games['reflex'] || 0 : 0}</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/30">
              <span className="text-red-400 font-bold text-[10px] uppercase tracking-wider">Hard</span>
            </div>
          </div>
          
          <div className="flex-1" />
          
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <h3 className="font-sans text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-1 tracking-tight">REFLEX_ZERO</h3>
              <p className="text-sm text-indigo-200 font-medium opacity-90">Don't blink.</p>
            </div>
            <div className="w-10 h-10 bg-fuchsia-500 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.5)] group-hover:bg-fuchsia-400 transition-colors">
              <span className="font-bold text-sm">▶</span>
            </div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          {/* Tic Tac Toe: Wood */}
          <button onClick={() => handleShowRules('tictactoe')} className="w-full relative overflow-hidden bg-[#8B5A2B] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjOEI1QTJCIi8+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjN0E0QTIzIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] p-4 rounded-3xl shadow-lg border-2 border-[#5C3A18] flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[180px] group">
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
            
            <div className="relative z-10 flex justify-between items-start mb-2">
              <div className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md border border-black/20">
                <span className="text-amber-100 font-bold text-[10px] uppercase">Easy</span>
              </div>
            </div>
            
            <div className="relative z-10 bg-[#E8DCC4] rounded-xl p-2 mb-2 shadow-inner border-2 border-[#5C3A18] flex items-center justify-center">
              <span className="text-2xl font-black text-[#5C3A18]">X O</span>
            </div>
            
            <div className="flex-1" />
            
            <div className="relative z-10">
              <h3 className="font-serif text-xl font-bold text-[#FFD700] drop-shadow-md mb-0.5 leading-tight">Tic Tac<br/>Toe</h3>
              <p className="text-xs text-amber-100/90 font-medium mb-2">Wins: {profile?.id ? leaderboard[profile.id]?.games['tictactoe'] || 0 : 0}</p>
              <div className="w-full bg-[#5C3A18] text-amber-100 rounded-xl py-1.5 text-center font-bold text-xs uppercase tracking-wider group-hover:bg-[#4A2E13] transition-colors border border-black/30 shadow-sm">Play</div>
            </div>
          </button>

          {/* Pop Balloons: Carnival */}
          <button onClick={() => handleShowRules('balloons')} className="w-full relative overflow-hidden bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 p-4 rounded-3xl shadow-lg border border-pink-300 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[180px] group">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_4px,_white_4px,_white_100%)] bg-[length:16px_16px]" />
            
            <div className="relative z-10 flex justify-between items-start mb-2">
              <div className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/40">
                <span className="text-white font-bold text-[10px] uppercase">Medium</span>
              </div>
            </div>
            
            <div className="relative z-10 flex justify-center mb-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md animate-bounce" style={{animationDuration: '2s'}}>
                <span className="text-2xl">🎈</span>
              </div>
            </div>
            
            <div className="flex-1" />
            
            <div className="relative z-10">
              <h3 className="font-serif text-xl font-black text-white drop-shadow-md mb-0.5 leading-tight">Pop<br/>Balloons</h3>
              <p className="text-xs text-pink-50 font-medium mb-2 drop-shadow-sm">Best: {profile?.id ? leaderboard[profile.id]?.games['balloons'] || 0 : 0}</p>
              <div className="w-full bg-white text-rose-500 rounded-xl py-1.5 text-center font-bold text-xs uppercase tracking-wider group-hover:bg-pink-50 transition-colors shadow-sm">Play</div>
            </div>
          </button>

          {/* Sweet Match: Candy */}
          <button onClick={() => handleShowRules('candy')} className="w-full relative overflow-hidden bg-gradient-to-br from-fuchsia-300 via-pink-300 to-rose-300 p-4 rounded-3xl shadow-lg border border-white/50 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[180px] group">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            
            <div className="relative z-10 flex justify-between items-start mb-2">
              <div className="bg-pink-500/20 backdrop-blur-sm px-2 py-1 rounded-full border border-pink-400/30">
                <span className="text-pink-900 font-bold text-[10px] uppercase">Medium</span>
              </div>
            </div>
            
            <div className="relative z-10 flex justify-center mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white rotate-12">
                <span className="text-2xl drop-shadow-sm">🍬</span>
              </div>
            </div>
            
            <div className="flex-1" />
            
            <div className="relative z-10">
              <h3 className="font-sans text-xl font-black text-pink-900 mb-0.5 leading-tight">Sweet<br/>Match</h3>
              <p className="text-xs text-pink-800 font-bold mb-2">Best: {profile?.id ? leaderboard[profile.id]?.games['candy'] || 0 : 0}</p>
              <div className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl py-1.5 text-center font-bold text-xs uppercase tracking-wider group-hover:from-pink-600 group-hover:to-rose-600 transition-colors shadow-md border border-pink-400">Play</div>
            </div>
          </button>

          {/* Tower Block: Sunset */}
          <button onClick={() => handleShowRules('tower')} className="w-full relative overflow-hidden bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-400 p-4 rounded-3xl shadow-lg border border-orange-400 flex flex-col text-left hover:scale-[1.02] transition-transform min-h-[180px] group">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
            
            <div className="relative z-10 flex justify-between items-start mb-2">
              <div className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                <span className="text-white font-bold text-[10px] uppercase">Hard</span>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center mb-2 gap-0.5">
              <div className="w-6 h-3 bg-white/90 rounded-sm shadow-sm" />
              <div className="w-6 h-3 bg-white/80 rounded-sm shadow-sm translate-x-1" />
              <div className="w-6 h-3 bg-white/70 rounded-sm shadow-sm -translate-x-1" />
            </div>
            
            <div className="flex-1" />
            
            <div className="relative z-10">
              <h3 className="font-sans text-xl font-black text-white drop-shadow-md mb-0.5 leading-tight">Tower<br/>Block</h3>
              <p className="text-xs text-orange-50 font-medium mb-2 drop-shadow-sm">Best: {profile?.id ? leaderboard[profile.id]?.games['tower'] || 0 : 0}</p>
              <div className="w-full bg-white text-orange-600 rounded-xl py-1.5 text-center font-bold text-xs uppercase tracking-wider group-hover:bg-orange-50 transition-colors shadow-sm">Play</div>
            </div>
          </button>
        </div>

        {/* RPS: Green */}
        <button onClick={() => handleShowRules('rps')} className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-500 p-5 rounded-3xl shadow-lg border border-emerald-300 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform group">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')]" />
          
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner relative z-10">
            <span className="font-serif text-3xl font-bold text-white drop-shadow-sm">✌️</span>
          </div>
          
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-sans text-xl font-black text-white drop-shadow-sm">Rock Paper Scissors</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-800/30 text-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Easy</span>
              <span className="text-sm font-bold text-emerald-50">Streak: {profile?.id ? leaderboard[profile.id]?.games['rps'] || 0 : 0}</span>
            </div>
          </div>
          
          <div className="w-10 h-10 bg-white text-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-emerald-50 transition-colors relative z-10 shrink-0">
            <span className="font-bold text-sm">▶</span>
          </div>
        </button>

        {/* Chess: Wood */}
        <button onClick={() => handleShowRules('chess')} className="w-full relative overflow-hidden bg-gradient-to-r from-amber-700 to-amber-900 p-5 rounded-3xl shadow-lg border border-amber-600 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform group">
          <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDIwaDQwTTIwIDB2NDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] mix-blend-overlay" />
          
          <div className="w-14 h-14 bg-[#F5DEB3] rounded-2xl flex items-center justify-center border-2 border-[#D2B48C] shadow-inner relative z-10">
            <span className="font-serif text-3xl font-bold drop-shadow-sm text-amber-900">♞</span>
          </div>
          
          <div className="flex-1 relative z-10">
            <h3 className="font-serif text-2xl font-bold text-[#F5DEB3] drop-shadow-sm mb-1">Chess</h3>
            <div className="flex items-center gap-2">
              <span className="bg-black/40 text-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Hard</span>
              <span className="text-sm font-bold text-amber-100">Wins: {profile?.id ? leaderboard[profile.id]?.games['chess'] || 0 : 0}</span>
            </div>
          </div>
          
          <div className="w-10 h-10 bg-[#F5DEB3] text-amber-900 rounded-full flex items-center justify-center shadow-lg group-hover:bg-white transition-colors relative z-10 shrink-0">
            <span className="font-bold text-sm">▶</span>
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
