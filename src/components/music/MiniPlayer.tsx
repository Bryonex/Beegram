import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Music, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

export function MiniPlayer() {
  const { currentTrack, isPlaying, play, pause, currentTime, duration, isMiniPlayerMinimized, setMinimized } = useAudioPlayer()
  const navigate = useNavigate()
  const location = useLocation()

  // Do not show miniplayer on /songs or /login
  if (location.pathname === '/songs' || location.pathname === '/login' || location.pathname === '/' || isMiniPlayerMinimized) {
    return null
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={() => navigate('/songs')}
          className="fixed left-0 right-0 z-40 px-4 cursor-pointer"
          style={{
            bottom: 'var(--beegram-nav-offset, calc(4rem + env(safe-area-inset-bottom)))'
          }}
        >
          <div className="w-full max-w-md mx-auto bg-midnightPlum/95 backdrop-blur-xl border border-lavender-dark/50 rounded-2xl p-2.5 flex items-center gap-3 shadow-float">
            {/* Cover */}
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-lavender-dark/40 relative flex items-center justify-center">
              {currentTrack.coverUrl ? (
                <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Music className="w-5 h-5 text-lavender-pale/30" />
              )}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                   <div className="flex gap-0.5 items-end h-3">
                      <div className="w-1 bg-lavender-mist animate-pulse h-2" />
                      <div className="w-1 bg-lavender-mist animate-pulse h-3" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 bg-lavender-mist animate-pulse h-1.5" style={{ animationDelay: '0.2s' }} />
                   </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-serif text-lavender-mist truncate">{currentTrack.title}</h4>
              <p className="text-[10px] uppercase tracking-wider text-lavender-pale font-sans truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pr-1 shrink-0" onClick={e => e.stopPropagation()}>
              <button 
                onClick={isPlaying ? pause : play}
                className="w-10 h-10 flex items-center justify-center text-lavender-mist active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
                className="w-8 h-8 flex items-center justify-center text-lavender-pale hover:text-lavender-mist active:scale-95 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Minimal Progress Bar (Absolute along the bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 rounded-b-2xl overflow-hidden">
              <div 
                className="h-full bg-lavender-pale transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
